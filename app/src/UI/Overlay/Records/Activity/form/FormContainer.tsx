import { Box, Button, CircularProgress, createTheme, ThemeOptions, ThemeProvider } from '@mui/material';
import { Form } from '@rjsf/mui';
import CoreForm from '@rjsf/core';
import { createRef, Fragment, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { validatorForActivity } from 'rjsf/business-rules/customValidation';
import { SelectAutoCompleteContextProvider } from 'UI/Overlay/Records/Activity/form/SelectAutoCompleteContext';
import ArrayFieldTemplate from 'rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from 'rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from 'rjsf/templates/ObjectFieldTemplate';
import MultiSelectAutoComplete from 'rjsf/widgets/MultiSelectAutoComplete';
import SingleSelectAutoComplete from 'rjsf/widgets/SingleSelectAutoComplete';
import rjsfTheme from 'UI/Overlay/Records/Activity/form/rjsfTheme';
import ChemicalTreatmentDetailsForm from './ChemicalTreatmentDetailsForm/ChemicalTreatmentDetailsForm';
import { useSelector } from 'utils/use_selector';
import { shallowEqual, useDispatch } from 'react-redux';
import { ACTIVITY_ERRORS, ACTIVITY_ON_FORM_CHANGE_REQUEST } from 'state/actions';
import validator from '@rjsf/validator-ajv8';
import 'UI/Overlay/Records/Activity/form/aditionalFormStyles.css';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';
import debounce from 'lodash.debounce';
import { RENDER_DEBUG } from 'UI/App';
import AgentSelectAutoComplete from 'rjsf/widgets/AgentSelectAutoComplete';
import LinkedIdSelectAutoComplete from 'rjsf/widgets/LinkedIdSelectAutoComplete';
import ErrorListTemplate from './ErrorListTemplate';
import Activity from 'state/actions/activity/Activity';

const FormContainer = () => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%c FormContainer render:' + ref.current.toString(), 'color: yellow');
  }

  const dispatch = useDispatch();

  const username = useSelector((state) => state.Auth.username);
  const accessRoles = useSelector((state) => state.Auth.accessRoles);

  const formDataState = useSelector(
    (state) => state.ActivityPage.activity.form_data,
    (a, b) => {
      if (a == null || b == null) {
        return a == b;
      }

      if (shallowEqual(a.activity_data, b.activity_data)) {
        return true;
      }

      return shallowEqual(a, b);
    }
  );

  const pasteCount = useSelector((state) => state.ActivityPage.pasteCount);

  const activity_subtype = useSelector((state) => state.ActivityPage.activity.activity_subtype);
  const activity_ID = useSelector((state) => state.ActivityPage.activity.activity_id);
  const created_by = useSelector((state) => state.ActivityPage.activity.created_by);
  const reported_area = useSelector((state) => state.ActivityPage.activity.form_data.activity_data?.reported_area);

  const activitySchema = useSelector((state) => state.ActivityPage.schema);
  const activityUISchema = useSelector((state) => state.ActivityPage.uiSchema);

  const [createdByUser] = useState<boolean>(username === created_by);
  const [userIsAdmin] = useState<boolean>(accessRoles?.some((role) => role.role_id === 18));
  const [isDisabled, setIsDisabled] = useState<boolean>(!createdByUser);

  const debouncedFormChange = useCallback(
    debounce((event, _, lastField) => {
      dispatch({
        type: ACTIVITY_ON_FORM_CHANGE_REQUEST,
        payload: { eventFormData: event.formData, lastField: lastField, unsavedDelay: null }
      });
    }, 1000),
    []
  );

  const customValidators = useCallback(() => {
    return validatorForActivity(activity_subtype, null);
  }, [JSON.stringify(activity_subtype)]);
  const formRef: RefObject<CoreForm> = createRef();

  const theme = createTheme(rjsfTheme as ThemeOptions);

  useEffect(() => {
    if (isActivityChemTreatment()) {
      formRef.current?.validateForm();
    }
    const currentState = formRef.current?.state;
    dispatch({ type: ACTIVITY_ERRORS, payload: { errors: currentState?.errors } });
  }, [formRef]);

  const isActivityChemTreatment = (): boolean =>
    activity_subtype === 'Activity_Treatment_ChemicalPlantTerrestrial' ||
    activity_subtype === 'Activity_Treatment_ChemicalPlantAquatic';

  if (!activitySchema || !activityUISchema) {
    return <CircularProgress />;
  }
  return (
    <Box sx={{ px: '15%' }}>
      <ThemeProvider theme={theme}>
        <SelectAutoCompleteContextProvider>
          {!createdByUser && userIsAdmin && (
            <div className="editFormButtonCont">
              <Button variant="contained" color="warning" onClick={() => setIsDisabled((prev) => !prev)}>
                {isDisabled ? 'Enable Editing' : 'Disable Editing'}
              </Button>
            </div>
          )}
          <Form
            templates={{
              ObjectFieldTemplate: ObjectFieldTemplate,
              FieldTemplate: FieldTemplate,
              ArrayFieldTemplate: ArrayFieldTemplate,
              ErrorListTemplate: ErrorListTemplate
            }}
            widgets={{
              'multi-select-autocomplete': MultiSelectAutoComplete,
              'single-select-autocomplete': SingleSelectAutoComplete,
              'agent-select-autocomplete': AgentSelectAutoComplete,
              'linked-id-select-autocomplete': LinkedIdSelectAutoComplete
            }}
            readonly={isDisabled}
            key={activity_ID + pasteCount + reported_area}
            disabled={isDisabled}
            formData={formDataState}
            schema={activitySchema}
            uiSchema={activityUISchema}
            onError={() => {}}
            liveValidate={true}
            customValidate={customValidators()}
            validator={validator}
            showErrorList={'top'}
            transformErrors={getCustomErrorTransformer()}
            autoComplete="off"
            ref={formRef}
            onChange={(event) => debouncedFormChange(event, formRef, null)}
          >
            {/* This seemingly useless Fragment prevents a generic submit button from rendering through RJSF */}
            <Fragment />
          </Form>

          {isActivityChemTreatment() && (
            <ChemicalTreatmentDetailsForm
              activitySubType={activity_subtype ?? null}
              disabled={isDisabled}
              onChange={(form_data, callback) => {
                dispatch(Activity.ChemicalTreatments.onChemicalTreatmentsUpdate(form_data));
                if (callback) {
                  callback();
                }
              }}
              form_data={formDataState}
            />
          )}
        </SelectAutoCompleteContextProvider>
      </ThemeProvider>
    </Box>
  );
};

export default FormContainer;
