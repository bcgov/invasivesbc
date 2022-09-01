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
} from '@mui/material';
import { ISubmitEvent } from '@rjsf/core';
import { MuiForm5 as Form } from '@rjsf/material-ui';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivitySyncStatus } from '../../constants/activities';
import { SelectAutoCompleteContextProvider } from '../../contexts/SelectAutoCompleteContext';
import { ThemeContext } from 'utils/CustomThemeProvider';
import { useDataAccess } from '../../hooks/useDataAccess';
import { getShortActivityID } from 'utils/addActivity';
import ArrayFieldTemplate from '../../rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from '../../rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from '../../rjsf/templates/ObjectFieldTemplate';
import RootUISchemas from '../../rjsf/uiSchema/RootUISchemas';
import MultiSelectAutoComplete from '../../rjsf/widgets/MultiSelectAutoComplete';
import SingleSelectAutoComplete from '../../rjsf/widgets/SingleSelectAutoComplete';
import rjsfTheme from '../../themes/rjsfTheme';
import FormControlsComponent, { IFormControlsComponentProps } from './FormControlsComponent';
import ChemicalTreatmentDetailsForm from './ChemicalTreatmentDetailsForm/ChemicalTreatmentDetailsForm';
import PasteButtonComponent from './PasteButtonComponent';
import { useSelector } from '../../state/utilities/use_selector';
import { selectAuth } from '../../state/reducers/auth';
import { selectConfiguration } from '../../state/reducers/configuration';
import { selectActivity } from 'state/reducers/activity';
import { useDispatch } from 'react-redux';
import { ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST } from 'state/actions';

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
  onFormChange?: (event: any, formRef: any, focusedField?: string, callback?: (updatedFormData) => void) => any;
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
  onSubmitAsOfficial?: Function;
  isAlreadySubmitted: () => boolean;
  canBeSubmittedWithoutErrors: () => boolean;
  OnNavBack?: Function;
}

