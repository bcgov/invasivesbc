import { JsonColumn } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { DocType } from 'constants/database';
import PouchDB from 'pouchdb-core';
import PouchDBFind from 'pouchdb-find';
import PouchDBUpsert from 'pouchdb-upsert';
import React, { useEffect, useState, useCallback } from 'react';

import { useSQLite } from 'react-sqlite-hook/dist';

const DB_SCHEMA = process.env.REACT_APP_DB_SCHEMA || 'invasivesbc';

export type IDatabaseContext = {
  // sqlite stuff:
  sqlite?: any;

  //pouch stuff:
  database?: PouchDB.Database<any>;
  resetDatabase?: () => void;
};

const createDB = () => {
  if (false) {
    return React.createContext<IDatabaseContext>({ database: null, resetDatabase: () => {} });
  } else {
    let sqlite: any;
    return React.createContext<IDatabaseContext>({ sqlite: sqlite });
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
  } = useSQLite();

  /**
   * Create the database.
   */
  const setupDatabase = useCallback(async () => {
    if (Capacitor.getPlatform() == 'ios' || Capacitor.getPlatform() == 'android') {
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
      setDatabaseContext({ sqlite: sqlite });
      createSqliteTables(sqlite);
    } else {
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
      await cleanupDatabase();
    };

    callCleanupDatabase();
  }, [setupDatabase, cleanupDatabase]);

  return <DatabaseContext.Provider value={databaseContext}>{props.children}</DatabaseContext.Provider>;
};

/* db query wrapper interface to hide db implementation */
export enum QueryType {
  DOC_TYPE_AND_ID = 'docType and ID',
  DOC_TYPE = 'docType',
  RAW_SQL = 'raw sql'
}
export interface IQuery {
  type?: QueryType; // placeholder - might use to dictate what db
  ID?: string;
  docType?: DocType;
  sql?: string;
}
export const query = async (queryConfig: IQuery, databaseContext: any) => {
  if (Capacitor.getPlatform() != 'web') {
    const adb = databaseContext.sqlite;

    // initialize the connection
    const db = await adb.createConnection('localInvasivesBC', false, 'no-encryption', 1);

    let ret: any; //= await deleteDatabase(db);

    ret = await db.open();
    if (!ret.result) {
      return false;
    }

    //get by id.   also need to know doctype: in sqlite we doctypes will get their own table
    if (queryConfig.type == QueryType.DOC_TYPE_AND_ID) {
      ret = await db.execute('select * from ' + queryConfig.docType + ' where id = ' + queryConfig.ID);
      if (!ret.result) {
        alert(JSON.stringify(ret));
        db.close();
        return false;
      } else {
        db.close();
        return ret.result;
      }
    }

    //get by doctype.  in sqlite we doctypes will get their own table
    if (queryConfig.type == QueryType.DOC_TYPE && queryConfig.docType) {
      ret = await db.execute('select * from ' + queryConfig.docType);
      if (!ret.result) {
        alert(JSON.stringify(ret));
        db.close();
        return false;
      } else {
        db.close();
        return ret.result;
      }
    }

    // raw sql query
    if (queryConfig.type == QueryType.RAW_SQL && queryConfig.sql) {
      ret = await db.execute(queryConfig.sql);
      if (!ret.result) {
        alert(JSON.stringify(ret));
        db.close();
        return false;
      } else {
        db.close();
        return ret.result;
      }
    }

    alert(
      'Your sqlite query needs a QueryType and corresponding parameters.  What you provided:  ' +
        JSON.stringify(queryConfig)
    );
  }
};

/* db query wrapper interface to hide db implementation */
export enum UpsertType {
  DOC_TYPE_AND_ID = 'docType and ID',
  DOC_TYPE = 'docType',
  RAW_SQL = 'raw sql'
}
export interface IUpsert {
  type?: UpsertType; // placeholder - might use to dictate what db
  ID?: string;
  docType?: DocType;
  sql?: string;
  json?: Object;
}
export const upsert = async (upsertConfigs: Array<IUpsert>, databaseContext: any) => {
  for (const upsertConfig of upsertConfigs) {
    if (Capacitor.getPlatform() != 'web') {
      const adb = databaseContext.sqlite;

      // initialize the connection
      const db = await adb.createConnection('localInvasivesBC', false, 'no-encryption', 1);

      let ret: any; //= await deleteDatabase(db);

      ret = await db.open();
      if (!ret.result) {
        return false;
      }

      //get by id.  true upserts
      if (upsertConfig.type == UpsertType.DOC_TYPE_AND_ID) {
        ret = await db.execute('update ' + upsertConfig.docType + " set json = ('" + escape(JSON.stringify(upsertConfig.json)) + "') where id = " + upsertConfig.ID + ';');
        if (!ret.result) {
          alert(JSON.stringify(ret));
          db.close();
          return false;
        } else {
          db.close();
          return ret.result;
        }
      }

      // no ID present therefore these are inserts
      if (upsertConfig.type == UpsertType.DOC_TYPE && upsertConfig.docType) {
        ret = await db.execute('insert into ' + upsertConfig.docType + " (json) values ('" + escape(JSON.stringify(upsertConfig.json)) + "' );");
       // ret = await db.execute('insert into ' + upsertConfig.docType + ' (json) values ("banana");');
        if (!ret.result) {
          alert(JSON.stringify(ret));
          db.close();
          return false;
        } else {
          db.close();
          return ret.result;
        }
      }

      // raw sql.
      if (upsertConfig.type == UpsertType.RAW_SQL && upsertConfig.sql) {
        ret = await db.execute(upsertConfig.sql);
        if (!ret.result) {
          alert(JSON.stringify(ret));
          db.close();
          return false;
        } else {
          db.close();
          return ret.result;
        }
      }

      alert(
        'Your sqlite query needs a UpsertType and corresponding parameters.  What you provided:  ' +
          JSON.stringify(upsertConfig)
      );
    }
  }
};

export const createSqliteTables = async (adb: any) => {
  // initialize the connection
  const db = await adb.createConnection('localInvasivesBC', false, 'no-encryption', 1);

  // check if the databases exist
  // and delete it for multiple successive tests
  let ret: any; //= await deleteDatabase(db);

  // open db testNew
  ret = await db.open();
  if (!ret.result) {
    return false;
  }

  let setupSQL = ``;
  for (const value of enumKeys(DocType)) {
    setupSQL +=
      'create table if not exists ' +
      DocType[value] +
      ` (
        id INTEGER PRIMARY KEY,
        json TEXT
      );\n`;
  }
  //get by id.   also need to know doctype: in sqlite we doctypes will get their own table
  ret = await db.execute(setupSQL);
  if (!ret.result) {
    alert(JSON.stringify(ret));
    db.close();
    return false;
  } else {
    db.close();
    return ret.result;
  }
};

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}
