import { Capacitor } from '@capacitor/core';
import { GeoJSONObject } from '@turf/turf';
import { DocType } from 'constants/database';
import React, { useEffect, useState, useRef, useContext } from 'react';
import PQueue from 'p-queue/dist';
import { useSQLite } from 'react-sqlite-hook/dist';
import { useSelector } from "../state/utilities/use_selector";
import { selectConfiguration } from "../state/reducers/configuration";
import { WebOnly } from '../components/common/WebOnly';
import { MobileOnly } from '../components/common/MobileOnly';
// Singleton SQLite Hook
export let sqlite: any;
// Existing Connections Store
export let existingConn: any;
// Is Json Listeners used
export let isJsonListeners: any;

export interface DBRequest {
  asyncTask: () => Promise<any>;
}

export const DatabaseContext = React.createContext({
  sqliteDB: null,
  asyncQueue: async (request: DBRequest) => {
    let x: any;
    return x;
  },
  ready: false
});

export const DatabaseContextProvider = (props) => {
  const message = useRef('');
  const [databaseIsSetup, setDatabaseIsSetup] = useState(false);
  const dbRequestQueue = new PQueue({ concurrency: 1 });
  const [isModal, setIsModal] = useState(false);

  const processRequest = async (dbRequest: DBRequest) => {
    const returnPromise = dbRequestQueue.add(dbRequest.asyncTask);
    return returnPromise;
  };

  const onProgressImport = async (progress: string) => {
    if (isJsonListeners.jsonListeners) {
      if (!isModal) setIsModal(true);
      message.current = message.current.concat(`${progress}\n`);
    }
  };

  const onProgressExport = async (progress: string) => {
    if (isJsonListeners.jsonListeners) {
      if (!isModal) setIsModal(true);
      message.current = message.current.concat(`${progress}\n`);
    }
  };
  const { MOBILE } = useSelector(selectConfiguration);

  const {
    echo,
    getPlatform,
    createConnection,
    closeConnection,
    retrieveConnection,
    retrieveAllConnections,
    closeAllConnections,
    isConnection,
    addUpgradeStatement,
    importFromJson,
    isJsonValid,
    isDatabase,
    getDatabaseList,
    addSQLiteSuffix,
    deleteOldDatabases,
    copyFromAssets,
    checkConnectionsConsistency,
    isAvailable
  } = useSQLite({
    onProgressImport,
    onProgressExport
  });
  useEffect(() => {
    sqlite = {
      echo: echo,
      getPlatform: getPlatform,
      createConnection: createConnection,
      closeConnection: closeConnection,
      retrieveConnection: retrieveConnection,
      retrieveAllConnections: retrieveAllConnections,
      closeAllConnections: closeAllConnections,
      isConnection: isConnection,
      isDatabase: isDatabase,
      getDatabaseList: getDatabaseList,
      addSQLiteSuffix: addSQLiteSuffix,
      deleteOldDatabases: deleteOldDatabases,
      addUpgradeStatement: addUpgradeStatement,
      importFromJson: importFromJson,
      isJsonValid: isJsonValid,
      copyFromAssets: copyFromAssets,
      checkConnectionsConsistency: checkConnectionsConsistency,
      isAvailable: isAvailable
    };
    isJsonListeners = { jsonListeners: jsonListeners, setJsonListeners: setJsonListeners };
    // open connnection, make tables, set db in context
    if (MOBILE) createSqliteTables();
    // a bunch of one time stuff
  }, []);

  // useEffect(() => {
  //   const saveUserInfo = async () => {
  //     const user = keycloak?.userInfo;
  //     if (!user) {
  //       return;
  //     }
  //     if (Capacitor.getPlatform() !== 'web' && databaseIsSetup && sqlite) {
  //       await processRequest({
  //         asyncTask: () => {
  //           return upsert(
  //             [
  //               {
  //                 type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
  //                 docType: DocType.KEYCLOAK,
  //                 ID: '1',
  //                 json: user
  //               }
  //             ],
  //             DatabaseContext
  //           );
  //         }
  //       });
  //     }
  //   };
  //   saveUserInfo();
  // }, [keycloak?.obj, keycloak?.userInfo, processRequest, databaseIsSetup]);

  const createSqliteTables = async () => {
    // initialize the connection
    let db = await getConnection();
    await db.open();
    const isitopen = await db.isDBOpen();
    console.log('db open on create table? : ' + JSON.stringify(isitopen));

    await db.getConnectionDBName();

    let ret;

    let setupSQL = ``;
    for (const value of enumKeys(DocType)) {
      switch (value) {
        case 'CODE_TABLE':
          setupSQL += `create table if not exists
            ${DocType[value]}
             (
              id TEXT PRIMARY KEY,
              json TEXT
            );`;
          break;
        case 'SMALL_GRID_LAYER_DATA':
          setupSQL += `create table if not exists
            ${DocType[value]}
             (
              id INTEGER,
              featureArea TEXT,
              featuresInArea TEXT,
              largeGridID INTEGER,
              layerName TEXT
            );create unique index IF NOT EXISTS idx_smallGrid_id_layerName on SMALL_GRID_LAYER_DATA (id, layerName);\n`;
          break;
        case 'LARGE_GRID_LAYER_DATA':
          setupSQL += `create table if not exists
            ${DocType[value]}
             (
              id INTEGER UNIQUE,
              featureArea TEXT
            );`;
          break;
        case 'TRIP':
          setupSQL += `create table if not exists
            ${DocType[value]}
             (
              id INTEGER PRIMARY KEY,
              json TEXT,
              isCurrent INTEGER
            );\n`;
          break;
        case 'REFERENCE_ACTIVITY':
          setupSQL += `create table if not exists
            ${DocType[value]}
             (
              id TEXT PRIMARY KEY,
              json TEXT,
              activity_subtype TEXT
            );\n`;
          break;
        case 'ACTIVITY':
          setupSQL += `create table if not exists
            ${DocType[value]}
             (
              id TEXT PRIMARY KEY,
              json TEXT,
              activity_subtype TEXT,
              sync_status TEXT
            );\n`;
          break;
        case 'REFERENCE_POINT_OF_INTEREST':
          setupSQL += `create table if not exists ${DocType[value]}
             (
              id TEXT PRIMARY KEY,
              json TEXT
            );\n`;
          break;
        case 'LAYER_STYLES':
          setupSQL += `create table if not exists ${DocType[value]}
             (
              layerName TEXT UNIQUE,
              json TEXT
            );\n`;
          break;
        default:
          setupSQL += `create table if not exists ${DocType[value]}
             (
              id INTEGER PRIMARY KEY,
              json TEXT
            );\n`;
      }
    }

    await db.isDBOpen();
    ret = await db.execute(setupSQL);
    setDatabaseIsSetup(true);
    console.log('database is setup...');

    return ret.changes;
  };

  // some usestate stuff copied in the big copy paste from capacitor-community/sqlite react template:  will remove when i know i can
  // .   i suspect can trash these:
  const [existConn, setExistConn] = useState(false);
  existingConn = { existConn: existConn, setExistConn: setExistConn };

  // these are for example of how to notify progress of json import or export, tbd if we will use
  const [jsonListeners, setJsonListeners] = useState(false);

  return (
    <>
      <MobileOnly>
        {databaseIsSetup && sqlite && (
          <DatabaseContext.Provider value={{ sqliteDB: sqlite, asyncQueue: processRequest, ready: true }}>
            {props.children}
          </DatabaseContext.Provider>
        )}
      </MobileOnly>
      <WebOnly>{props.children}</WebOnly>
    </>
  );
};

