import { Capacitor } from '@capacitor/core';
import {
  Box,
  Button,
  CircularProgress,
  createTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ThemeOptions,
  ThemeProvider,
  Typography
} from '@material-ui/core';
import { ISubmitEvent } from '@rjsf/core';
import { MuiForm5 as Form } from '@kerematam/rjsf-mui';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityMonitoringLinks, ActivitySyncStatus } from '../../constants/activities';
import { SelectAutoCompleteContextProvider } from '../../contexts/SelectAutoCompleteContext';
import { ThemeContext } from '../../contexts/themeContext';
import { useDataAccess } from '../../hooks/useDataAccess';
import ArrayFieldTemplate from '../../rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from '../../rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from '../../rjsf/templates/ObjectFieldTemplate';
import RootUISchemas from '../../rjsf/uiSchema/RootUISchemas';
import MultiSelectAutoComplete from '../../rjsf/widgets/MultiSelectAutoComplete';
import SingleSelectAutoComplete from '../../rjsf/widgets/SingleSelectAutoComplete';
import rjsfTheme from '../../themes/rjsfTheme';
import { getShortActivityID } from '../../utils/addActivity';
import FormControlsComponent, { IFormControlsComponentProps } from './FormControlsComponent';
import ChemicalTreatmentDetailsForm from './ChemicalTreatmentDetailsForm/ChemicalTreatmentDetailsForm';
// import './aditionalFormStyles.css';
export interface IFormContainerProps extends IFormControlsComponentProps {
  classes?: any;
  activity: any;
  customValidation?: any;
  customErrorTransformer?: any;
  isDisabled?: boolean;
  pasteFormData?: Function;
  suggestedJurisdictions?: any[];
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
  onSave?: Function;
  saveStatus?: string;
  disableSave?: boolean;
  onReview?: Function;
  reviewStatus?: string;
  disableReview?: boolean;
  onApprove?: Function;
  disableApprove?: boolean;
  onDisapprove?: Function;
  disableDisapprove?: boolean;
}

