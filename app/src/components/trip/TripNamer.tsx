import { Input, makeStyles } from '@material-ui/core';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
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
  const [docs, setDocs] = useState(null);

  const getNameFromTrip = useCallback(async () => {
    let docs = await databaseContext.database.find({
      selector: {
        _id: props.trip_ID
      }
    });
    if (docs.docs.length > 0) {
      let tripDoc = docs.docs[0];
      setDocs(tripDoc);
      if (tripDoc.name != name) {
        setName(tripDoc.name);
      }
    }
  }, [databaseContext.database]);

  const saveInput = async (newName) => {
    await databaseContext.database.upsert(props.trip_ID, (tripDoc) => {
      return { ...tripDoc, name: newName, persistenceStep: "naming trip" };
    });
  };

  // initial fetch
  useEffect(() => {
    getNameFromTrip();
  }, [name]);

  useStyles();

  return (
    <>
      {docs && name ? (
        <Input
          defaultValue={name}
          onBlur={(event) => {
            saveInput(event.target.value);
          }}
          color="primary"
        />
      ) : (
        'LOADING'
      )}
    </>
  );
};

export default TripNamer;
