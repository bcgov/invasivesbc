import { Input, makeStyles } from '@material-ui/core';
import Spinner from 'components/spinner/Spinner';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext2, query, QueryType, upsert, UpsertType } from 'contexts/DatabaseContext2';
import React, { useContext, useEffect, useState } from 'react';
import { useCallback } from 'react';

const useStyles = makeStyles((theme) => ({
  status: {}
}));

export interface ITripNamer {
  trip_ID: string;
}

export const TripNamer: React.FC<ITripNamer> = (props) => {
  const databaseContext = useContext(DatabaseContext2);
  const [name, setName] = useState(null);

  const getNameFromTrip = useCallback(async () => {
    let queryResults = await databaseContext.asyncQueue({
      asyncTask: () => {
        return query({ type: QueryType.DOC_TYPE_AND_ID, ID: props.trip_ID, docType: DocType.TRIP }, databaseContext);
      }
    });
    let aName = JSON.parse(queryResults[0].json).name;

    if (aName) {
      setName(aName);
    }
  }, [databaseContext]);

  const saveInput = async (newName) => {
    const tripID: string = props.trip_ID;
    let result = await databaseContext.asyncQueue({
      asyncTask: () => {
        return upsert(
          [
            {
              type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
              ID: tripID,
              docType: DocType.TRIP,
              json: { name: newName }
            }
          ],
          databaseContext
        );
      }
    });
  };

  // initial fetch
  useEffect(() => {
    getNameFromTrip();
  }, [name]);

  useStyles();

  return (
    <>
      <Input
        defaultValue={name}
        onBlur={(event) => {
          saveInput(event.target.value);
        }}
        color="primary"
      />
    </>
  );
};

export default TripNamer;
