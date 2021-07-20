import React, { useCallback, useContext, useEffect, useState } from 'react';
import { DatabaseContext } from './DatabaseContext';
import moment from 'moment';
import { Capacitor } from '@capacitor/core';

export type IDatabaseChanges = PouchDB.Core.ChangesResponseChange<any> | PouchDB.Core.ChangesResponse<any> | any;

export const DatabaseChangesContext = React.createContext<IDatabaseChanges>(null);

/**
 * Provides access to a database changes object, which contains information about the most recent database updates.
 *
 * @param {*} props
 * @return {*}
 */
export const DatabaseChangesContextProvider: React.FC = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const [databaseChanges, setDatabaseChanges] = useState<IDatabaseChanges>(null);
  const [changesListener, setChangesListener] = useState<PouchDB.Core.Changes<any>>(null);
  const [lastChangeTimestamp, setLastChangeTimestamp] = useState(null);
  const [buffer, setBuffer] = useState([]);
  const [bufferTimeout, setBufferTimeout] = useState(null);

  // speed limit for changes notifications:
  const MIN_INTERVAL = 1000;

  const addChange = useCallback(
    async (change) => {
      if (Capacitor.getPlatform() === 'ios') {
        return;
      }
      const now = moment().valueOf();
      setLastChangeTimestamp(now);
      if (!lastChangeTimestamp || now > lastChangeTimestamp + MIN_INTERVAL) {
        setDatabaseChanges([...buffer, change]);
        setBuffer([]);
        setBufferTimeout(null);
        clearTimeout(bufferTimeout);
      } else {
        // buffer changes until after the timeout
        // any other changes within this time will wipe the timeout and display only the new change
        setBuffer([...buffer, change]);
        setBufferTimeout(
          setTimeout(() => setDatabaseChanges([...buffer, change]), now - lastChangeTimestamp + MIN_INTERVAL)
        );
      }
    },
    [databaseChanges, lastChangeTimestamp, bufferTimeout, setBufferTimeout, setDatabaseChanges]
  );

  const setupDatabaseChanges = useCallback(async () => {
    if (Capacitor.getPlatform() === 'ios') {
      return;
    }
    /*
    if (!changesListener || changesListener['isCancelled']) {

      const listener = databaseContext?.database?
        .changes({ live: true, since: 'now' })
        .on('change', (change) => addChange(change))
        .on('complete', (final) => () => addChange(final))
        .on('error', (error) => () => addChange(error));

      setChangesListener(listener);
    }
    */
  }, [changesListener, databaseContext.database, addChange]);

  const cleanupDatabaseChanges = useCallback(() => {
    if (changesListener) {
      changesListener.cancel();
    }
  }, [changesListener]);

  useEffect(() => {
    setupDatabaseChanges();

    return () => {
      cleanupDatabaseChanges();
    };
  }, [databaseContext, setupDatabaseChanges, cleanupDatabaseChanges]);

  return <DatabaseChangesContext.Provider value={databaseChanges}>{props.children}</DatabaseChangesContext.Provider>;
};
