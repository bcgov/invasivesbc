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
import { Form } from '@rjsf/mui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { validatorForActivity } from 'rjsf/business-rules/customValidation';
import { SelectAutoCompleteContextProvider } from 'UI/Overlay/Records/Activity/form/SelectAutoCompleteContext';
import ArrayFieldTemplate from 'rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from 'rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from 'rjsf/templates/ObjectFieldTemplate';
import RootUISchemas from 'rjsf/uiSchema/RootUISchemas';
import MultiSelectAutoComplete from 'rjsf/widgets/MultiSelectAutoComplete';
import SingleSelectAutoComplete from 'rjsf/widgets/SingleSelectAutoComplete';
import rjsfTheme from 'UI/Overlay/Records/Activity/form/rjsfTheme';
import ChemicalTreatmentDetailsForm from './ChemicalTreatmentDetailsForm/ChemicalTreatmentDetailsForm';
import { useSelector } from 'util/use_selector';
import { useDispatch } from 'react-redux';
import {
  ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST,
  ACTIVITY_ERRORS,
  ACTIVITY_ON_FORM_CHANGE_REQUEST
} from 'state/actions';
import validator from '@rjsf/validator-ajv8';
import 'UI/Overlay/Records/Activity/form/aditionalFormStyles.css';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';
import _ from 'lodash';

