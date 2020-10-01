import { Button, CircularProgress, Grid, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Form from '@rjsf/material-ui';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { JSONSchema7 } from 'json-schema';
import React, { useContext, useEffect, useState } from 'react';
import RootUISchemas from 'rjsf/RootUISchemas';
import { ActivityStatus, ActivitySyncStatus } from 'constants/activities';

// Custom themed `Form` component, using @rjsf/material-ui as default base theme
// const Form = withTheme({ ...rjsfMaterialTheme });

const useStyles = makeStyles((theme: Theme) => ({
  formControlsTop: {
    marginBottom: '1rem'
  },
  formControlsBottom: {
    marginTop: '1rem'
  }
}));

interface IFormControlProps {
  classes?: { root?: any };
  disabled?: boolean;
  formRef: { submit: Function };
  activity: any;
}

const FormControls: React.FC<IFormControlProps> = (props) => {
  const save = async (formData: any) => {
    props.formRef.submit();
  };

  const isDisabled = props.disabled || false;

  return (
    <>
      <Grid container spacing={3} className={props.classes.root}>
        <Grid container item spacing={3}>
          <Grid item>
            <Button disabled={isDisabled} size="small" variant="contained" color="primary" onClick={save}>
              Save
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
  const classes = useStyles();

  const invasivesApi = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext);

  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ schema: null, uiSchema: null });

  const [formRef, setFormRef] = useState(null);

  const submitHandler = async (event: any) => {
    await databaseContext.database.upsert(props.activity._id, (activity) => {
      return { ...activity, formData: event.formData, status: ActivityStatus.EDITED, dateUpdated: new Date() };
    });
  };

  useEffect(() => {
    const getApiSpec = async () => {
      const response = await invasivesApi.getCachedApiSpec();

      setSchemas({
        schema: { ...response.components.schemas[props.activity.activityType], components: response.components },
        uiSchema: RootUISchemas[props.activity.activityType]
      });
    };

    getApiSpec();
  }, []);

  useEffect(() => {});

  if (!schemas.schema || !schemas.uiSchema) {
    return <CircularProgress />;
  }

  const isDisabled = props.activity?.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL || false;

  return (
    <div>
      <FormControls
        activity={props.activity}
        formRef={formRef}
        disabled={isDisabled}
        classes={{ root: classes.formControlsTop }}
      />

      <Form
        disabled={isDisabled}
        formData={props.activity?.formData || null}
        schema={schemas.schema as JSONSchema7}
        uiSchema={schemas.uiSchema}
        liveValidate={false}
        showErrorList={true}
        ErrorList={() => {
          return (
            <div>
              <Typography color="error" variant="h5">
                The form contains one or more errors
              </Typography>
            </div>
          );
        }}
        onSubmit={submitHandler}
        // `ref` does exist, but currently is missing from the `index.d.ts` types file.
        // @ts-ignore: No overload matches this call ts(2769)
        ref={(form) => setFormRef(form)}>
        <React.Fragment />
      </Form>

      <FormControls
        activity={props.activity}
        formRef={formRef}
        disabled={isDisabled}
        classes={{ root: classes.formControlsBottom }}
      />
    </div>
  );
};

export default FormContainer;
