import { Box, Button, CircularProgress, createTheme, ThemeOptions, ThemeProvider, Typography } from '@mui/material';
import { Form } from '@rjsf/mui';
import CoreForm from '@rjsf/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import AgentSelectAutoComplete from 'rjsf/widgets/AgentSelectAutoComplete';

const FormContainer = () => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%c FormContainer render:' + ref.current.toString(), 'color: yellow');
  }

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

  const darkTheme = useSelector((state) => state.UserSettings.darkTheme);

  const dispatch = useDispatch();

  const activitySchema = useSelector((state) => state.ActivityPage.schema);
  const activityUISchema = useSelector((state) => state.ActivityPage.uiSchema);

  const debouncedFormChange = useCallback(
    debounce((event, ref, lastField) => {
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
  const formRef: React.RefObject<CoreForm> = React.createRef();

  const rjsfThemeDark = createTheme({
    ...rjsfTheme,
    palette: { ...rjsfTheme.palette, mode: 'dark' }
  } as ThemeOptions);
  const rjsfThemeLight = createTheme(rjsfTheme as ThemeOptions);

  useEffect(() => {
    const currentState = formRef.current?.state;
    dispatch({ type: ACTIVITY_ERRORS, payload: { errors: currentState?.errors } });
  }, [formRef]);

  const isActivityChemTreatment = (): boolean =>
    activity_subtype === 'Activity_Treatment_ChemicalPlantTerrestrial' ||
    activity_subtype === 'Activity_Treatment_ChemicalPlantAquatic';

  const ErrorListTemplate = (err: { errors?: unknown[] }) => {
    return (
      <>
        {(err.errors?.length || 0) > 0 && (
          <div>
            <Typography color="error" sx={{ mt: 8, mb: 4 }}>
              Red text indicates mandatory entry in order to go from a status of Draft to Submitted. You can however
              save in progress work, and come back later.
            </Typography>
          </div>
        )}
      </>
    );
  };

  const [createdByUser] = useState<boolean>(username === created_by);
  const [userIsAdmin] = useState<boolean>(accessRoles?.some((role) => role.role_id === 18));
  const [isDisabled, setIsDisabled] = useState(!createdByUser);

  if (!activitySchema || !activityUISchema) {
    return <CircularProgress />;
  }
  return (
    <Box sx={{ pl: '15%', pr: '15%' }}>
      <ThemeProvider theme={darkTheme ? rjsfThemeDark : rjsfThemeLight}>
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
              'agent-select-autocomplete': AgentSelectAutoComplete
            }}
            readonly={isDisabled}
            key={activity_ID + pasteCount + reported_area}
            disabled={isDisabled}
            formData={formDataState}
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
              debouncedFormChange(event, formRef, null);
            }}
          >
            <React.Fragment />
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
    </Box>
  );
};

export default FormContainer;
