import { Box, CircularProgress, ThemeProvider, Typography } from '@material-ui/core';
import { IChangeEvent, ISubmitEvent } from '@rjsf/core';
import Form from '@rjsf/material-ui';
import { ActivitySyncStatus } from 'constants/activities';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { JSONSchema7 } from 'json-schema';
import React, { useEffect, useState } from 'react';
import ArrayFieldTemplate from 'rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from 'rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from 'rjsf/templates/ObjectFieldTemplate';
import RootUISchemas from 'rjsf/uiSchema/RootUISchemas';
import rjsfTheme from 'themes/rjsfTheme';
import FormControlsComponent, { IFormControlsComponentProps } from './FormControlsComponent';

export interface IFormContainerProps extends IFormControlsComponentProps {
  classes?: any;
  activity: any;
  customValidation?: any;
  isDisabled?: boolean;
  pasteFormData?: Function;
  copyFormData?: Function;
  /**
   * A function executed everytime the form changes.
   *
   * Note: This will fire frequently, so consider wrapping it in a debounce function (see utils.ts > debounced).
   */
  onFormChange?: (event: IChangeEvent<any>, formRef: any) => any;
  /**
   * A function executed when the form submit hook fires, and form validation errors are found.
   */
  onFormSubmitError?: (errors: any[], formRef: any) => any;
  /**
   * A function executed everytime the form submit hook fires.
   *
   * Note: Form validation rules will run, and must succeed, before this will be called.
   */
  onFormSubmitSuccess?: (event: ISubmitEvent<any>, formRef: any) => any;
}

const FormContainer: React.FC<IFormContainerProps> = (props) => {
  const invasivesApi = useInvasivesApi();

  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ schema: null, uiSchema: null });

  const [formRef, setFormRef] = useState(null);

  useEffect(() => {
    const getApiSpec = async () => {
      const response = await invasivesApi.getCachedApiSpec();

      setSchemas({
        schema: { ...response.components.schemas[props.activity.activitySubtype], components: response.components },
        uiSchema: RootUISchemas[props.activity.activitySubtype]
      });
    };

    getApiSpec();
  }, []);

  if (!schemas.schema || !schemas.uiSchema) {
    return <CircularProgress />;
  }

  const isDisabled = props.isDisabled || props.activity?.sync?.status === ActivitySyncStatus.SYNC_SUCCESSFUL || false;

  return (
    <Box>
      <Box mb={3}>
        <FormControlsComponent
          onSubmit={() => formRef.submit()}
          isDisabled={isDisabled}
          onCopy={props.copyFormData ? () => props.copyFormData() : null}
          onPaste={props.pasteFormData ? () => props.pasteFormData() : null}
          activitySubtype={props.activity.activitySubtype}
        />
      </Box>

      <ThemeProvider theme={rjsfTheme}>
        <Form
          ObjectFieldTemplate={ObjectFieldTemplate}
          FieldTemplate={FieldTemplate}
          ArrayFieldTemplate={ArrayFieldTemplate}
          key={props.activity?._id}
          disabled={isDisabled}
          formData={props.activity?.formData || null}
          schema={schemas.schema as JSONSchema7}
          uiSchema={schemas.uiSchema}
          liveValidate={false}
          showErrorList={true}
          validate={props.customValidation}
          autoComplete="off"
          ErrorList={() => {
            return (
              <div>
                <Typography color="error" variant="h5">
                  The form contains one or more errors!
                </Typography>
                <Typography color="error" variant="h6">
                  Incorrect fields are highlighted below.
                </Typography>
              </div>
            );
          }}
          onChange={(event) => {
            if (!props.onFormChange) {
              return;
            }

            props.onFormChange(event, formRef);
          }}
          onError={(error) => {
            if (!props.onFormSubmitError) {
              return;
            }

            props.onFormSubmitError(error, formRef);
          }}
          onSubmit={(event) => {
            if (!props.onFormSubmitSuccess) {
              return;
            }

            props.onFormSubmitSuccess(event, formRef);
          }}
          // `ref` does exist, but currently is missing from the `index.d.ts` types file.
          // @ts-ignore: No overload matches this call ts(2769)
          ref={(form) => {
            if (!form) {
              return;
            }

            setFormRef(form);
          }}>
          <React.Fragment />
        </Form>
      </ThemeProvider>

      <Box mt={3}>
        <FormControlsComponent onSubmit={() => formRef.submit()} isDisabled={isDisabled} />
      </Box>
    </Box>
  );
};

export default FormContainer;
