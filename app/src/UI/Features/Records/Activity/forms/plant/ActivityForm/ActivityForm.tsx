import { useForm, SubmitHandler, useWatch, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'utils/use_selector';
import { useCallback, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import FormActions from 'state/actions/activity/FormActions';
import RecordMetadata from 'UI/Features/Records/Activity/forms/common/RecordMetadata/RecordMetadata';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import DebugFormData from 'UI/Features/Records/Activity/forms/debug/DebugFormData';
import { NavLink, useParams } from 'react-router';
import ActivityActions from 'state/actions/activity/Activity';
import Form from './Form';
import './activityForm.css';
import Photos from './Photos';
import FormControl from './FormControl';
import RecordNotFound from './RecordNotFound/RecordNotFound';
import UserSettings from 'state/actions/userSettings/UserSettings';

import LinkingActivities from './LinkingActivities/LinkingActivities';

const FORM_UPDATE_THROTTLE_DELAY = 1000; //ms
const FORM_UPDATE_MAX_DELAY = 5000; //ms

const ActivityForm = () => {
  enum Mode {
    Photo = 'photos',
    Form = 'form'
  }

  const { id, mode } = useParams<{ id: string; mode: Mode }>();
  const handleCreateNewRecord = () => {
    dispatch(UserSettings.openNewRecordDialogue());
  };
  /**
   * Update Geometry related fields when Redux state of Geom changes
   */
  const updateGeometryState = () => {
    const GEOM_FIELDS: Array<keyof FormSchema> = [
      'area_m',
      'shape',
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
  const recordActions = useSelector((state) => state.ActivityPage?.recordActions);
  const currentUser = useSelector((state) => state.Auth?.username) ?? undefined;
  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);

  const userCanEdit: boolean = useMemo(() => {
    return !!recordActions?.includes('EDIT');
  }, [recordActions]);

  const methods = useForm<FormSchema>({
    mode: 'onChange',
    disabled: !userCanEdit,
    defaultValues: getDefaultFormState(subtype)
  });

  // Destructure props used at this level
  const {
    handleSubmit,
    getValues,
    control,
    reset,
    resetField,
    setValue,
    formState: { isDirty }
  } = methods;

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    MOBILE
      ? dispatch(FormActions.saveMobileForm({ data, type: 'submit' }))
      : dispatch(FormActions.sendForm({ data, type: 'submit' }));
  };

  const allFormValues = useWatch({ control });

  useEffect(() => {
    if (!id || id.length !== 36) return;
    dispatch(ActivityActions.loadActivityIfRequired(id));
  }, [id]);

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
    if (!initState && subtype) reset(getDefaultFormState(subtype, currentUser));
  }, [formId]);

  if (recordNotFound) return <RecordNotFound />;
  if (!formId) {
    return (
      <div className="activity-page">
        <p>No active form found. Please create one or select an existing record to begin.</p>
        <div className="alternate-options">
          <button onClick={handleCreateNewRecord}>Create New Record</button>
          <NavLink to="/Records">Go to Records</NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-page">
      <nav>
        {Object.values(Mode ?? {}).map((m) => (
          <NavLink className={'form-nav'} to={`/Records/Activity/${id}/${m}`} key={m} end={true}>
            {m}
          </NavLink>
        ))}
      </nav>
      <FormProvider {...methods}>
        <form autoComplete={'off'} id="activity-form" onSubmit={handleSubmit(onSubmit)}>
          <RecordMetadata formState={getValues()} />
          {/* Use conditional Rendering so RHF Doesn't unmount fields in its validation step on submit */}
          <div className={`form-section ${mode === Mode.Form ? 'active' : ''}`}>
            <Form />
          </div>
          <div className={`form-section ${mode === Mode.Photo ? 'active' : ''}`}>
            <Photos />
          </div>

          <FormControl />
          <LinkingActivities />
          <DebugFormData />
        </form>
      </FormProvider>
    </div>
  );
};

export default ActivityForm;
