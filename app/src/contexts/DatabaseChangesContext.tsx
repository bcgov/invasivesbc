import React, { useContext, useEffect, useState } from 'react';
import { DatabaseContext } from './DatabaseContext';
import { Observable } from 'rxjs';

export const DatabaseChangesContext = React.createContext<Observable<any>>(null);

export const DatabaseChangesContextProvider: React.FC = (props) => {
  const database = useContext(DatabaseContext);

  const [databaseChanges, setDatabaseChanges] = useState<Observable<any>>(null);

  useEffect(() => {
    const setDataBaseChangesObservable = () => {
      if (!database) {
        // database not ready
        return;
      }

      if (databaseChanges) {
        // database changes observable already exists
        return;
      }

      const databaseChangesObservable = new Observable((observer) => {
        database
          .changes({ live: true, since: 'now' })
          .on('change', (change) => observer.next(change))
          .on('complete', () => observer.complete())
          .on('error', () => observer.complete());
      });

      setDatabaseChanges(databaseChangesObservable);
    };

    setDataBaseChangesObservable();

    return () => {
      setDatabaseChanges(null);
    };
  }, [database]);

  return <DatabaseChangesContext.Provider value={databaseChanges}>{props.children}</DatabaseChangesContext.Provider>;
};