export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

/* db query wrapper interface to hide db implementation */
export enum UpsertType {
  DOC_TYPE_AND_ID = 'docType and ID',
  DOC_TYPE_AND_ID_DELETE = 'docType and ID delete',
  DOC_TYPE_AND_ID_FAST_JSON_PATCH = 'docType and ID - FAST JSON PATCH', // uses sqlitejson1 extension when I get it working
  DOC_TYPE_AND_ID_SLOW_JSON_PATCH = 'docType and ID - SLOW JSON PATCH', // workaround, all of these need to have same doctype
  DOC_TYPE = 'docType',
  MOBILE_ACTIVITY_CREATE = 'create mobile activity',
  MOBILE_ACTIVITY_PATCH = 'patch mobile activity',
  RAW_SQL = 'raw sql'
}
export interface IUpsert {
  type?: UpsertType; // placeholder - might use to dictate what db
  ID?: string;
  docType?: DocType;
  sql?: string;
  json?: Object;
  activity_subtype?: string;
  sync_status?: string;
  geo?: GeoJSONObject; //todo - give geo it's own column so we can fetch many geos locally fast
  trip_ID?: number; //todo - give a trip number for handling cache management
}

const getConnection = async () => {
  const dbname = 'localInvasivesBC';

  let oldConnection;
  let newConnection;

  try {
    oldConnection = await sqlite.retrieveConnection(dbname);
    console.log('reusing connection ');
    if (!oldConnection.isDBOpen()) {
      await oldConnection.open();
    }
    return oldConnection;
  } catch (e) {
    console.log('error retrieving existing connection');
  }

  try {
    newConnection = await sqlite.createConnection(dbname, false, 'no-encryption', 1);
    if (!newConnection.isDBOpen()) {
      await newConnection.open();
    }
    console.log('creating new connection ');
    return newConnection;
  } catch (e) {
    console.log('error making new connection');
  }

  throw new Error('unable to get connection');
};

