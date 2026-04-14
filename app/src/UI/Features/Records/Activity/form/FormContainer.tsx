import { Box, Button, CircularProgress, createTheme, Theme, ThemeOptions, ThemeProvider } from '@mui/material';
import { Form } from '@rjsf/mui';
import CoreForm from '@rjsf/core';
import { createRef, Fragment, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { SelectAutoCompleteContextProvider } from 'UI/Features/Records/Activity/form/SelectAutoCompleteContext';
import ArrayFieldTemplate from 'rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from 'rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from 'rjsf/templates/ObjectFieldTemplate';
import MultiSelectAutoComplete from 'rjsf/widgets/MultiSelectAutoComplete';
import SingleSelectAutoComplete from 'rjsf/widgets/SingleSelectAutoComplete';
import rjsfTheme from 'UI/Features/Records/Activity/form/rjsfTheme';
import ChemicalTreatmentDetailsForm from 'UI/Features/Records/Activity/form/ChemicalTreatmentDetailsForm/ChemicalTreatmentDetailsForm';
import { useSelector } from 'utils/use_selector';
import { shallowEqual, useDispatch } from 'react-redux';
import validator from '@rjsf/validator-ajv8';
import 'UI/Features/Records/Activity/form/aditionalFormStyles.css';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';
import debounce from 'lodash.debounce';
import { RENDER_DEBUG } from 'UI/App';
import AgentSelectAutoComplete from 'rjsf/widgets/AgentSelectAutoComplete';
import LinkedIdSelectAutoComplete from 'rjsf/widgets/LinkedIdSelectAutoComplete';
import ErrorListTemplate from 'UI/Features/Records/Activity/form/ErrorListTemplate';
import Activity from 'state/actions/activity/Activity';
import { ActivitySubtype } from 'sharedAPI';
import { validatorForActivity } from 'rjsf/business-rules/custom-validation/activity';
import ArrayItemTemplate from 'rjsf/templates/ArrayItemTemplate';
import ArrayItemButtonTemplate from 'rjsf/templates/ArrayFieldButtonTemplate';
import FundingAgencySelectAutoComplete from 'rjsf/widgets/FundingAgencySelectAutoComplete';
import EmployerSelectAutoComplete from 'rjsf/widgets/EmployerSelectAutoComplete';
import FormMenuButtons from '../../FormMenuButtons/FormMenuButtons';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';

const FormContainer = () => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%c FormContainer render:' + ref.current.toString(), 'color: yellow');
  }

  const dispatch = useDispatch();

  const FORM_UPDATE_THROTTLE_DELAY = 250; //ms
  const FORM_UPDATE_MAX_DELAY = 3000; //ms

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

  const activity_ID = useSelector((state) => state.ActivityPage.activity?.activity_id);
  const activity_subtype = useSelector((state) => state.ActivityPage.activity.activity_subtype);
  const activitySchema = useSelector((state) => state.ActivityPage.schema);
  const activityUISchema = useSelector((state) => state.ActivityPage.uiSchema);
  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);

  const can_edit = useSelector((state) => !!state.ActivityPage?.activeActivityPermissions?.can_edit);
  const created_by = useSelector((state) => state.ActivityPage.activity.created_by);
  const pasteCount = useSelector((state) => state.ActivityPage.pasteCount);
  const reported_area = useSelector((state) => state.ActivityPage.activity.form_data.activity_data?.reported_area);
  const username = useSelector((state) => state.Auth.username);

  const [isCreatedByUser, setIsCreatedByUser] = useState<boolean>(username === created_by);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const theme = useRef<Theme>(createTheme(rjsfTheme as ThemeOptions));

  const debouncedFormChange = useCallback(
    debounce(
      (event) => {
        dispatch(Activity.onFormChangeRequest(event.formData));
      },
      FORM_UPDATE_THROTTLE_DELAY,
      { maxWait: FORM_UPDATE_MAX_DELAY, leading: false, trailing: true }
    ),
    []
  );

  const customValidators = useCallback(() => {
    return validatorForActivity(activity_subtype, null);
  }, [JSON.stringify(activity_subtype)]);

  const formRef: RefObject<CoreForm> = createRef();

  useEffect(() => {
    setIsCreatedByUser(username === created_by);
    setIsDisabled(username !== created_by || !can_edit);
  }, [username, created_by, can_edit]);

  const isActivityChemTreatment =
    activity_subtype === ActivitySubtype.Treatment_ChemicalPlant ||
    activity_subtype === ActivitySubtype.Treatment_ChemicalPlantAquatic;

  if (!activitySchema || !activityUISchema) {
    return <CircularProgress />;
  }
  return (
    <Box sx={{ px: '15%' }}>
      <ThemeProvider theme={theme.current}>
        <SelectAutoCompleteContextProvider>
          {!isCreatedByUser && can_edit && (
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
              ArrayFieldItemTemplate: ArrayItemTemplate,
              ArrayFieldItemButtonsTemplate: ArrayItemButtonTemplate,
              ErrorListTemplate: ErrorListTemplate
            }}
            widgets={{
              'funding-agency-select-autocomplete': FundingAgencySelectAutoComplete,
              'employer-select-autocomplete': EmployerSelectAutoComplete,
              'multi-select-autocomplete': MultiSelectAutoComplete,
              'single-select-autocomplete': SingleSelectAutoComplete,
              'agent-select-autocomplete': AgentSelectAutoComplete,
              'linked-id-select-autocomplete': LinkedIdSelectAutoComplete
            }}
            readonly={isDisabled}
            key={activity_ID + pasteCount + reported_area}
            disabled={isDisabled}
            id="rjsf-form"
            formData={formDataState}
            schema={activitySchema}
            uiSchema={activityUISchema}
            liveValidate={'onChange'}
            customValidate={customValidators()}
            validator={validator}
            showErrorList={'top'}
            transformErrors={getCustomErrorTransformer()}
            autoComplete="off"
            ref={formRef}
            noHtml5Validate={true}
            onSubmit={() => dispatch(Activity.submit())}
            onError={(errors) => dispatch(Activity.setErrors(errors ?? []))}
            onChange={(event) => debouncedFormChange(event)}
          >
            <CustomPopover
              buttonClasses={'overlay-menu'}
              buttonText={isCellPhoneWidth ? 'Save' : 'Save Menu'}
              closeAfterPress={true}
              disablePortal={true}
            >
              <FormMenuButtons />
            </CustomPopover>
            {/* This seemingly useless Fragment prevents a generic submit button from rendering through RJSF */}
            <Fragment />
          </Form>

          {isActivityChemTreatment && (
            <ChemicalTreatmentDetailsForm
              activitySubType={activity_subtype}
              disabled={isDisabled}
              onChange={(form_data, callback) => {
                if (formRef.current?.onChange) {
                  formRef.current.onChange(form_data);
                }
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
