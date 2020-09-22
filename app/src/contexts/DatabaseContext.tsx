import PouchDB from 'pouchdb-core';
import React, { useEffect, useState } from 'react';

export const DatabaseContext = React.createContext<PouchDB.Database>(null);

export const DatabaseContextProvider: React.FC = (props) => {
  const [database, setDatabase] = useState<PouchDB.Database>(null);

  const setupDatabase = async () => {
    if (database) {
      return;
    }

    let db: PouchDB.Database;
    PouchDB.plugin(require('pouchdb-find')); // adds mongo-style query support

    if (window['cordova']) {
      PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite')); // adds mobile adapter
      db = new PouchDB('invasivesbc', { adapter: 'cordova-sqlite' });
    } else {
      PouchDB.plugin(require('pouchdb-adapter-idb').default); // add sbrowser adapter
      db = new PouchDB('invasivesbc', { adapter: 'idb' });
    }

    setDatabase(db);
  };

  useEffect(() => {
    setupDatabase();
  });

  return <DatabaseContext.Provider value={database}>{props.children}</DatabaseContext.Provider>;
};