const FormContainer: React.FC<IFormContainerProps> = (props) => {
  const dataAccess = useDataAccess();

  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ schema: null, uiSchema: null });
  const [formRef, setFormRef] = useState(null);
  const [focusedFieldArgs, setFocusedFieldArgs] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState(null);
  const [field, setField] = React.useState('');

  const [lastPreservedEvent, setlastPreservedEvent] = useState(null);
  const [blurTriggered, setblurTriggered] = useState(null);

  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const rjsfThemeDark = createTheme({
    ...rjsfTheme,
    palette: { ...rjsfTheme.palette, type: 'dark' }
  } as ThemeOptions);
  const rjsfThemeLight = createTheme(rjsfTheme as ThemeOptions);

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
    if (args[0].includes('root_activity_subtype_data_treatment_information_herbicide_0_')) {
      argumentFieldName = 'root_activity_subtype_data_treatment_information_herbicide_0_';
    } else if (args[0].includes('root_activity_subtype_data_Treatment_ChemicalPlant_Information_')) {
      argumentFieldName = 'root_activity_subtype_data_Treatment_ChemicalPlant_Information_';
    } else if (args[0].includes('root_activity_subtype_data_Weather_Conditions_')) {
      argumentFieldName = 'root_activity_subtype_data_Weather_Conditions_';
    } else if (args[0].includes('root_activity_data_')) {
      argumentFieldName = 'root_activity_data_';
    }
    if (args[0].includes('application_rate')) {
      argumentFieldName = 'application_rate';
    }
    let fieldName = argumentFieldName ? args[0].substr(argumentFieldName.length) : args[0]; // else use the full arg name

    return fieldName;
  };

  const isActivityChemTreatment = () => {
    if (
      props.activity.activity_subtype === 'Activity_Treatment_ChemicalPlantTerrestrial' ||
      props.activity.activity_subtype === 'Activity_Treatment_ChemicalPlantAquatic' ||
      props.activity.activitySubtype === 'Activity_Treatment_ChemicalPlantTerrestrial' ||
      props.activity.activitySubtype === 'Activity_Treatment_ChemicalPlantAquatic'
    ) {
      return true;
    }
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
  const blurHandler = (args: string[]) => {
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

  useEffect(() => {
    if (!props.onFormChange || !lastPreservedEvent) {
      return;
    }
    props.onFormChange(lastPreservedEvent, formRef, focusedFieldArgs);
  }, [blurTriggered]);

  //handle focus the field
  //onFocus - if the field that is being focused is in forceNoValidation fields, remove it from there,
  //so that the user will be tasked to force the value out of range again
  const focusHandler = (args: string[]) => {
    if (formRef) {
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
          props.onFormChange({ formData: formData }, formRef);
        });
      }
    }
  };

  useEffect(() => {
    const getApiSpec = async () => {
      const subtype = props.activity?.activity_subtype || props.activity?.activitySubtype;
      if (!subtype) throw new Error('Activity has no Subtype specified');
      const response = await dataAccess.getCachedApiSpec();
      let components = response.components;
      let uiSchema = RootUISchemas[subtype];
      const subtypeSchema = components?.schemas?.[subtype];
      // Handle activity_id linking fetches
      try {
        if (props.activity?.activityType === 'Monitoring') {
          if (Capacitor.getPlatform() !== 'web') {
            uiSchema = {
              ...uiSchema,
              activity_type_data: {
                ...uiSchema?.activity_type_data,
                linked_id: {
                  ...uiSchema?.activity_type_data?.linked_id,
                  'ui:widget': undefined
                }
              }
            };
          } else {
            const treatments_response = await dataAccess.getActivities({
              column_names: ['activity_id', 'created_timestamp'],
              activity_type: ['Treatment'],
              activity_subtype: [ActivityMonitoringLinks[subtype]],
              order: ['created_timestamp']
            });
            const treatments = treatments_response.rows.map((treatment, i) => {
              const short_id = getShortActivityID({
                ...treatment,
                activity_subtype: ActivityMonitoringLinks[subtype]
              });
              return {
                enum: [treatment.activity_id],
                title: short_id + ' : ' + treatment.activity_id,
                type: 'string',
                'x-code_sort_order': i + 1
              };
            });

            if (treatments?.length) {
              let modifiedSchema = components.schemas['Monitoring'];
              modifiedSchema = {
                ...modifiedSchema,
                properties: {
                  ...modifiedSchema?.properties,
                  linked_id: {
                    ...modifiedSchema?.properties?.linked_id
                    // anyOf: treatments
                  }
                }
              };
              components = {
                ...components,
                schemas: {
                  ...components.schemas,
                  Monitoring: modifiedSchema
                }
              };
            }
          }
        }

        // put Treatments => Observations linking here
      } catch (error) {
        console.log('Could not load Activity IDs of linkable records');
      }
      setSchemas({
        schema: { ...subtypeSchema, components: components },
        uiSchema: uiSchema
      });
    };

    getApiSpec();
  }, [props.activity.activitySubtype, props.activity.activity_subtype]);

  const isDisabled = props.isDisabled || props.activity?.sync?.status === ActivitySyncStatus.SAVE_SUCCESSFUL || false;

  return useMemo(() => {
    if (!schemas.schema || !schemas.uiSchema) {
      return <CircularProgress />;
    } else {
      return (
        <Box width="100%">
          <ThemeProvider theme={themeType ? rjsfThemeDark : rjsfThemeLight}>
            <SelectAutoCompleteContextProvider>
              <>
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
                  onFocus={(...args: string[]) => {
                    focusHandler(args);
                  }}
                  onBlur={(...args: string[]) => {
                    blurHandler(args);
                    setblurTriggered(Math.random());
                  }}
                  uiSchema={schemas.uiSchema}
                  formContext={{ suggestedJurisdictions: props.suggestedJurisdictions || [] }}
                  liveValidate={false}
                  showErrorList={true}
                  validate={props.customValidation}
                  transformErrors={props.customErrorTransformer}
                  autoComplete="off"
                  ErrorList={(err) => {
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
                    setlastPreservedEvent(event);
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

                {isActivityChemTreatment() && (
                  <ChemicalTreatmentDetailsForm
                    activitySubType={props.activity.activitySubtype || props.activity.activity_subtype || null}
                    onChange={props.onFormChange}
                    formData={props.activity?.formData || null}
                    schema={schemas.schema}
                  />
                )}
              </>
            </SelectAutoCompleteContextProvider>
          </ThemeProvider>

          <Box mt={3}>
            <FormControlsComponent
              onSubmit={() => {
                formRef.submit();
              }}
              isDisabled={isDisabled}
              activitySubtype={props.activity.activitySubtype}
              onCopy={props.copyFormData ? () => props.copyFormData() : null}
              onPaste={props.pasteFormData ? () => props.pasteFormData() : null}
              {...props}
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
    }
  }, [props.activity?.formData, schemas, props.onFormChange, formRef]);
};

export default FormContainer;
