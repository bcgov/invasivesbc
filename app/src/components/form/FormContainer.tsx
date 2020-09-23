import React from 'react';
import Form from '@rjsf/material-ui';
import { JSONSchema7 } from 'json-schema';

import { Grid, Button, TextField, CircularProgress } from '@material-ui/core';
import { useState, useEffect, useContext } from 'react';

// db caching related:
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useInvasivesApi } from 'api/api';
import { Activity } from 'rjsf/uiSchema';

interface IFormControlProps {
  classes?: any;
  setFormData: Function;
  activity: any;
}

// Form controls:
const FormControls: React.FC<IFormControlProps> = (props) => {
  const api = useInvasivesApi();

  const databaseContext = useContext(DatabaseContext);

  // needed for fetch:
  const [activityID, setActivityID] = useState('');

  // just for fun (first half):
  const [isValidActivityID, setIsValidActivityID] = useState(true);

  useEffect(() => {
    var activityIDAsNumber = +activityID;
    activityIDAsNumber >= 0 ? setIsValidActivityID(true) : setIsValidActivityID(false);
  }, [activityID]);

  const sync = async (formData: any) => {
    const response = await api.createActivity(formData);
  };

  const read = async (event: any) => {
    const response = await api.getActivityById(activityID);
    console.log(response.data);
    props.setFormData(response.data);
  };

  const save = async (formData: any) => {
    // databaseContext.database.put(formData);
  };

  return (
    <>
      <TextField
        id="outlined-basic"
        label="Activity ID To Fetch"
        variant="outlined"
        // other half of fun:
        error={!isValidActivityID}
        onChange={(e) => setActivityID(e.target.value)}
        helperText="It's gotta be a number."
      />

      <br></br>
      <Grid container spacing={3}>
        <Grid container item spacing={3}>
          <Grid item>
            <Button size="small" variant="contained" color="primary" onClick={sync}>
              Sync Record
            </Button>
          </Grid>
          <Grid item>
            <Button size="small" variant="contained" color="primary" onClick={read}>
              Get Record
            </Button>
          </Grid>
          <Grid item>
            <Button size="small" variant="contained" color="primary" onClick={save}>
              Local Save
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

interface IFormContainerProps {
  classes?: any;
  activity: any;
}

const FormContainer: React.FC<IFormContainerProps> = (props) => {
  const api = useInvasivesApi();

  const [formData, setFormData] = useState(null);
  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ schema: null, uiSchema: null });

  const submitEventHandler = async (event: any) => {
    console.log('submitEventHandler: ', event);
    // await collection.insert(event.formData);
    // const results = await collection.find().exec();
    // results.map((item) => console.log(item.toJSON()));
  };

  useEffect(() => {
    const getApiSpec = async () => {
      const response = await api.getApiSpec();

      // TODO add the promise from `api-getApiSpec()` to this array.
      setSchemas({
        schema: { ...response.data.components.schemas.Activity, components: response.data.components },
        uiSchema: Activity
      });
    };

    getApiSpec();
  }, []);

  useEffect(() => {});

  if (!schemas.schema || !schemas.uiSchema) {
    return <CircularProgress />;
  }

  return (
    <div>
      <FormControls activity={props.activity} setFormData={setFormData} />

      <Form
        formData={formData}
        schema={schemas.schema as JSONSchema7}
        uiSchema={schemas.uiSchema}
        onSubmit={submitEventHandler}
      />
    </div>
  );
};

export default FormContainer;
