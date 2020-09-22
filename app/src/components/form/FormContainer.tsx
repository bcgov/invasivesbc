import React from 'react';
import Form from '@rjsf/material-ui';
import { JSONSchema7 } from 'json-schema';

import { Grid, Button, TextField } from '@material-ui/core';
import { useState, useEffect, useContext } from 'react';

// db caching related:
import PouchDB from 'pouchdb-core';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useInvasivesApi } from 'api/api';

interface IFormControlProps {
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
  schema?: any;
  uiSchema?: any;
  activity: any;
}

const FormContainer: React.FC<IFormContainerProps> = (props) => {
  const api = useInvasivesApi();

  const [formData, setFormData] = useState(null);

  const submitEventHandler = async (event: any) => {
    console.log('submitEventHandler: ', event);
    // await collection.insert(event.formData);
    // const results = await collection.find().exec();
    // results.map((item) => console.log(item.toJSON()));
  };

  useEffect(() => {
    const getApiSpec = async () => {
      const response = await api.getApiSpec();
      //   console.log(
      //     response.data.paths["/activity"].post.requestBody.content[
      //       "application/json"
      //     ].schema
      //   );
      // setSchema(response.data.paths['/activity'].post.requestBody.content['application/json'].schema);
    };

    getApiSpec();
  }, [api]);

  useEffect(() => {});

  return (
    <div>
      <FormControls activity={props.activity} setFormData={setFormData} />

      <Form
        formData={formData}
        schema={props.schema as JSONSchema7}
        uiSchema={props.uiSchema}
        onSubmit={submitEventHandler}
      />
    </div>
  );
};

export default FormContainer;
