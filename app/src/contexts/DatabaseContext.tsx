import { JsonColumn } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { GeoJSONObject } from '@turf/turf';
import { DocType } from 'constants/database';
import PouchDB from 'pouchdb-core';
import PouchDBFind from 'pouchdb-find';
import PouchDBUpsert from 'pouchdb-upsert';
import React, { useEffect, useState, useCallback } from 'react';

import { useSQLite } from 'react-sqlite-hook/dist';
import { isNull } from 'util';

const DB_SCHEMA = process.env.REACT_APP_DB_SCHEMA || 'invasivesbc';

export type IDatabaseContext = {
  // sqlite stuff:
  sqlite?: any;
  sqliteDB?: any;

  //pouch stuff:
  database?: PouchDB.Database<any>;
  resetDatabase?: () => void;
};

const createDB = () => {
  if (Capacitor.getPlatform() == 'web') {
    return React.createContext<IDatabaseContext>({ database: null, resetDatabase: () => {} });
  } else {
    let sqlite: any;
    return React.createContext<IDatabaseContext>({ sqlite: sqlite, sqliteDB: null });
  }
};
export const DatabaseContext = createDB();

/**
 * Provides access to the database and to related functions to manipulate the database instance.
 *
 * @param {*} props
 */
export const DatabaseContextProvider: React.FC = (props) => {
  const [databaseContext, setDatabaseContext] = useState<IDatabaseContext>({
    sqlite: null,
    sqliteDB: null,
    database: null,
    resetDatabase: () => {}
  });

  /**
   * Create the database using mobile plugins/settings.
   */
  const createMobileDatabase = (): PouchDB.Database<any> => {
    PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite')); // adds mobile adapter

    return new PouchDB(DB_SCHEMA, {
      adapter: 'cordova-sqlite',
      // See https://www.npmjs.com/package/cordova-sqlite-storage for details on the below options
      iosDatabaseLocation: 'default',
      androidDatabaseProvider: 'system',
      auto_compaction: true
    } as any);
  };

  /**
   * Create the database using standard (non-mobile) plugins/settings.
   */
  const createDatabase = (): PouchDB.Database<any> => {
    PouchDB.plugin(require('pouchdb-adapter-idb').default); // add sbrowser adapter

    return new PouchDB(DB_SCHEMA, { adapter: 'idb' });
  };
  /*
  const {
    echo,
    getPlatform,
    createConnection,
    closeConnection,
    retrieveConnection,
    retrieveAllConnections,
    closeAllConnections,
    addUpgradeStatement,
    importFromJson,
    isJsonValid,
    copyFromAssets,
    isAvailable
  } = useSQLite();*/

  /**
   * Create the database.
   */
  const setupDatabase = useCallback(async () => {
    /* if (Capacitor.getPlatform() == 'ios' || Capacitor.getPlatform() == 'android') {
      if (databaseContext.sqlite) {
        return;
      }

      let sqlite = {
        echo: echo,
        getPlatform: getPlatform,
        createConnection: createConnection,
        closeConnection: closeConnection,
        retrieveConnection: retrieveConnection,
        retrieveAllConnections: retrieveAllConnections,
        closeAllConnections: closeAllConnections,
        addUpgradeStatement: addUpgradeStatement,
        importFromJson: importFromJson,
        isJsonValid: isJsonValid,
        copyFromAssets: copyFromAssets,
        isAvailable: isAvailable
      };

      console.log('about to open db');
      let db = await openConnection(sqlite);
   //   setDatabaseContext({ sqlite: sqlite, sqliteDB: db });
   //   createSqliteTables(databaseContext);
    } else */ {
      let db = databaseContext.database;
      if (db) {
        return;
      }

      PouchDB.plugin(PouchDBFind); // adds find query support
      PouchDB.plugin(PouchDBUpsert); // adds upsert query support

      if (window['cordova']) {
        db = createMobileDatabase();
      } else {
        db = createDatabase();
      }
      db.createIndex({ index: { ddoc: 'notificationsIndex', fields: ['docType', 'acknowledged'] } });
      db.createIndex({ index: { ddoc: 'activitiesIndex', fields: ['docType', 'activityType'] } });
      db.createIndex({ index: { ddoc: 'formStatusIndex', fields: ['docType', 'formStatus', 'sync.ready'] } });
      db.createIndex({ index: { ddoc: 'docTypeIndex', fields: ['docType', 'trip_ID'] } });
      db.createIndex({ index: { ddoc: 'tripDocTypeIndex', fields: ['trip_ID', 'docType'] } });
      db.createIndex({ index: { ddoc: 'tripIDIndex', fields: ['docType', 'trip_IDs'] } });

      /**
       * Destroy and re-create the database.
       */
      const resetDatabase = async (database) => {
        if (!database) {
          return;
        }

        await database.destroy();
        await setupDatabase();
      };
      setDatabaseContext({ database: db, resetDatabase: () => resetDatabase(db) });
    }
  }, [databaseContext.database]);

  /**
   * Close the database.
   *
   * Note: This only closes any active connections/listeners, and does not destory the actual database or its content.
   */
  const cleanupDatabase = useCallback(async () => {
    let db = databaseContext.database;

    if (!db) {
      return;
    }

    await db.close();
  }, []);

  useEffect(() => {
    setupDatabase();

    const callCleanupDatabase = async () => {
      //   await cleanupDatabase();
    };

    callCleanupDatabase();
  }, [setupDatabase, cleanupDatabase]);

  return <DatabaseContext.Provider value={databaseContext}>{props.children}</DatabaseContext.Provider>;
};

export const createSqliteTables = async (databaseContext) => {
  // initialize the connection
  let db;
  if (databaseContext.sqliteDB) {
    db = databaseContext.sqliteDB;
  } else {
    await setTimeout(() => {
      console.log('waiting to create tables');
    }, 1000);
  }
  let ret;

  let setupSQL = ``;
  for (const value of enumKeys(DocType)) {
    switch (value) {
      case 'REFERENCE_ACTIVITY':
        setupSQL +=
          'create table if not exists ' +
          DocType[value] +
          ` (
            id TEXT PRIMARY KEY,
            json TEXT
          );\n`;
        break;
      case 'REFERENCE_POINT_OF_INTEREST':
        setupSQL +=
          'create table if not exists ' +
          DocType[value] +
          ` (
            id TEXT PRIMARY KEY,
            json TEXT
          );\n`;
        break;
      default:
        setupSQL +=
          'create table if not exists ' +
          DocType[value] +
          ` (
            id INTEGER PRIMARY KEY,
            json TEXT
          );\n`;
    }
  }
  //in sqlite doctypes will get their own table
  ret = await db.execute(setupSQL);
  if (!ret.result) {
    //console.log('closing database - no result');
    //db.close();
    return false;
  } else {
    //console.log('closing database with result');
    //db.close();
    return ret.result;
  }
};

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}
