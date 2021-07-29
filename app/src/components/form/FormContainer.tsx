import {
  Box,
  Button,
  CircularProgress,
  createMuiTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ThemeOptions,
  ThemeProvider,
  Typography
} from '@material-ui/core';
import { IChangeEvent, ISubmitEvent } from '@rjsf/core';
import Form from '@rjsf/material-ui';
import { ActivitySyncStatus } from 'constants/activities';
import { SelectAutoCompleteContextProvider } from 'contexts/SelectAutoCompleteContext';
import { ThemeContext } from 'contexts/themeContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
import ArrayFieldTemplate from 'rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from 'rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from 'rjsf/templates/ObjectFieldTemplate';
import RootUISchemas from 'rjsf/uiSchema/RootUISchemas';
import MultiSelectAutoComplete from 'rjsf/widgets/MultiSelectAutoComplete';
import SingleSelectAutoComplete from 'rjsf/widgets/SingleSelectAutoComplete';
import rjsfTheme from 'themes/rjsfTheme';
import FormControlsComponent, { IFormControlsComponentProps } from './FormControlsComponent';

export interface IFormContainerProps extends IFormControlsComponentProps {
  classes?: any;
  activity: any;
  customValidation?: any;
  customErrorTransformer?: any;
  isDisabled?: boolean;
  pasteFormData?: Function;
  copyFormData?: Function;
  setParentFormRef?: Function;
  hideCheckFormForErrors?: boolean;
  /**
   * A function executed everytime the form changes.
   *
   * Note: This will fire frequently, so consider wrapping it in a debounce function (see utils.ts > debounced).
   */
  onFormChange?: (event: any, formRef: any, focusedField?: string) => any;
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
  const [focusedFieldArgs, setFocusedFieldArgs] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState(null);
  const [field, setField] = React.useState('');

  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const rjsfThemeDark = createMuiTheme({
    ...rjsfTheme,
    palette: { ...rjsfTheme.palette, type: 'dark' }
  } as ThemeOptions);
  const rjsfThemeLight = createMuiTheme(rjsfTheme as ThemeOptions);

  //open dialog window (visual)
  const openDialog = () => {
    setOpen(true);
  };

  //close the dialog windo (visual)
  const handleClose = () => {
    setOpen(false);
  };

  //Dialog Proceed OnClick func
  const proceedClick = () => {
    //setTimeout is called so that the setState works as expected
    setTimeout(() => {
      const $this = formRef;
      //declare and initialize no validation fields array from formData if any
      let noValidationFields: string[] = [];
      if ($this.state.formData.forceNoValidationFields) {
        noValidationFields = [...$this.state.formData.forceNoValidationFields];
      }
      //add field to no validation if not there already
      if (!noValidationFields.includes(field)) {
        noValidationFields.push(field);
      }
      //set new state with updated array of noValidate fields
      let newFormData = $this.state.formData;
      newFormData.forceNoValidationFields = noValidationFields;
      $this.setState({ formData: newFormData }, () => {
        //revalidate formData after the setState is run
        $this.validate($this.state.formData);
        //update formData of the activity via onFormChange
        props.onFormChange({ formData: formRef.state.formData }, formRef);
      });
    }, 100);
    handleClose();
  };

  //helper function to get field name from args
  const getFieldNameFromArgs = (args): string => {
    let argumentFieldName = '';
    if (args[0].includes('root_activity_subtype_data_herbicide_0_')) {
      argumentFieldName = 'root_activity_subtype_data_herbicide_0_';
    } else if (args[0].includes('root_activity_subtype_data_')) {
      argumentFieldName = 'root_activity_subtype_data_';
    } else if (args[0].includes('root_activity_data_')) {
      argumentFieldName = 'root_activity_data_';
    }
    let fieldName = argumentFieldName ? args[0].substr(argumentFieldName.length) : args[0]; // else use the full arg name
    return fieldName;
  };

  //herlper function to get the path to the field in an oject.
  //if multiple found, stores multiple strings in array
  const getPathToFieldName = (obj: any, predicate: Function) => {
    const discoveredObjects = []; // For checking for cyclic object
    const path = []; // The current path being searched
    const results = []; // The array of paths that satify the predicate === true
    if (!obj && (typeof obj !== 'object' || Array.isArray(obj))) {
      throw new TypeError('First argument of finPropPath is not the correct type Object');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('Predicate is not a function');
    }
    (function find(obj) {
      for (const key of Object.keys(obj)) {
        // use only enumrable own properties.
        if (predicate(key, path, obj) === true) {
          // Found a path
          path.push(key); // push the key
          results.push(path.join('.')); // Add the found path to results
          path.pop(); // remove the key.
        }
        const o = obj[key]; // The next object to be searched
        if (o && typeof o === 'object' && !Array.isArray(o)) {
          // check for null then type object
          if (!discoveredObjects.find((obj) => obj === o)) {
            // check for cyclic link
            path.push(key);
            discoveredObjects.push(o);
            find(o);
            path.pop();
          }
        }
      }
    })(obj);
    return results;
  };