// v1: assumes all upsertconfigs are the same, will allow for multiple in v2
export const upsert = async (upsertConfigs: Array<IUpsert>, databaseContext: any) => {
  let batchUpdate = '';
  let db = await getConnection();

  let totalRecordsChanged = 0;

  let ret: any;

  // workaround until we get json1 extension working:
  //TODO: change to return a count and share db like the other ones:
  const patchSlowUpserts = upsertConfigs.filter((e) => e.type === UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH);
  processSlowUpserts(patchSlowUpserts, databaseContext);

  const docTypeAndIDUpserts = upsertConfigs.filter((e) => e.type === UpsertType.DOC_TYPE_AND_ID);
  if (docTypeAndIDUpserts.length >= 1) {
    batchUpdate = buildSQLStringDOC_TYPE_AND_ID(docTypeAndIDUpserts);
    ret = await handleExecute(batchUpdate, db);
    if (ret !== false) {
      totalRecordsChanged += ret;
    } else {
      console.log('problem executing DOC_TYPE_AND_ID upserts:');
      console.log('db failed upsert @' + totalRecordsChanged + ' records');
    }
  }

  batchUpdate = '';
  const everythingElse = upsertConfigs.filter((e) => e.type !== UpsertType.DOC_TYPE_AND_ID);
  for (const upsertConfig of everythingElse) {

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
        case UpsertType.MOBILE_ACTIVITY_CREATE:
          batchUpdate +=
            `insert into ` +
            upsertConfig.docType +
            ` (id, json, activity_subtype, sync_status) values ('` +
            upsertConfig.ID +
            `','` +
            JSON.stringify(upsertConfig.json).split(`'`).join(`''`) +
            `','` +
            upsertConfig.activity_subtype +
            `','` +
            upsertConfig.sync_status +
            `');\n`;
          break;
        case UpsertType.MOBILE_ACTIVITY_PATCH:
          let sql =
            `update ` +
            upsertConfig.docType +
            ` set sync_status='${upsertConfig.sync_status}', json='${JSON.stringify(upsertConfig.json)
              .split(`'`)
              .join(`''`)}` +
            `' where id='${upsertConfig.ID}';\n`;
          console.log('SQL: ', sql);
          batchUpdate += sql;
          break;
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
        case UpsertType.DOC_TYPE_AND_ID_DELETE:
          batchUpdate += `delete from ` + upsertConfig.docType + ` where id=` + upsertConfig.ID + `;\n`;
          break;
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
      return false;
    } else {
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
      if (rowCounter !== upsertConfigs.length - 1) {
        batchUpdate += ',';
      }
      rowCounter += 1;
    }
    batchUpdate += ` on conflict(id) do update set json=excluded.json;\n`;
  }
  return batchUpdate;
};