const FormContainer: React.FC<any> = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%c FormContainer render:' + ref.current.toString(), 'color: yellow');

  const authenticated = useSelector((state) => state.Auth.authenticated);
  const username = useSelector((state) => state.Auth.username);
  const accessRoles = useSelector((state) => state.Auth.accessRoles);

  const formDataState = useSelector((state) => state.ActivityPage.activity.form_data);
  const activity_subtype = useSelector((state) => state.ActivityPage.activity.activity_subtype);
  const activity_type = useSelector((state) => state.ActivityPage.activity.activity_type);
  const activity_ID = useSelector((state) => state.ActivityPage.activity.activity_id);
  const created_by = useSelector((state) => state.ActivityPage.activity.created_by);

  const MOBILE = useSelector((state) => state.Configuration.current.MOBILE);
  const darkTheme = useSelector((state) => state.UserSettings.darkTheme);

  const apiDocsWithViewOptions = useSelector((state) => state.UserSettings.apiDocsWithViewOptions);
  const apiDocsWithSelectOptions = useSelector((state) => state.UserSettings.apiDocsWithSelectOptions);

  const suggestedTreatmentIDS = useSelector((state) => state.ActivityPage.suggestedTreatmentIDs);

  const dispatch = useDispatch();

  const debouncedFormChange = _.debounce((event, ref, lastField, callbackFun) => {
    //(event, ref, lastField, callbackFun) => {
    dispatch({
      type: ACTIVITY_ON_FORM_CHANGE_REQUEST,
      payload: { eventFormData: event.formData, lastField: lastField, unsavedDelay: null }
    });
  }, 1000);

  const errorTransformers = useCallback(() => {
    
    return getCustomErrorTransformer();
  }, []);

  const customValidators = useCallback(() => {
    
    return validatorForActivity(activity_subtype, null);
  }, [JSON.stringify(activity_subtype)]);

  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ schema: null, uiSchema: null });
  const formRef = React.createRef();
  const [focusedFieldArgs, setFocusedFieldArgs] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState(null);
  const [field, setField] = React.useState('');

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

  useEffect(() => {
    const currentState = formRef.current?.state;
    dispatch({ type: ACTIVITY_ERRORS, payload: { errors: currentState?.errors } });
  }, [formDataState]);

  //Dialog Proceed OnClick func
  const proceedClick = () => {
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
        debouncedFormChange({ formData: formRef.current.state.formData }, formRef, null, (updatedFormData) => {});
      });
    }, 100);
    handleClose();
  };

  const isActivityChemTreatment = () => {
    if (
      activity_subtype === 'Activity_Treatment_ChemicalPlantTerrestrial' ||
      activity_subtype === 'Activity_Treatment_ChemicalPlantAquatic'
    ) {
      return true;
    }
  };

  const ErrorListTemplate = (err: any) => {
    return (
      <>
        {err.errors?.length > 0 ? (
          <div>
            <br></br>
            <br></br>
            <br></br>
            <Typography color="error" variant="h6">
              Red text indicates mandatory entry in order to go from a status of Draft to Submitted. You can however
              save in progress work, and come back later.
            </Typography>
            
          </div>
        ) : null}
      </>
    );
  };

  useEffect(() => {
    const getApiSpec = async () => {
      
      const subtype = activity_subtype;
      if (!subtype) throw new Error('Activity has no Subtype specified');
      let components;
      const notMine = username !== created_by;
      const notAdmin =
        accessRoles?.filter((role) => {
          return [1, 18].includes(role.role_id);
        }).length === 0;
      if (notAdmin && notMine) {
        components = (apiDocsWithViewOptions as any).components;
      } else if (!notAdmin && notMine) {
        components = (apiDocsWithViewOptions as any).components;
      } else {
        components = (apiDocsWithSelectOptions as any).components;
      }

      let uiSchema = RootUISchemas[subtype];
      const subtypeSchema = components?.schemas?.[subtype];
      let modifiedSchema = subtypeSchema;
      // Handle activity_id linking fetches
      try {
        //const suggestedTreatmentIDs = activityStateInStore?.suggestedTreatmentIDs ?? [];

        if (activity_type === 'Monitoring') {
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
            try {
              // move this to action or reducer
              if (suggestedTreatmentIDS?.length) {
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
                          options: suggestedTreatmentIDS
                        }
                      }
                    }
                  }
                };
                components = {
                  ...components,
                  schemas: {
                    ...components.schemas,
                    [activity_subtype]: modifiedSchema
                  }
                };
              }
            } catch (e) {
              console.dir(e);
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
  }, [
    JSON.stringify(activity_subtype),
    JSON.stringify(authenticated),
    JSON.stringify(MOBILE),
    JSON.stringify(suggestedTreatmentIDS)
  ]);

  const [isDisabled, setIsDisabled] = useState(false);
  useEffect(() => {
    
    const notMine = username !== created_by;
    const notAdmin =
      accessRoles?.filter((role) => {
        return role.role_id === 18;
      }).length === 0;
    if (notAdmin && notMine) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [JSON.stringify(accessRoles), JSON.stringify(username)]);

  // hack to make fields rerender only on paste event
  const [keyInt, setKeyInt] = useState(0);
  const pasteCallback = () => {
    props.pasteFormData();
    setTimeout(() => {
      setKeyInt(keyInt + Math.random());
    }, 1500);
  };

  if (!schemas.schema || !schemas.uiSchema) {
    return <CircularProgress />;
  } else {
    return (
      <Box width="100%">
        <ThemeProvider theme={darkTheme ? rjsfThemeDark : rjsfThemeLight}>
          <SelectAutoCompleteContextProvider>
            <>
              <Form
                templates={{
                  ObjectFieldTemplate: ObjectFieldTemplate,
                  FieldTemplate: FieldTemplate,
                  ArrayFieldTemplate: ArrayFieldTemplate,
                  ErrorListTemplate: ErrorListTemplate
                }}
                widgets={{
                  'multi-select-autocomplete': MultiSelectAutoComplete,
                  'single-select-autocomplete': SingleSelectAutoComplete
                }}
                readonly={props.isDisabled}
                key={activity_ID + keyInt.toString()}
                disabled={false}
                formData={formDataState || null}
                schema={schemas.schema}
                uiSchema={schemas.uiSchema}
                liveValidate={true}
                customValidate={customValidators()}
                validator={validator}
                showErrorList={'top'}
                transformErrors={getCustomErrorTransformer()}
                autoComplete="off"
                onChange={(event) => {
                  
                  debouncedFormChange(event, formRef, focusedFieldArgs, (updatedFormData) => {
                    //setformData(updatedFormData);
                  });
                }}
                /*onSubmit={(event) => {
                  if (!props.onFormSubmitSuccess) {
                    return;
                  }
                  try {
                    props.onFormSubmitSuccess(event, formRef);
                  } catch (e) {
                    console.log(e);
                  }
                }}*/
                ref={formRef}>
                <React.Fragment />
              </Form>

              {isActivityChemTreatment() && (
                <ChemicalTreatmentDetailsForm
                  disabled={props.isDisabled}
                  activitySubType={activity_subtype || null}
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
                  form_data={formDataState}
                  schema={schemas.schema}
                />
              )}
            </>
          </SelectAutoCompleteContextProvider>
        </ThemeProvider>

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
