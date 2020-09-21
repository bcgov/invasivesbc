import React from 'react';
import * as RxDB from 'rxdb';
import { useState, useEffect } from 'react';

export const DatabaseContext = React.createContext(null);

export const DatabaseContextProvider: React.FC = (props) => {
  const [database, setDatabase] = useState(null);

  const setupDatabase = async () => {
    if (database) {
      return;
    }

    let db: RxDB.RxDatabase;

    if (window['cordova']) {
      RxDB.addRxPlugin(require('pouchdb-adapter-cordova-sqlite')); // mobile adapter

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

  useEffect(() => {
    setupDatabase();
  });

  return <DatabaseContext.Provider value={database}>{props.children}</DatabaseContext.Provider>;
};
