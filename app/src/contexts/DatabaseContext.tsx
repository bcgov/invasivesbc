import PouchDB from 'pouchdb-core';
import PouchDBFind from 'pouchdb-find';
import PouchDBUpsert from 'pouchdb-upsert';
import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';

interface IDatabaseContext<T> {
  database: PouchDB.Database<T>;
  changes: Subject<PouchDB.Core.ChangesResponseChange<T>>;
}

export const DatabaseContext = React.createContext<IDatabaseContext<any>>({ database: null, changes: null });

export const DatabaseContextProvider: React.FC = (props) => {
  const [databaseContext, setDatabaseContext] = useState<IDatabaseContext<any>>({ database: null, changes: null });
  const [changesListener, setChangesListener] = useState<PouchDB.Core.Changes<any>>(null);

  const setupDatabase = async () => {
    let db = databaseContext.database;
    let dbChanges = databaseContext.changes;

    if (!db) {
      PouchDB.plugin(PouchDBFind); // adds find query support
      PouchDB.plugin(PouchDBUpsert); // adds upsert query support

      if (window['cordova']) {
        PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite')); // adds mobile adapter
        db = new PouchDB('invasivesbc', { adapter: 'cordova-sqlite' });
      } else {
        PouchDB.plugin(require('pouchdb-adapter-idb').default); // add sbrowser adapter
        db = new PouchDB('invasivesbc', { adapter: 'idb' });
      }
    }

    if (!dbChanges) {
      dbChanges = new Subject<any>();

      // add changes listenter to db that emits the changes obj to anyone subscribed to the subject
      const changes = db
        .changes({ live: true, since: 'now' })
        .on('change', (change) => dbChanges.next(change))
        .on('complete', () => () => dbChanges.complete())
        .on('error', () => () => dbChanges.complete());

      // sotre changes reference for use in cleanup
      setChangesListener(changes);
    }

    setDatabaseContext({ database: db, changes: dbChanges });
  };

  const cleanupDatabase = async () => {
    let db = databaseContext.database;

    if (changesListener) {
      // cancel changes listener
      changesListener.cancel();
    }

    if (db) {
      // close db
      db.close();
    }
  };

  // TODO Update [] dependencies to properly run cleanup (if keycloak expires?)
  useEffect(() => {
    setupDatabase();

    return () => {
      cleanupDatabase();
    };
  }, []);

  return <DatabaseContext.Provider value={databaseContext}>{props.children}</DatabaseContext.Provider>;
};
