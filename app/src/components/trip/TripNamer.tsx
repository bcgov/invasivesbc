import { Input, makeStyles } from '@material-ui/core';
import Spinner from 'components/spinner/Spinner';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext, query, QueryType } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { useCallback } from 'react';

const useStyles = makeStyles((theme) => ({
  status: {}
}));

export interface ITripNamer {
  trip_ID: string;
}

export const TripNamer: React.FC<ITripNamer> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const [name, setName] = useState(null);

  const getNameFromTrip = useCallback(async () => {
    let queryResults = await query(
      { type: QueryType.DOC_TYPE_AND_ID, ID: props.trip_ID, docType: DocType.TRIP },
      databaseContext
    );
    let name = JSON.parse(queryResults[0].json).name;

    if (name) {
      setName(name);
    }
  }, [databaseContext.database]);

  const saveInput = async (newName) => {
    await databaseContext.database.upsert(props.trip_ID, (tripDoc) => {
      return { ...tripDoc, name: newName, persistenceStep: 'naming trip' };
    });
  };

  // initial fetch
  useEffect(() => {
    getNameFromTrip();
  }, [name]);

  useStyles();

  return (
    <>
      {docs ? (
        <Input
          defaultValue={name}
          onBlur={(event) => {
            saveInput(event.target.value);
          }}
          color="primary"
        />
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default TripNamer;
