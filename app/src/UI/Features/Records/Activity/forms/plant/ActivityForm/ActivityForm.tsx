import { useForm, SubmitHandler, useWatch, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'utils/use_selector';
import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import FormActions from 'state/actions/activity/FormActions';
import RecordMetadata from 'UI/Features/Records/Activity/forms/common/RecordMetadata/RecordMetadata';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import DebugFormData from 'UI/Features/Records/Activity/forms/debug/DebugFormData';
import DebugButton from 'UI/Features/Records/Activity/forms/debug/DebugButton';
import { NavLink, useParams } from 'react-router';
import ActivityActions from 'state/actions/activity/Activity';
import Form from './Form';
import './activityForm.css';
import Photos from './Photos';
import FormControl from './FormControl';
import RecordNotFound from './RecordNotFound/RecordNotFound';

const FORM_UPDATE_THROTTLE_DELAY = 1000; //ms
const FORM_UPDATE_MAX_DELAY = 5000; //ms

const ActivityForm = () => {
  enum Mode {
    Photo = 'photos',
    Form = 'form'
  }
  // TODO: Replace with Permission Logic
  const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
  const { id, mode } = useParams<{ id: string; mode: Mode }>();

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
  const recordNotFound = useSelector((state) => state.ActivityPage?.recordNotFound);
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
    formState: { isDirty }
  } = methods;

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    if (!isDirty) return;
    dispatch(FormActions.sendForm({ data, type: 'submission' }));
  };

  const allFormValues = useWatch({ control });

  useEffect(() => {
    if (!id || id.length !== 36) return;
    dispatch(ActivityActions.loadActivityIfRequired(id));
  }, [id]);
  /**
   *  Register geom key (Shape appearing on map, not values assigned to components)
   */
  useEffect(() => {
    register('geom');
  }, [register]);

  /** Trigger Geometry Updates when Redux state changes */
  useEffect(() => {
    updateGeometryState();
  }, [geometry_details]);

  useEffect(() => {
    // Only sync with redux when user changes something. Enables users to tab in/out of form section without loss.
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

  if (recordNotFound) return <RecordNotFound />;
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
          <FormControl />

          {/* Debug Information/Options */}
          <DebugButton
            label={`${isFormDisabled ? 'Enable' : 'Disable'} Form`}
            onClick={() => setIsFormDisabled((prev) => !prev)}
          />
          <DebugFormData />
        </form>
      </FormProvider>
    </div>
  );
};

export default ActivityForm;
