import { JsonColumn } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { GeoJSONObject } from '@turf/turf';
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
  if (Capacitor.getPlatform() == 'web') {
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
  DOC_TYPE_AND_TRIP_ID = 'docType and trip_ID', //todo
  DOC_TYPE_AND_BOUNDING_POLY = 'docType and bounding poly',
  RAW_SQL = 'raw sql'
}
export interface IQuery {
  type?: QueryType; // placeholder - might use to dictate what db
  ID?: string;
  docType?: DocType;
  sql?: string;
  boundingPoly?: GeoJSONObject;
  geosOnly?: boolean;
  limit?: number;
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

    switch (queryConfig.type) {
      case QueryType.DOC_TYPE_AND_ID:
        ret = await db.query('select * from ' + queryConfig.docType + ' where id = ' + queryConfig.ID + ';\n');
        if (!ret.values) {
          db.close();
          return false;
        } else {
          db.close();
          return ret.values;
        }
      case QueryType.DOC_TYPE:
        ret = await db.query(
          'select * from ' + queryConfig.docType + (queryConfig.limit > 0 ? ' limit ' + queryConfig.limit + ';' : ';')
        );
        if (!ret.values) {
          db.close();
          return false;
        } else {
          db.close();
          return ret.values;
        }
      case QueryType.RAW_SQL:
        ret = await db.query(queryConfig.sql);
        if (!ret.values) {
          db.close();
          return false;
        } else {
          db.close();
          return ret.values;
        }
        break;
      case QueryType.DOC_TYPE_AND_BOUNDING_POLY:
        return await getByDocTypeAndBoudingPoly(queryConfig, db);
      default:
        alert(
          'Your sqlite query needs a QueryType and corresponding parameters.  What you provided:  ' +
            JSON.stringify(queryConfig)
        );
    }
  }
};

const getByDocTypeAndBoudingPoly = async (queryConfig: IQuery, db: any) => {
  return false;
};

/* db query wrapper interface to hide db implementation */
export enum UpsertType {
  DOC_TYPE_AND_ID = 'docType and ID',
  DOC_TYPE_AND_ID_FAST_JSON_PATCH = 'docType and ID - FAST JSON PATCH', // uses sqlitejson1 extension when I get it working
  DOC_TYPE_AND_ID_SLOW_JSON_PATCH = 'docType and ID - SLOW JSON PATCH', // workaround, all of these need to have same doctype
  DOC_TYPE = 'docType',
  RAW_SQL = 'raw sql'
}
export interface IUpsert {
  type?: UpsertType; // placeholder - might use to dictate what db
  ID?: string;
  docType?: DocType;
  sql?: string;
  json?: Object;
  geo?: GeoJSONObject; //todo - give geo it's own column so we can fetch many geos locally fast
  trip_ID?: number; //todo - give a trip number for handling cache management
}

// v1: assumes all upsertconfigs are the same, will allow for multiple in v2
export const upsert = async (upsertConfigs: Array<IUpsert>, databaseContext: any) => {
  let batchUpdate = '';
  const adb = databaseContext.sqlite;
  const db = await adb.createConnection('localInvasivesBC', false, 'no-encryption', 1);

  let totalRecordsChanged = 0;

  let ret: any;
  ret = await db.open();

  // workaround until we get json1 extension working:
  //TODO: change to return a count and share db like the other ones:
  const patchSlowUpserts = await upsertConfigs.filter((e) => e.type == UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH);
  processSlowUpserts(patchSlowUpserts, databaseContext);

  const docTypeAndIDUpserts = await upsertConfigs.filter((e) => e.type == UpsertType.DOC_TYPE_AND_ID);
  if (docTypeAndIDUpserts.length > 1) {
    batchUpdate = buildSQLStringDOC_TYPE_AND_ID(docTypeAndIDUpserts);
    ret = await handleExecute(batchUpdate, db);
    if (ret != false) {
      totalRecordsChanged += ret;
    } else {
      console.log('problem executing DOC_TYPE_AND_ID upserts:');
      console.log('db failed upsert @' + totalRecordsChanged + ' records');
    }
  }

  batchUpdate = '';
  const everythingElse = await upsertConfigs.filter((e) => e.type != UpsertType.DOC_TYPE_AND_ID);
  for (const upsertConfig of everythingElse) {
    if (Capacitor.getPlatform() != 'web') {
      // initialize the connection
      // ret = db.execute(`select load_extension('json1');`); // not yet working

      switch (upsertConfig.type) {
        // full override update/upsert - json is replaced with new json
        /*   case UpsertType.DOC_TYPE_AND_ID:
          //the linter formatted this not me
          batchUpdate +=
            `insert into ` +
            upsertConfig.docType +
            ` (id,json) values ('` +
            upsertConfig.ID +
            `','` +
            JSON.stringify(upsertConfig.json).split(`'`).join(`''`) +
            //JSON.stringify(upsertConfig.json) +
            `') on conflict(id) do update set json=excluded.json;\n`;
          break;
          */
        // json patch upsert:
        case UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH:
          break;
        case UpsertType.DOC_TYPE_AND_ID_FAST_JSON_PATCH:
          batchUpdate +=
            `insert into ` +
            upsertConfig.docType +
            ` (id,json) values ('` +
            upsertConfig.ID +
            `','` +
            JSON.stringify(upsertConfig.json).split(`'`).join(`''`) +
            //JSON.stringify(upsertConfig.json) +
            `') on conflict(id) do update set json_patch(json,excluded.json);\n`;
          break;
        // no ID present therefore these are inserts
        case UpsertType.DOC_TYPE:
          batchUpdate +=
            `insert into ` +
            upsertConfig.docType +
            ` (json) values ('` +
            JSON.stringify(upsertConfig.json).split(`'`).join(`''`) +
            `')\n;`;
          break;
        // raw sql.
        case UpsertType.RAW_SQL:
          batchUpdate += upsertConfig.sql;
          break;
        default:
          alert(
            'Your sqlite query needs a UpsertType and corresponding parameters.  What you provided:  ' +
              JSON.stringify(upsertConfig)
          );
      }
    }
  }
  ret = await handleExecute(batchUpdate, db);
  if (ret !== false) {
    totalRecordsChanged += ret;
  } else {
    console.log('problem executing other upserts:');
    console.log('db failed upsert @' + totalRecordsChanged + ' records');
  }

  return totalRecordsChanged;
};

