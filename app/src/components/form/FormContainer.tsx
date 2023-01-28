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
import React, { useEffect, useRef, useState } from 'react';
import { ActivitySyncStatus } from '../../constants/activities';
import { SelectAutoCompleteContextProvider } from '../../contexts/SelectAutoCompleteContext';
import { useDataAccess } from '../../hooks/useDataAccess';
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
import { selectUserSettings } from 'state/reducers/userSettings';
import validator from '@rjsf/validator-ajv6';

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
  const formRef = React.createRef();
  const [focusedFieldArgs, setFocusedFieldArgs] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState(null);
  const [field, setField] = React.useState('');
  const { authenticated } = useSelector(selectAuth);
  const { MOBILE } = useSelector(selectConfiguration);

  const dispatch = useDispatch();
  const { darkTheme } = useSelector(selectUserSettings);
  const activityStateInStore = useSelector(selectActivity);


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

  const ErrorListTemplate = (err) => {
    return (
      <div>
        <br></br>
        <br></br>
        <br></br>
        <Typography color="error" variant="h6">
          Red text indicates mandatory entry in order to go from a status of Draft to Submitted. You can however save in
          progress work, and come back later.
        </Typography>
      </div>
    );
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
        const suggestedTreatmentIDs = activityStateInStore?.suggestedTreatmentIDs ?? [];

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
            try {
              // move this to action or reducer
              if (suggestedTreatmentIDs?.length) {
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
                          options: suggestedTreatmentIDs
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
  }, [props.activity.activity_subtype, authenticated, MOBILE, activityStateInStore.suggestedTreatmentIDs]);

  const [isDisabled, setIsDisabled] = useState(false);
  useEffect(() => {
    const notMine = authState.username !== activityStateInStore.activity.created_by;
    console.log('notmine', notMine);
    const notAdmin =
      authState.accessRoles.filter((role) => {
        return role.role_id === 18
      }).length === 0;
    console.log('not admin', notAdmin);
    if (notAdmin && notMine) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [JSON.stringify(authState.accessRoles), JSON.stringify(authState.username)]);

  if (!schemas.schema || !schemas.uiSchema) {
    return <CircularProgress />;
  } else {
    return (
      <Box width="100%">
        <ThemeProvider theme={darkTheme ? rjsfThemeDark : rjsfThemeLight}>
          <SelectAutoCompleteContextProvider>
            <>
              <Box mt={3}>
                <PasteButtonComponent
                  onSubmit={() => {
                    //https://github.com/rjsf-team/react-jsonschema-form/issues/2104#issuecomment-847924986
                    (formRef.current as any).formElement.current.dispatchEvent(
                      new CustomEvent('submit', {
                        cancelable: true,
                        bubbles: true // <-- actual fix
                      })
                    );
                  }}
                  isDisabled={isDisabled}
                  activity_subtype={props.activity.activity_subtype}
                  onCopy={props.copyFormData ? () => props.copyFormData() : null}
                  onPaste={props.pasteFormData ? () => props.pasteFormData() : null}
                  {...props}
                  onSubmitAsOfficial={props.onSubmitAsOfficial ? () => props.onSubmitAsOfficial() : null}
                />
              </Box>
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
                key={props.activity?._id}
                disabled={isDisabled}
                formData={activityStateInStore.activity.form_data || null}
                schema={schemas.schema}
                uiSchema={schemas.uiSchema}
                liveValidate={true}
                customValidate={props.customValidation}
                validator={validator}
                showErrorList={'top'}
                transformErrors={props.customErrorTransformer}
                autoComplete="off"
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
                ref={formRef}
                >
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
              console.dir(formRef);
              //https://github.com/rjsf-team/react-jsonschema-form/issues/2104#issuecomment-847924986
              (formRef.current as any).formElement.current.dispatchEvent(
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