const FormContainer: React.FC<IFormContainerProps> = (props) => {
  const dataAccess = useDataAccess();
  const [formData, setformData] = useState(props.activity?.form_data);
  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ schema: null, uiSchema: null });
  const formRef = useRef(null);
  const [focusedFieldArgs, setFocusedFieldArgs] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState(null);
  const [field, setField] = React.useState('');
  const { roles, accessRoles, authenticated } = useSelector(selectAuth);
  const { MOBILE } = useSelector(selectConfiguration);

  const dispatch = useDispatch();
  const activityStateInStore = useSelector(selectActivity);

  /*
  useEffect(() => {
    if (!activityStateInStore.activity.form_data) {
      return;
    }
    setformData(props.activity?.formData);
  }, [props.activity]);
  */

  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const rjsfThemeDark = createTheme({
    ...rjsfTheme,
    palette: { ...rjsfTheme.palette, mode: 'dark' }
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
    alert('proceed click');
    //setTimeout is called so that the setState works as expected
    setTimeout(() => {
      const $this = formRef.current;
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
        props.onFormChange({ formData: formRef.current.state.formData }, formRef, null, (updatedFormData) => {
          setformData(updatedFormData);
        });
      });
    }, 100);
    handleClose();
  };

  //helper function to get field name from args
  const getFieldNameFromArgs = (args): string => {
    let argumentFieldName = '';
    if (args[0].includes('root_activity_subtype_data_Treatment_ChemicalPlant_Information_ntz_reduction_')) {
      argumentFieldName = 'root_activity_subtype_data_Treatment_ChemicalPlant_Information_ntz_reduction_';
    } else if (args[0].includes('root_activity_subtype_data_Treatment_ChemicalPlant_Information_')) {
      argumentFieldName = 'root_activity_subtype_data_Treatment_ChemicalPlant_Information_';
    } else if (
      args[0].includes('root_activity_subtype_data_Weather_Conditions_') &&
      !props.activity.activity_subtype.toString().toLowerCase().includes('biocontrol')
    ) {
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
    const $this = formRef.current;
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
  const focusHandler = (args: string[]) => {
    if (formRef) {
      let field = getFieldNameFromArgs(args);
      setFocusedFieldArgs(args);
      const $this = formRef.current;
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
      let modifiedSchema = subtypeSchema;
      // Handle activity_id linking fetches
      try {
        if (props.activity?.activity_type === 'Monitoring') {
          if (MOBILE) {
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
            let linkedActivitySubtypes = [];

            switch (subtype) {
              case 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant':
                linkedActivitySubtypes = [
                  'Activity_Treatment_MechanicalPlantTerrestrial',
                  'Activity_Treatment_MechanicalPlantAquatic'
                ];
                break;
              case 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant':
                linkedActivitySubtypes = [
                  'Activity_Treatment_ChemicalPlantTerrestrial',
                  'Activity_Treatment_ChemicalPlantAquatic'
                ];
                break;
              case 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant':
                linkedActivitySubtypes = ['Activity_Biocontrol_Release'];
                break;
              default:
                break;
            }

            const treatments_response = await dataAccess.getActivities({
              column_names: ['activity_id', 'created_timestamp', 'activity_subtype'],
              activity_type: ['Treatment', 'Biocontrol'],
              activity_subtype: linkedActivitySubtypes,
              order: ['created_timestamp'],
              user_roles: accessRoles
            });
            const treatments = treatments_response.rows.map((treatment, i) => {
              const shortActID = getShortActivityID(treatment);
              return {
                label: shortActID,
                title: shortActID,
                value: treatment.activity_id,
                'x-code_sort_order': i + 1
              };
            });
            if (treatments?.length) {
              modifiedSchema = {
                ...modifiedSchema,
                properties: {
                  ...modifiedSchema?.properties,
                  activity_type_data: {
                    ...modifiedSchema?.properties.activity_type_data,
                    properties: {
                      ...modifiedSchema?.properties.activity_type_data.properties,
                      linked_id: {
                        ...modifiedSchema?.properties?.activity_type_data?.properties?.linked_id,
                        options: treatments
                      }
                    }
                  }
                }
              };
              components = {
                ...components,
                schemas: {
                  ...components.schemas,
                  [props.activity.activity_subtype]: modifiedSchema
                }
              };
            }
          }
        }
      } catch (error) {
        console.log('Could not load Activity IDs of linkable records');
      }
      setSchemas({
        schema: { ...modifiedSchema, components: components },
        uiSchema: uiSchema
      });
    };
    if (authenticated) {
      getApiSpec();
    }
  }, [props.activity.activity_subtype, authenticated, props.activity.activity_subtype, MOBILE]);

  const isDisabled = props.isDisabled || props.activity?.sync?.status === ActivitySyncStatus.SAVE_SUCCESSFUL || false;

  if (!schemas.schema || !schemas.uiSchema) {
    return <CircularProgress />;
  } else {
    return (
      <Box width="100%">
        <ThemeProvider theme={themeType ? rjsfThemeDark : rjsfThemeLight}>
          <SelectAutoCompleteContextProvider>
            <>
              <Box mt={3}>
                <PasteButtonComponent
                  onSubmit={() => {
                    //https://github.com/rjsf-team/react-jsonschema-form/issues/2104#issuecomment-847924986
                    (formRef.current as any).formElement.dispatchEvent(
                      new CustomEvent('submit', {
                        cancelable: true,
                        bubbles: true // <-- actual fix
                      })
                    );
                  }}
                  isDisabled={isDisabled}
                  activitySubtype={props.activity.activity_subtype}
                  onCopy={props.copyFormData ? () => props.copyFormData() : null}
                  onPaste={props.pasteFormData ? () => props.pasteFormData() : null}
                  {...props}
                  onSubmitAsOfficial={props.onSubmitAsOfficial ? () => props.onSubmitAsOfficial() : null}
                />
              </Box>
              <Form
                ObjectFieldTemplate={ObjectFieldTemplate}
                FieldTemplate={FieldTemplate}
                ArrayFieldTemplate={ArrayFieldTemplate}
                widgets={{
                  'multi-select-autocomplete': MultiSelectAutoComplete,
                  'single-select-autocomplete': SingleSelectAutoComplete
                }}
                readonly={props.isDisabled}
                key={props.activity?._id}
                disabled={isDisabled}
                //formData={formData || null}
                formData={activityStateInStore.activity.form_data || null}
                schema={schemas.schema}
                onFocus={(...args: string[]) => {
                  focusHandler(args);
                }}
                onBlur={(...args: string[]) => {
                  blurHandler(args);
                }}
                uiSchema={schemas.uiSchema}
                formContext={{
                  suggestedJurisdictions: props.suggestedJurisdictions || []
                }}
                liveValidate={true}
                validate={props.customValidation}
                showErrorList={true}
                transformErrors={props.customErrorTransformer}
                autoComplete="off"
                ErrorList={(err) => {
                  return (
                    <div>
                      <br></br>
                      <br></br>
                      <br></br>
                      <Typography color="error" variant="h6">
                        Red text indicates mandatory entry in order to go from a status of Draft to Submitted. You can
                        however save in progress work, and come back later.
                      </Typography>
                    </div>
                  );
                }}
                onChange={(event) => {
                  props.onFormChange(event, formRef, focusedFieldArgs, (updatedFormData) => {
                    //setformData(updatedFormData);
                  });
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
                  try {
                    props.onFormSubmitSuccess(event, formRef);
                  } catch (e) {
                    console.log(e);
                  }
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
                  formRef.current = form;
                }}>
                <React.Fragment />
              </Form>

              {isActivityChemTreatment() && (
                <ChemicalTreatmentDetailsForm
                  disabled={props.isDisabled}
                  activitySubType={activityStateInStore.activity.activity_subtype || null}
                  onChange={(form_data, callback) => {
                    //todo redux chem treatment form on change
                    dispatch({
                      type: ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST,
                      payload: {
                        eventFormData: form_data
                      }
                    });
                    //setformData(formData);
                    if (callback !== null) {
                      callback();
                    }
                  }}
                  form_data={activityStateInStore.activity.form_data}
                  schema={schemas.schema}
                />
              )}
            </>
          </SelectAutoCompleteContextProvider>
        </ThemeProvider>

        <Box mt={3} style={{ paddingBottom: '50px' }}>
          <FormControlsComponent
            onSubmit={() => {
              //https://github.com/rjsf-team/react-jsonschema-form/issues/2104#issuecomment-847924986
              (formRef.current as any).formElement.dispatchEvent(
                new CustomEvent('submit', {
                  cancelable: true,
                  bubbles: true // <-- actual fix
                })
              );
            }}
            isDisabled={isDisabled}
            activitySubtype={props.activity.activity_subtype}
            onCopy={props.copyFormData ? () => props.copyFormData() : null}
            onPaste={props.pasteFormData ? () => props.pasteFormData() : null}
            {...props}
            onSubmitAsOfficial={props.onSubmitAsOfficial ? () => props.onSubmitAsOfficial() : null}
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
};

export default FormContainer;
