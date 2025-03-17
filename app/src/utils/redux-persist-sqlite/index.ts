//language=SQLite
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { sqlite } from 'utils/sharedSQLiteInstance';

//language=SQLite
const REDUX_PERSIST_DB_MIGRATIONS_1 = [
  `CREATE TABLE REDUX_PERSIST
   (
     ID   VARCHAR NOT NULL PRIMARY KEY,
     DATA BLOB    NOT NULL
   );`
];

const CACHE_UNAVAILABLE = 'Cache unavailable';

export class SQLiteStorage {
  private static CACHE_DB_NAME = 'redux-persist.db';
  private cacheDB: SQLiteDBConnection | null = null;

  private initialized = false;
  private initializationPromise: Promise<void> | undefined = undefined;

  constructor() {}

  async getItem(key: string): Promise<string | null> {
    if (!this.initialized) {
      await this.initializeDatabase();
    }
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    try {
      const result = await this.cacheDB.query(
        //language=SQLite`
        `SELECT ID, DATA
         FROM REDUX_PERSIST
         WHERE ID = ?`,
        [key]
      );
      if (result.values && result.values.length > 0) {
        return result.values[0]['DATA'];
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async clear() {
    if (!this.initialized) {
      await this.initializeDatabase();
    }
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    try {
      await this.cacheDB.query(
        //language=SQLite`
        `DELETE
         FROM REDUX_PERSIST`
      );
    } catch (error) {
      console.error(error);
    }
  }

  async setItem(key, value) {
    if (!this.initialized) {
      await this.initializeDatabase();
    }
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    try {
      await this.cacheDB.query(
        //language=SQLite`
        `INSERT INTO REDUX_PERSIST(ID, DATA)
         VALUES (?, ?)
         ON CONFLICT(ID)
           DO UPDATE SET DATA = excluded.DATA`,
        [key, value]
      );
    } catch (error) {
      console.error(error);
    }
  }

  async removeItem(key: string) {
    if (!this.initialized) {
      await this.initializeDatabase();
    }
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    try {
      await this.cacheDB.query(
        //language=SQLite`
        `DELETE
         FROM REDUX_PERSIST
         WHERE ID = ?`,
        [key]
      );
    } catch (error) {
      console.error(error);
    }
  }

  async getAllKeys() {
    if (!this.initialized) {
      await this.initializeDatabase();
    }
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    try {
      const result = await this.cacheDB.query(
        //language=SQLite`
        `SELECT ID
         FROM REDUX_PERSIST`
      );
      return result.values?.map((v) => v['ID']) || [];
    } catch (error) {
      console.error(error);
    }
  }

  private async initializeDatabase() {
    if (this.initializationPromise == undefined) {
      // allow other callers to wait for this initialization attempt to finish
      this.initializationPromise = (async () => {
        await sqlite.addUpgradeStatement(SQLiteStorage.CACHE_DB_NAME, [
          {
            toVersion: 1,
            statements: REDUX_PERSIST_DB_MIGRATIONS_1
          }
        ]);

        const ret = await sqlite.checkConnectionsConsistency();
        const isConn = (await sqlite.isConnection(SQLiteStorage.CACHE_DB_NAME, false)).result;

        if (ret.result && isConn) {
          this.cacheDB = await sqlite.retrieveConnection(SQLiteStorage.CACHE_DB_NAME, false);
        } else {
          this.cacheDB = await sqlite.createConnection(SQLiteStorage.CACHE_DB_NAME, false, 'no-encryption', 1, false);
        }

        try {
          await this.cacheDB.open().catch((e) => {
            console.error(e);
          });
          this.initialized = true;
        } catch (err) {
          console.error(err);
        }
      })();
    }

    // an initialization call was just started or was already in progress. wait for it and then return.
    return await this.initializationPromise;
  }
}
