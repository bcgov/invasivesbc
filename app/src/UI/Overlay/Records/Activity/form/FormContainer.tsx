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
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import {
  ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST,
  ACTIVITY_ERRORS,
  ACTIVITY_ON_FORM_CHANGE_REQUEST
} from 'state/actions';
import validator from '@rjsf/validator-ajv8';
import 'UI/Overlay/Records/Activity/form/aditionalFormStyles.css';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';
import debounce from 'lodash.debounce';
import { RENDER_DEBUG } from 'UI/App';

const FormContainer: React.FC<any> = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%c FormContainer render:' + ref.current.toString(), 'color: yellow');

  const authenticated = useSelector((state) => state.Auth.authenticated);
  const username = useSelector((state) => state.Auth.username);
  const accessRoles = useSelector((state) => state.Auth.accessRoles);

  const formDataState = useSelector((state) => state.ActivityPage.activity.form_data);
  const pasteCount = useSelector((state) => state.ActivityPage.pasteCount);

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

  const activitySchema = useSelector((state: any) => state.ActivityPage.schema);
  const activityUISchema = useSelector((state: any) => state.ActivityPage.uiSchema);

  const debouncedFormChange = useCallback(
    debounce((event, ref, lastField, callbackFun) => {
      dispatch({
        type: ACTIVITY_ON_FORM_CHANGE_REQUEST,
        payload: { eventFormData: event.formData, lastField: lastField, unsavedDelay: null }
      });
    }, 1000),
    []
  );

  const errorTransformers = useCallback(() => {
    return getCustomErrorTransformer;
  }, []);

  const customValidators = useCallback(() => {
    return validatorForActivity(activity_subtype, null);
  }, [JSON.stringify(activity_subtype)]);
  const [focusedFieldArgs, setFocusedFieldArgs] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState(null);
  const [field, setField] = React.useState('');
  const formRef = React.createRef();

  const rjsfThemeDark = createTheme({
    ...rjsfTheme,
    palette: { ...rjsfTheme.palette, mode: 'dark' }
  } as ThemeOptions);
  const rjsfThemeLight = createTheme(rjsfTheme as ThemeOptions);

  //open dialog window (visual)
  const openDialog = () => setOpen(true);
  //close the dialog window (visual)
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const currentState = formRef.current?.state;
    dispatch({ type: ACTIVITY_ERRORS, payload: { errors: currentState?.errors } });
  }, [formRef]);

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
      const newFormData = $this.state.formData;
      newFormData.forceNoValidationFields = noValidationFields;
      $this.setState({ formData: newFormData }, () => {
        //revalidate formData after the setState is run
        $this.validate($this.state.formData);
        //update formData of the activity via onFormChange
        debouncedFormChange({ formData: formRef.current.state.formData }, formRef, null, (updatedFormData) => { });
      });
    }, 100);
    handleClose();
  };

  const isActivityChemTreatment = (): boolean => (
    activity_subtype === 'Activity_Treatment_ChemicalPlantTerrestrial' ||
    activity_subtype === 'Activity_Treatment_ChemicalPlantAquatic'
  );

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

  if (!activitySchema || !activityUISchema) {
    return <CircularProgress />;
  }
  return (
    <Box sx={{ pl: '15%', pr: '15%' }}>
      <ThemeProvider theme={darkTheme ? rjsfThemeDark : rjsfThemeLight}>
        <SelectAutoCompleteContextProvider>
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
            readonly={isDisabled}
            key={activity_ID + pasteCount}
            disabled={isDisabled}
            formData={formDataState || null}
            schema={activitySchema}
            uiSchema={activityUISchema}
            liveValidate={true}
            customValidate={customValidators()}
            validator={validator}
            showErrorList={'top'}
            transformErrors={getCustomErrorTransformer()}
            autoComplete="off"
            ref={formRef}
            onChange={(event) => {
              debouncedFormChange(event, formRef, focusedFieldArgs, (updatedFormData) => {
                //setformData(updatedFormData);
              });
            }}
          >
          </Form>
          {isActivityChemTreatment() && (
            <ChemicalTreatmentDetailsForm
              disabled={isDisabled}
              activitySubType={activity_subtype || null}
              onChange={(form_data, callback) => {
                //todo redux chem treatment form on change
                dispatch({
                  type: ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST,
                  payload: {
                    eventFormData: form_data
                  }
                });
                if (callback) {
                  callback();
                }
              }}
              form_data={formDataState}
            />
          )}
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
            onClick={proceedClick}
            color="primary"
            autoFocus>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
};

export default FormContainer;
