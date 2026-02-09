import { useForm, SubmitHandler, useWatch, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'utils/use_selector';
import TextInput from '../common/TextInput/TextInput';
import SingleSelect from '../common/SingleSelect/SingleSelect';
import Fieldset from '../common/Fieldset/Fieldset';
import DateInput from '../common/DateInput/DateInput';
import NumberInput from '../common/NumberInput/NumberInput';
import TextArea from '../common/TextArea/TextArea';
import { checkSum, minArrayLength, noFutureDate } from '../common/validators';
import { useCallback, useEffect } from 'react';
import ArrayField from '../common/ArrayField/ArrayField';
import SubtypeComposite from './SubtypeComposite';
import { FormSchema } from './subtypeInterfaces';
import './activityForm.css';
import { Width } from '../common/utils';
import DeleteControl from '../common/DeleteControl/DeleteControl';
import MultiSelect from '../common/MultiSelect/MultiSelect';
import Spacer from 'UI/Reusable/Spacer/Spacer';
import debounce from 'lodash.debounce';
import FormActions from 'state/actions/activity/FormActions';

const FORM_UPDATE_THROTTLE_DELAY = 500; //ms
const FORM_UPDATE_MAX_DELAY = 3000; //ms

const ActivityForm = () => {
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
        resetField(f);
      } else {
        setValue(f, geometry_details[f]);
      }
      trigger(f); // Activate Forms Validation
    });
  };

  const dispatch = useDispatch();

  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const geometry_details = useSelector((state) => state.ActivityPage?.geometry_details);
  const initState = useSelector((state) => state.ActivityPage?.formState);

  // Assign Props to sole variable to pass into FormProvider
  const methods = useForm<FormSchema>({
    defaultValues: initState ?? {
      jurisdictions: [{ jurisdiction: '', percent_covered: 0 }],
      project_code: [{ description: '' }],
      funding_agencies: [{ invasive_species_agency_code: '' }]
    },
    mode: 'onChange'
  });

  // Redux state Handler
  const debouncedFormChange = useCallback(
    debounce(() => dispatch(FormActions.updateFormState(getValues())), FORM_UPDATE_THROTTLE_DELAY, {
      maxWait: FORM_UPDATE_MAX_DELAY,
      leading: false,
      trailing: true
    }),
    []
  );

  // Destructure props used at this level
  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState,
    resetField,
    setValue,
    trigger,
    unregister,
    watch,
    formState: { errors, isDirty }
  } = methods;

  const onSubmit: SubmitHandler<FormSchema> = (data) => console.log(data);
  const formData = watch();
  const allFormValues = useWatch({ control });

  /**
   * After Form is loaded,
   *  - Register jurisdiction Validation (applies to Array),
   *  - Register geom key (Shape on map, not assigned to component)
   */
  useEffect(() => {
    register('jurisdictions', { validate: (val) => checkSum(val, 100, 'percent_covered') });
    register('geom');
  }, [register]);

  // After first change to form is applied, trigger validation for whole form.
  useEffect(() => {
    if (!isDirty) return;
    trigger();
  }, [isDirty]);

  /** Trigger Geometry Updates when Redux state changes */
  useEffect(() => {
    updateGeometryState();
  }, [geometry_details]);

  useEffect(() => {
    // Debounce all internal state updates to persist in Redux
    debouncedFormChange();
  }, [allFormValues]);

  return (
    <div className="activity-page">
      <FormProvider {...methods}>
        <form autoComplete={'off'} className="activity-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Start of Geometry Fields */}
          <Fieldset label={'Geometry Information'}>
            <p>To modify or update, please draw a new shape on the Map</p>
            <button onClick={() => alert('Not implemented')}>Draw Shape</button>
            <NumberInput
              label={'Area (m)'}
              readOnly
              error={errors?.area_m}
              {...register(`area_m`, {
                required: true,
                max: { value: 500000, message: 'Area cannot exceed 500,000m' }
              })}
              width={Width.Third}
            />
            <NumberInput
              label={'Latitude'}
              readOnly
              error={errors?.latitude}
              {...register(`latitude`, { required: true })}
              width={Width.Third}
            />
            <NumberInput
              label={'Longitude'}
              readOnly
              error={errors?.longitude}
              {...register(`longitude`, { required: true })}
              width={Width.Third}
            />
            <NumberInput
              label={'UTM Zone'}
              readOnly
              error={errors?.utm_zone}
              {...register(`utm_zone`, { required: true })}
              width={Width.Third}
            />
            <NumberInput
              label={'UTM Easting'}
              readOnly
              error={errors?.utm_easting}
              {...register(`utm_easting`, { required: true })}
              width={Width.Third}
            />
            <NumberInput
              label={'UTM Northing'}
              readOnly
              error={errors?.utm_northing}
              {...register(`utm_northing`, { required: true })}
              width={Width.Third}
            />
          </Fieldset>

          {/* Start Basic Information Fields */}
          <Fieldset label={'Basic Information'}>
            <DateInput
              label={'Date'}
              tooltip="The date the activity occurred on"
              error={errors?.date}
              {...register('date', { required: true, validate: (val) => noFutureDate(val) })}
              width={Width.Half}
            />
            <SingleSelect
              label={'Employer'}
              options={codes.EmployerCode}
              name={'employer'}
              rules={{ required: true }}
              width={Width.Half}
            />
            <MultiSelect
              label="Funding Agencies"
              name={'funding_agencies'}
              options={codes.FundingAgencyCode}
              width={Width.Half}
              rules={{ validate: (v) => minArrayLength(v, 1) }}
            />
            <Spacer x={150} y={10} />
            {/* Start of Jurisdictions section */}
            <ArrayField<FormSchema>
              name="jurisdictions"
              label="Jurisdictions"
              width={Width.Half}
              emptyValue={{ jurisdiction: '', percent_covered: 0 }}
              renderRow={(index, remove) => (
                <>
                  <SingleSelect
                    label="Jurisdiction"
                    options={codes.JurisdictionCode}
                    name={`jurisdictions.${index}.jurisdiction`}
                    rules={{ required: true }}
                  />
                  <NumberInput
                    label="Percent Covered"
                    type="number"
                    error={errors.jurisdictions?.[index]?.percent_covered}
                    {...register(`jurisdictions.${index}.percent_covered`, {
                      valueAsNumber: true,
                      onChange: trigger.bind(this, 'jurisdictions')
                    })}
                  />
                  <button
                    type="button"
                    className="delete"
                    onClick={() => {
                      remove(index);
                      setTimeout(() => {
                        // Hacky, remove this
                        unregister('jurisdictions');
                        register('jurisdictions', {
                          validate: (val) => checkSum(val, 100, 'percent_covered')
                        });
                        trigger('jurisdictions');
                      }, 10);
                    }}
                  >
                    Remove
                  </button>
                </>
              )}
            />
            {/* Start of Project Codes  */}
            <ArrayField<FormSchema>
              name="project_code"
              label="Project Codes"
              emptyValue={{ description: '' }}
              width={Width.Half}
              renderRow={(index, remove) => (
                <>
                  <TextInput
                    small
                    id={`project_code.${index}.description`}
                    {...register(`project_code.${index}.description`)}
                    error={formState.errors.project_code?.[index]?.description}
                  />
                  <DeleteControl onClick={() => remove(index)} />
                </>
              )}
            />

            {/* Start General Comment Boxes  */}
            <TextArea
              label={'Location Description'}
              id="location_description"
              width={Width.Third}
              {...register('location_description')}
            />
            <TextArea
              width={Width.Third}
              label={'Access Description'}
              {...register('access_description', { required: true, minLength: 10 })}
            />
            <TextArea label={'Comment'} width={Width.Third} {...register('comment')} />
          </Fieldset>
          <SubtypeComposite />
          {/* Submit Button is tied to react-hook-form */}
          <input type="submit" />
          <pre style={{ display: 'flex', textWrap: 'wrap' }}>{JSON.stringify(formData, null, 2)}</pre>
        </form>
      </FormProvider>
    </div>
  );
};

export default ActivityForm;
