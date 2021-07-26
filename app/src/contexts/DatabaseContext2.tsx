import { JsonColumn, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { GeoJSONObject } from '@turf/turf';
import { DocType } from 'constants/database';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSQLite } from 'react-sqlite-hook/dist';
// Singleton SQLite Hook
export let sqlite: any;
// Existing Connections Store
export let existingConn: any;
// Is Json Listeners used
export let isJsonListeners: any;

export const DatabaseContext2 = React.createContext({ sqliteDB: null });

export const DatabaseContext2Provider = (props) => {
  alert('provider render');
  const message = useRef('');
  const [databaseIsSetup, setDatabaseIsSetup] = useState(false);
  const [dbRequestQueue, setdbRequestQueue] = useState<Object[]>([]);
  const [db, setDB] = useState(null);
  const [isModal, setIsModal] = useState(false);
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
    alert('use effect - happen 1 time');
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
    createSqliteTables(sqlite);
    // a bunch of one time stuff
  }, []);
  const createSqliteTables = async (sqliteDB) => {
    // initialize the connection
    const dbname = 'localInvasivesBC';
    let db: SQLiteDBConnection;
    try {
      if ((await sqlite.isConnection(dbname)).result) {
        db = await sqlite.retrieveConnection(dbname);
      } else {
        db = await sqlite.createConnection(dbname, false, 'no-encryption', 1);
      }
    } catch (e) {
      alert('error making connection');
    }
    await db.open();
    const isitopen = await db.isDBOpen();

    const name = await db.getConnectionDBName();

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

    setupSQL += 'delete from trip;\n';
    setupSQL += "insert into trip (id, json) values (5, 'banana');\n";
    const isopen = await db.isDBOpen();
    ret = await db.execute(setupSQL);
    ret = await db.query('select * from trip;');
    const resul = JSON.stringify(ret.values);
    alert(resul);

    setDB(db);
    if (!ret.result) {
      //console.log('closing database - no result');
      //db.close();
      return false;
    } else {
      //console.log('closing database with result');
      //db.close();
      return true;
    }
  };

  // sets when other components will use the db
  useEffect(() => {
    if (databaseIsSetup) {
      return;
    }
    if (db?.isDBOpen()) {
      setDatabaseIsSetup(true);
    }
  }, [db]);

  // some usestate stuff copied in the big copy paste from capacitor-community/sqlite react template:  will remove when i know i can
  // .   i suspect can trash these:
  const [existConn, setExistConn] = useState(false);
  existingConn = { existConn: existConn, setExistConn: setExistConn };

  // these are for example of how to notify progress of json import or export, tbd if we will use
  const [jsonListeners, setJsonListeners] = useState(false);

  try {
    //if web just be a null context and return children
    if (!['ios', 'android', 'electron'].includes(Capacitor.getPlatform())) {
      return <DatabaseContext2.Provider value={{ sqliteDB: null }}>{props.children}</DatabaseContext2.Provider>;
    }

    //while (!databaseIsSetup) {}

    return (
      <>
        <DatabaseContext2.Provider value={{ sqliteDB: db }}>
          {databaseIsSetup ? props.children : null}
        </DatabaseContext2.Provider>
      </>
    );
  } catch (e) {
    alert('provider crashed');
    const error = JSON.stringify(e);
  }
  return null;
};

/*const openConnection = async (sqlite) => {
  // initialize the connection
  try {
    let db: SQLiteDBConnection;
    db = await sqlite.createConnection('localInvasivesBC');
    let ret: any;
    return await db.open();
  } catch (e) {
    alert('error opening db');
    throw e;
  }
};*/

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}
