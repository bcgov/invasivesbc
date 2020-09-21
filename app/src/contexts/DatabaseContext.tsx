import React from 'react';
import * as RxDB from 'rxdb';
import { useState, useEffect } from 'react';
import { checkAdapter } from 'rxdb';
import {  observationSchema } from './observationSchema'

export const DatabaseContext = React.createContext(null);

export const DatabaseContextProvider: React.FC = (props) => {
  const [database, setDatabase] = useState(null);

  const setupDatabase = async () => {
    if(database) {
      return;
    }

    let db: RxDB.RxDatabase;

    if (window['cordova']) {
      RxDB.addRxPlugin(require('pouchdb-adapter-cordova-sqlite')); // mobile adapter

      const ok = await checkAdapter('cordova-sqlite');
      console.dir(ok);


      db = await RxDB.createRxDatabase({
        name: 'invasivesbc',
        adapter: 'cordova-sqlite', // mobile adapter
        pouchSettings: {
          location: 'default'
        },
        multiInstance: false
      });
    } else {
      RxDB.addRxPlugin(require('pouchdb-adapter-indexeddb')); // browser adapter

      const ok = await checkAdapter('indexeddb');
      console.dir(ok);

      db = await RxDB.createRxDatabase({
        name: 'invasivesbc',
        adapter: 'indexeddb', // browser adapter
        multiInstance: false
      });
    }

    setDatabase(db);

    console.log('1====================');
    console.log(db);
    console.log('2====================');
    console.log(db.storage);
    console.log('3====================');
    console.log(db.pouchSettings);
    console.log('4====================');
    console.log(db.options);
    console.log('5====================');
    console.log(db.collections);
    console.log('6====================');
  
  };

  const setupTables = async ()  => {

    const observations = async () => {
      if (!database || database.observations) {
        return;
      }
      const table = await database.collection({
        name: 'observations',
        schema: { ...observationSchema, version: 0 }
      });
    };

    observations()
  
  }

  useEffect(() => {
    setupDatabase();
    setupTables();
  });


  return <DatabaseContext.Provider value={database}>{props.children}</DatabaseContext.Provider>;
};