const handleExecute = async (input: string, db: any) => {
  let ret: any;
  let batchUpdate = input;
  if (batchUpdate !== '') {
    ret = await db.execute(batchUpdate);
    if (!ret.changes) {
      db.close();
      return false;
    } else {
      db.close();
      return ret.changes.changes;
    }
  } else {
    return 0;
  }
};
//limit to all being the same type for now:
const buildSQLStringDOC_TYPE_AND_ID = (upsertConfigs: Array<IUpsert>) => {
  let batchUpdate = '';
  if (upsertConfigs.length > 0) {
    batchUpdate += `insert into ` + upsertConfigs[0].docType + ` (id,json) values `;
    let rowCounter = 0;
    for (const upsertConfig of upsertConfigs) {
      batchUpdate += `('` + upsertConfig.ID + `','` + JSON.stringify(upsertConfig.json).split(`'`).join(`''`) + `')`;
      if (rowCounter != upsertConfigs.length - 1) {
        batchUpdate += ',';
      }
      rowCounter += 1;
    }
    batchUpdate += ` on conflict(id) do update set json=excluded.json;\n`;
  }
  return batchUpdate;
};

//limit to all being the same type for now:
const processSlowUpserts = async (upsertConfigs: Array<IUpsert>, databaseContext: any) => {
  if (upsertConfigs.length > 0) {
    // get a list of the IDs and snag a doctype from one of them (THEY WILL ALL BE TREATED AS SAME TYPE)
    let slowPatchOldIDS = [];
    let slowPatchDocType;

    for (const upsertConfig of upsertConfigs.filter((e) => {
      return e.type == UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH;
    })) {
      slowPatchOldIDS.push(upsertConfig.ID);
      slowPatchDocType = upsertConfig.docType;
    }

    //open db
    const adb = databaseContext.sqlite;
    const db = await adb.createConnection('localInvasivesBC', false, 'no-encryption', 1);
    let ret: any;
    ret = await db.open();

    //build the query to get old records
    const idsJSON = JSON.stringify(slowPatchOldIDS);
    const idsString = idsJSON.substring(1, idsJSON.length - 1);
    ret = await db.query('select * from ' + slowPatchDocType + ' where id in (' + idsString + ');');
    const slowPatchOld = ret.values;

    //patch them in memory
    let batchUpdate = '';
    console.log('*** building sql ***');

    for (const upsertConfig of upsertConfigs) {
      const old = JSON.parse(
        slowPatchOld.filter((e) => {
          return (e.id = upsertConfig.ID);
        })[0].json
      );
      const patched =
        `'` +
        JSON.stringify({ ...old, ...upsertConfig.json })
          .split(`'`)
          .join(`''`) +
        `'`;
      batchUpdate +=
        'insert into ' +
        upsertConfig.docType +
        ' (id, json) values (' +
        upsertConfig.ID +
        ',' +
        patched +
        ') on conflict (id) do update set json=excluded.json;';
    }

    //finally update them all:
    console.log('*** executing sql ***');
    if (batchUpdate != '') {
      ret = db.execute(batchUpdate);
    }
    console.log('*** done sql ***');
    db.close();
  }
};

export const createSqliteTables = async (adb: any) => {
  // initialize the connection
  const db = await adb.createConnection('localInvasivesBC', false, 'no-encryption', 1);
  let ret: any;

  //TODO:  keep connection open

  // open db testNew
  ret = await db.open();
  if (!ret.result) {
    return false;
  }

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
