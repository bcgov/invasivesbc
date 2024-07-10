import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

import { defineCustomElements } from 'jeep-sqlite/loader';
import MIGRATE_VERSION_100 from './migrations/100';

/*
 * Provide an entry point for SQLite related calls (handle initialization, migration, etc.)
 *
 * Normally only used on mobile, but can be tested on web when VITE_MOBILE is defined (and will initialize jeep-sqlite
 * for this purpose)
 * */

class SQLiteInterface {
  private DATABASE_NAME = 'InvasivesBC.db';
  private DATABASE_VERSION = 100;

  private sqlitePlugin = CapacitorSQLite;
  private sqlite = new SQLiteConnection(this.sqlitePlugin);

  private jeep = false;

  private initialized = false;
  private _deferredReady: (() => void) | null = null;
  private ready = new Promise<void>((resolve) => {
    this._deferredReady = resolve;
  });

  private connection: SQLiteDBConnection | null = null;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    switch (import.meta.env.VITE_TARGET_PLATFORM) {
      case 'web': {
        this.jeep = true;
        // on web we wait for jeepSQLite to be loaded to provide compatibility.
        await defineCustomElements(window);
        const jeepSqliteElement = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepSqliteElement);
        await window.customElements.whenDefined('jeep-sqlite');

        console.log('jeep ready');

        const jeepSqliteEl = document.querySelector('jeep-sqlite');
        if (jeepSqliteEl != null) {
          await this.sqlite.initWebStore();
          await jeepSqliteEl.isStoreOpen();
        } else {
          console.error('Jeep SQLite initialization failure');
        }

        break;
      }
    }

    await this.sqlite.addUpgradeStatement(this.DATABASE_NAME, [
      {
        toVersion: 100,
        statements: MIGRATE_VERSION_100
      }
    ]);

    if (
      (await this.sqlite.checkConnectionsConsistency()).result &&
      (await this.sqlite.isConnection(this.DATABASE_NAME, false))
    ) {
      // there is already a connection (maybe this is an ios page reload and native already has a connection)
      this.connection = await this.sqlite.retrieveConnection(this.DATABASE_NAME, false);
    } else {
      this.connection = await this.sqlite.createConnection(
        this.DATABASE_NAME,
        false,
        'no-encryption',
        this.DATABASE_VERSION,
        false
      );
      if (this.connection == null) {
        throw new Error('Could not open database connection');
      }
    }

    await this.connection.open();

    if (this._deferredReady !== null) {
      this._deferredReady();
    }
  }

  async getConnection(): Promise<SQLiteDBConnection> {
    if (!this.initialized) {
      await this.init();
      await this.ready;
    }
    console.log('ready now');
    if (this.connection !== null) {
      console.log('passing connection: ');
      console.dir(this.connection);
      return this.connection;
    }
    throw new Error('no connection available');
  }

  async flush() {
    if (!this.jeep) {
      // this operation only makes sense on web/jeep, where the memory db must be flushed to long term storage.
      return;
    }
    if (this.sqlite && this.connection) {
      await this.sqlite.saveToStore(this.DATABASE_NAME);
    }
  }

  private checkOpen(): void {
    if (this.sqlite == null) {
      console.error('no conn');
      throw new Error(`no connection`);
    }
  }
}

const sqliteSingleton = new SQLiteInterface();

export { SQLiteInterface, sqliteSingleton };