//only works for 1 record right now
//limit to all being the same type for now:
const processSlowUpserts = async (upsertConfigs: Array<IUpsert>, databaseContext: any) => {
  if (upsertConfigs.length > 0) {
    // get a list of the IDs and snag a doctype from one of them (THEY WILL ALL BE TREATED AS SAME TYPE)
    let slowPatchOldIDS = [];
    let slowPatchDocType;

    for (const upsertConfig of upsertConfigs.filter((e) => {
      return e.type === UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH;
    })) {
      slowPatchOldIDS.push(upsertConfig.ID);
      slowPatchDocType = upsertConfig.docType;
    }

    let ret;
    //open db
    let db = await getConnection();

    //build the query to get old records
    const idsJSON = JSON.stringify(slowPatchOldIDS);
    const idsString = idsJSON.substring(1, idsJSON.length - 1);
    ret = await db.query('select * from ' + slowPatchDocType + ' where id in (' + idsString + ');');

    const slowPatchOld = ret.values;

    //patch them in memory
    let batchUpdate = '';

    // breaks if you are calling json slow patch on a record that doesnt exist and doesnt have a json prop
    for (const upsertConfig of upsertConfigs) {
      let old;
      if (slowPatchOld.length === 0) {
        old = {};
      } else {
        old = JSON.parse(
          slowPatchOld.filter((e) => {
            return (e.id = upsertConfig.ID);
          })[0].json
        );
      }
      const patched =
        `'` +
        JSON.stringify({ ...old, ...upsertConfig.json })
          .split(`'`)
          .join(`''`) +
        `'`;

      if (
        [DocType.ACTIVITY, DocType.REFERENCE_ACTIVITY, DocType.REFERENCE_POINT_OF_INTEREST].includes(
          upsertConfig.docType
        )
      ) {
        batchUpdate +=
          'insert into ' +
          upsertConfig.docType +
          ` (id, json) values ('` +
          upsertConfig.ID +
          `',` +
          patched +
          ') on conflict (id) do update set json=excluded.json;';
      } else {
        batchUpdate +=
          'insert into ' +
          upsertConfig.docType +
          ' (id, json) values (' +
          upsertConfig.ID +
          ',' +
          patched +
          ') on conflict (id) do update set json=excluded.json;';
      }
    }

    //finally, update them all:
    if (batchUpdate !== '') {
      ret = db.execute(batchUpdate);
    }
  }
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
  offset?: number;
}

const getByDocTypeAndBoudingPoly = async (queryConfig: IQuery, db: any) => {
  return false;
};

export const query = async (queryConfig: IQuery, databaseContext: any) => {
  console.dir(queryConfig);
  try {
    if (!databaseContext.sqliteDB) {
      return;
    }
  } catch (e) {
    alert('crashing checking if db in context');
    alert(JSON.stringify(e));
  }

  let ret;
  let db = await getConnection();

    switch (queryConfig.type) {
      case QueryType.DOC_TYPE_AND_ID:
        if (
          [DocType.ACTIVITY, DocType.REFERENCE_ACTIVITY, DocType.REFERENCE_POINT_OF_INTEREST].includes(
            queryConfig.docType
          )
        ) {
          //if ID is string
          ret = await db.query('select * from ' + queryConfig.docType + " where id = '" + queryConfig.ID + "';\n");
        } else {
          //if ID is number
          ret = await db.query('select * from ' + queryConfig.docType + ' where id = ' + queryConfig.ID + ';\n');
        }

        if (!ret.values) {
          return false;
        } else {
          return ret.values;
        }
      case QueryType.DOC_TYPE:
        ret = await db.query(
          'select * from ' + queryConfig.docType + (queryConfig.limit > 0 ? ' limit ' + queryConfig.limit + ';' : ';')
        );
        if (!ret.values) {
          return false;
        } else {
          return ret.values;
        }
      case QueryType.RAW_SQL:
        ret = await db.query(queryConfig.sql);
        if (!ret.values) {
          return false;
        } else {
          return ret.values;
        }
      case QueryType.DOC_TYPE_AND_BOUNDING_POLY:
        return getByDocTypeAndBoudingPoly(queryConfig, db);
      default:
        alert(
          'Your sqlite query needs a QueryType and corresponding parameters.  What you provided:  ' +
            JSON.stringify(queryConfig)
        );
        return;
    }

};