  //helper function - find the value of the property given the path to it whithin the oject
  const deepFind = (obj: any, path: string, newValue?: string) => {
    let paths = path.split('.'),
      current = obj;
    for (let i = 0; i < paths.length; ++i) {
      if (current[paths[i]] === undefined) {
        return undefined;
      } else {
        current = current[paths[i]];
      }
    }
    return current;
  };

  //handle blur the field
  const blurHandler = (...args: string[]) => {
    const $this = formRef;
    const field = getFieldNameFromArgs(args);
    const { formData, uiSchema } = $this.state;
    let path = getPathToFieldName(uiSchema, (key) => key === field);
    if (deepFind(uiSchema, path[0] + '')) {
      if (deepFind(uiSchema, path[0] + '.validateOnBlur')) {
        const { errorSchema } = $this.validate(formData);
        let errorPath = getPathToFieldName(errorSchema, (key) => key === field);
        if (deepFind(errorSchema, errorPath[0] + '.__errors.0')) {
          setAlertMsg(deepFind(errorSchema, errorPath[0] + '.__errors.0'));
          setField(field);
          openDialog();
        }
      }
    }
  };

  //handle focus the field
  //onFocus - if the field that is being focused is in forceNoValidation fields, remove it from there,
  //so that the user will be tasked to force the value out of range again
  const focusHandler = (...args: string[]) => {
    let field = getFieldNameFromArgs(args);
    setFocusedFieldArgs(args);
    const $this = formRef;
    const { formData } = $this.state;
    if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes(field)) {
      const index = formData.forceNoValidationFields.indexOf(field);
      if (index > -1) {
        formData.forceNoValidationFields.splice(index, 1);
      }
      $this.setState({ formData: formData }, () => {
        props.onFormChange(formRef.state.formData, formRef);
      });
    }
  };

  useEffect(() => {
    const getApiSpec = async () => {
      const response = await invasivesApi.getCachedApiSpec();
      setSchemas({
        schema: { ...response.components.schemas[props.activity.activitySubtype], components: response.components },
        uiSchema: RootUISchemas[props.activity.activitySubtype]
      });
    };

    getApiSpec();
  }, [props.activity.activitySubtype]);

  if (!schemas.schema || !schemas.uiSchema) {
    return <CircularProgress />;
  }

  const isDisabled = props.isDisabled || props.activity?.sync?.status === ActivitySyncStatus.SAVE_SUCCESSFUL || false;

  return (
    <Box width="100%">
      {/* <Box mb={3}>
        <FormControlsComponent
          onSubmit={() => formRef.submit()}
          isDisabled={isDisabled}
          onCopy={props.copyFormData ? () => props.copyFormData() : null}
          onPaste={props.pasteFormData ? () => props.pasteFormData() : null}
          activitySubtype={props.activity.activitySubtype}
          hideCheckFormForErrors={props.hideCheckFormForErrors}
        />
      </Box> */}

      <ThemeProvider theme={themeType ? rjsfThemeDark : rjsfThemeLight}>
        <SelectAutoCompleteContextProvider>
          <Form
            ObjectFieldTemplate={ObjectFieldTemplate}
            FieldTemplate={FieldTemplate}
            ArrayFieldTemplate={ArrayFieldTemplate}
            widgets={{
              'multi-select-autocomplete': MultiSelectAutoComplete,
              'single-select-autocomplete': SingleSelectAutoComplete
            }}
            key={props.activity?._id}
            disabled={isDisabled}
            formData={props.activity?.formData || null}
            schema={schemas.schema}
            onFocus={focusHandler}
            onBlur={blurHandler}
            uiSchema={schemas.uiSchema}
            liveValidate={true}
            showErrorList={true}
            validate={props.customValidation}
            transformErrors={props.customErrorTransformer}
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
              props.onFormChange(event, formRef, focusedFieldArgs);
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
              if (props.setParentFormRef) {
                props.setParentFormRef(form);
              }
              setFormRef(form);
            }}>
            <React.Fragment />
          </Form>
        </SelectAutoCompleteContextProvider>
      </ThemeProvider>

      <Box mt={3}>
        <FormControlsComponent
          onSubmit={() => formRef.submit()}
          isDisabled={isDisabled}
          onCopy={props.copyFormData ? () => props.copyFormData() : null}
          onPaste={props.pasteFormData ? () => props.pasteFormData() : null}
          activitySubtype={props.activity.activitySubtype}
          hideCheckFormForErrors={props.hideCheckFormForErrors}
        />
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{'Are you sure?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{alertMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              proceedClick();
            }}
            color="primary"
            autoFocus>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormContainer;
