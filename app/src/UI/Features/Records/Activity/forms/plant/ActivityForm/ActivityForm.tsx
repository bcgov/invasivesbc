import { useForm, SubmitHandler, useWatch, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'utils/use_selector';
import { MouseEvent, TouchEvent, useCallback, useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import FormActions from 'state/actions/activity/FormActions';
import Prompt from 'state/actions/prompts/Prompt';
import RecordMetadata from 'UI/Features/Records/Activity/forms/common/RecordMetadata/RecordMetadata';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import DebugFormData from 'UI/Features/Records/Activity/forms/debug/DebugFormData';
import DebugButton from 'UI/Features/Records/Activity/forms/debug/DebugButton';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import { Error } from '@mui/icons-material';
import { NavLink, useParams } from 'react-router';
import ActivityActions from 'state/actions/activity/Activity';
import Form from './Form';
import './activityForm.css';
import Photos from './Photos';

const FORM_UPDATE_THROTTLE_DELAY = 1000; //ms
const FORM_UPDATE_MAX_DELAY = 5000; //ms

const ActivityForm = () => {
  enum Mode {
    Photo = 'photos',
    Form = 'form'
  }
  // TODO: Replace with Permission Logic
  const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { id, mode } = useParams<{ id: string; mode: Mode }>();

  const handleOpenMenu = (evt: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>) => {
    setAnchorEl(evt.currentTarget);
  };

  const handleDuplicateForm = () => {
    dispatch(FormActions.startDuplicateForm());
  };
  const saveToDraft = () => {
    if (!initState || !isDirty) return;
    dispatch(FormActions.sendForm({ data: initState, type: 'draft' }));
  };

  const handleClear = () => {
    dispatch(
      Prompt.confirmation({
        prompt: 'Do you want to clear your form? You will lose all progress.',
        title: 'Clear Form',
        confirmText: 'Clear form',
        callback: (confirmation: boolean) => {
          if (confirmation) {
            dispatch(FormActions.clearFormState());
            reset(getDefaultFormState(subtype));
          }
        }
      })
    );
  };
  /**
   * Update Geometry related fields when Redux state of Geom changes
   */
  const updateGeometryState = () => {
    const GEOM_FIELDS: Array<keyof FormSchema> = [
      'area_m',
      'geom',
      'latitude',
      'longitude',
      'utm_zone',
      'utm_easting',
      'utm_northing'
    ] as const;

    GEOM_FIELDS.forEach((f) => {
      if (geometry_details?.[f] == undefined) {
        resetField(f, { defaultValue: '' });
      } else {
        setValue(f, geometry_details[f], {
          shouldDirty: true,
          shouldValidate: true
        });
      }
    });
  };

  // Redux state Handler
  const debouncedFormChange = useCallback(
    debounce(() => dispatch(FormActions.updateState(getValues())), FORM_UPDATE_THROTTLE_DELAY, {
      maxWait: FORM_UPDATE_MAX_DELAY,
      leading: false,
      trailing: true
    }),
    []
  );

  const dispatch = useDispatch();

  const geometry_details = useSelector((state) => state.ActivityPage?.geometry_details);
  const initState = useSelector((state) => state.ActivityPage?.formState);
  const subtype = useSelector((state) => state.ActivityPage?.formType);
  const formId = useSelector((state) => state.ActivityPage?.formId);

  // Assign Props to sole variable to pass into FormProvider
  const methods = useForm<FormSchema>({
    mode: 'all',
    disabled: isFormDisabled,
    defaultValues: getDefaultFormState(subtype)
  });

  // Destructure props used at this level
  const {
    register,
    handleSubmit,
    getValues,
    control,
    reset,
    resetField,
    setValue,
    formState: { errors, isDirty, disabled }
  } = methods;

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    if (!isDirty) return;
    dispatch(FormActions.sendForm({ data, type: 'submission' }));
  };

  const allFormValues = useWatch({ control });

  useEffect(() => {
    if (id && formId !== id) {
      dispatch(ActivityActions.loadActivityIfRequired(id));
    }
  }, [id, formId]);
  /**
   * After Form is loaded,
   *  - Register jurisdiction Validation (applies to Array),
   *  - Register geom key (Shape on map, not assigned to component)
   */
  useEffect(() => {
    register('geom');
  }, [register]);

  /** Trigger Geometry Updates when Redux state changes */
  useEffect(() => {
    updateGeometryState();
  }, [geometry_details]);

  useEffect(() => {
    // Only sync with redux when user changes something
    if (isDirty) {
      debouncedFormChange();
    }
  }, [allFormValues, isDirty]);

  useEffect(() => {
    // Load in form, either from fetching a new form, or switching back to form tab
    const newFormLoadedFromExisting = initState !== undefined && !isDirty;
    if (newFormLoadedFromExisting) {
      const mutableState = structuredClone(initState);
      reset({ ...mutableState });
    }
  }, [initState, formId]);

  useEffect(() => {
    // Reset form on ID change.
    if (!initState) {
      reset(getDefaultFormState(subtype));
    }
  }, [formId]);

  if (!formId) {
    return (
      <div className="activity-page">
        <p>There is no Active Form, to get started please create or load a record</p>
      </div>
    );
  }
  return (
    <div className="activity-page">
      <nav>
        {Object.values(Mode ?? {}).map((m) => (
          <NavLink className={'form-nav'} to={`/Records/HookForm/${id}/${m}`} key={m} end={true}>
            {m}
          </NavLink>
        ))}
      </nav>
      <FormProvider {...methods}>
        <form autoComplete={'off'} id="activity-form" onSubmit={handleSubmit(onSubmit)}>
          <RecordMetadata formState={getValues()} />
          {mode &&
            {
              [Mode.Form]: <Form />,
              [Mode.Photo]: <Photos />
            }[mode]}
          {/* Submit Button is tied to react-hook-form */}
          <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
            <div id="form-popover-menu">
              {!isDirty && (
                <div className="error-warning">
                  <p>No Changes Detected</p>
                </div>
              )}
              {Object.keys(errors).length > 0 && (
                <div className="error-warning">
                  <Error color="error" />
                  <p>Error(s) in form: ({Object.keys(errors).length})</p>
                </div>
              )}
              <input
                // Errors don't need to be accounted for in disabling, since the rhf will pan to the error
                disabled={disabled || !isDirty}
                form="activity-form"
                className="control-button"
                type="submit"
                value="Submit Form"
              />
              <input
                type="button"
                className="control-button"
                disabled={disabled || !isDirty}
                onClick={saveToDraft}
                value="Save to Drafts"
              />
              <input
                type="button"
                className="control-button"
                disabled={disabled}
                onClick={handleClear}
                value="Clear Form"
              />
              <input type="button" className="control-button" onClick={handleDuplicateForm} value="Duplicate Form" />
            </div>
          </CustomPopover>

          {/* Debug Information/Options */}
          <DebugButton
            label={`${isFormDisabled ? 'Enable' : 'Disable'} Form`}
            onClick={() => setIsFormDisabled((prev) => !prev)}
          />
          <DebugFormData />
          <input type="button" className="form-popover-anchor" value="Save Menu" onClick={handleOpenMenu} />
        </form>
      </FormProvider>
    </div>
  );
};

export default ActivityForm;
