import { useForm, SubmitHandler, useWatch, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'utils/use_selector';
import TextInput from '../common/TextInput/TextInput';
import SingleSelect from '../common/SingleSelect/SingleSelect';
import Fieldset from '../common/Fieldset/Fieldset';
import DateInput from '../common/DateInput/DateInput';
import NumberInput from '../common/NumberInput/NumberInput';
import TextArea from '../common/TextArea/TextArea';
import { checkSum, maxValue, minArrayLength, minValue, noFutureDate, noRepeatKey } from '../common/validators';
import { MouseEvent, useCallback, useEffect } from 'react';
import ArrayField from '../common/ArrayField/ArrayField';
import SubtypeComposite from './SubtypeComposite';
import { FormSchema } from './interfaces/subtypeInterfaces';
import './activityForm.css';
import { Width } from '../common/utils';
import DeleteControl from '../common/DeleteControl/DeleteControl';
import MultiSelect from '../common/MultiSelect/MultiSelect';
import Spacer from 'UI/Reusable/Spacer/Spacer';
import debounce from 'lodash.debounce';
import FormActions from 'state/actions/activity/FormActions';
import Alerts from 'state/actions/alerts/Alerts';
import tripAlertMessages from 'constants/alerts/tripAlerts';
import CreatableSelect from '../common/CreatableSelect.tsx/CreatableSelect';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import Prompt from 'state/actions/prompts/Prompt';
import { Debug } from 'UI/Reusable/Predicates/Debug';
import RecordMetadata from '../common/RecordMetadata/RecordMetadata';

const FORM_UPDATE_THROTTLE_DELAY = 1000; //ms
const FORM_UPDATE_MAX_DELAY = 5000; //ms

const ActivityForm = () => {
  /**
   * @desc Initiate Mouseclick on Polygon draw icon, alert user to start drawing
   */
  const handleDrawStart = (evt: MouseEvent<HTMLButtonElement>) => {
    evt?.preventDefault();
    (document.getElementsByClassName('mapbox-gl-draw_polygon')?.[0] as HTMLButtonElement).click();
    dispatch(Alerts.create(tripAlertMessages.drawToolClicked));
  };

  const saveToDraft = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    alert('Not implemented');
  };

  const handleClear = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    dispatch(
      Prompt.confirmation({
        prompt: 'Do you want to clear your form? You will lose all progress.',
        title: 'Clear Form',
        confirmText: 'Clear form',
        callback: (confirmation: boolean) => {
          if (confirmation) {
            dispatch(FormActions.clearFormState());
            reset();
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

  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const geometry_details = useSelector((state) => state.ActivityPage?.geometry_details);
  const formType = useSelector((state) => state.ActivityPage.formType);
  const initState = useSelector((state) => state.ActivityPage?.formState);

  // Assign Props to sole variable to pass into FormProvider
  const methods = useForm<FormSchema>({
    mode: 'all'
  });

  // Destructure props used at this level
  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState,
    reset,
    resetField,
    setValue,
    trigger,
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
    // Triggers on initial load, sets data from redux state
    if (initState !== undefined && !isDirty) {
      const mutableState = structuredClone(initState);
      reset({ ...mutableState });
    }
  }, []);

  return (
    <div className="activity-page">
      <FormProvider {...methods}>
        <form autoComplete={'off'} className="activity-form" onSubmit={handleSubmit(onSubmit)}>
          <RecordMetadata />
          {/* Start of Geometry Fields */}
          <Fieldset label={'Geometry Information'}>
            <p>To modify or update, please draw a new shape on the Map</p>
            <button onClick={handleDrawStart}>Draw Shape</button>
            <NumberInput
              label={'Area (m)'}
              readOnly
              error={errors?.area_m}
              required
              tooltip="Area of the activity automatically created from the geometry in square metres"
              {...register(`area_m`, {
                required: true,
                max: { value: 500000, message: 'Area cannot exceed 500,000m' }
              })}
              width={Width.Third}
            />
            <NumberInput
              label={'Latitude'}
              readOnly
              required
              error={errors?.latitude}
              tooltip="Latitude of the anchor point for the specified geometry"
              {...register(`latitude`, { required: true })}
              width={Width.Third}
            />
            <NumberInput
              label={'Longitude'}
              readOnly
              required
              tooltip="Longitude of the anchor point for the specified geometry"
              error={errors?.longitude}
              {...register(`longitude`, { required: true })}
              width={Width.Third}
            />
            <NumberInput
              label={'UTM Zone'}
              readOnly
              required
              error={errors?.utm_zone}
              tooltip="UTM Zone of the anchor point for the specified geometry"
              {...register(`utm_zone`, { required: true })}
              width={Width.Third}
            />
            <NumberInput
              label={'UTM Easting'}
              readOnly
              required
              tooltip="UTM Easting of the anchor point for the specified geometry"
              error={errors?.utm_easting}
              {...register(`utm_easting`, { required: true })}
              width={Width.Third}
            />
            <NumberInput
              label={'UTM Northing'}
              readOnly
              required
              tooltip="UTM Northing of the anchor point for the specified geometry"
              error={errors?.utm_northing}
              {...register(`utm_northing`, { required: true })}
              width={Width.Third}
            />
          </Fieldset>

          <Fieldset label={'Related Records'}>
            <CreatableSelect<FormSchema, { short_id: string; full: string }>
              name="linked_activities"
              label="Linked Record ID"
              options={[]}
              labelKey="short_id"
              valueKey="full"
            />
          </Fieldset>
          {/* Start Basic Information Fields */}
          <Fieldset label={'Basic Information'}>
            <DateInput
              label={'Date'}
              tooltip="The date the activity occurred on"
              required
              error={errors?.date}
              {...register('date', { required: true, valueAsDate: true, validate: (val) => noFutureDate(val) })}
              width={Width.Half}
            />
            <MultiSelect
              label={'Employer'}
              valueKey="employer"
              options={codes.EmployerCode}
              name={'employer'}
              tooltip="The company or agency that the person(s) completing the activity is directly employed by"
              rules={{ required: true }}
              width={Width.Half}
            />
            <MultiSelect
              label="Funding Agencies"
              name={'funding_agencies'}
              valueKey={'invasive_species_agency_code'}
              tooltip="Choose the organization that is paying for the work to be done. If multiple funders exist or in cases when an agency has been hired to manage the work on behalf of the primary funding agency, multiple Funding Agencies may be chosen."
              options={codes.FundingAgencyCode}
              required
              width={Width.Half}
              rules={{ validate: (v) => minArrayLength(v, 1), required: true }}
            />
            <Spacer x={150} y={10} />
            {/* Start of Jurisdictions section */}
            <ArrayField<FormSchema, 'jurisdictions'>
              name="jurisdictions"
              label="Jurisdictions"
              rules={{
                validate: {
                  minimumItems: (val) => minArrayLength(val, 1),
                  totalPercent: (val) => checkSum(val, 100, 'percent_covered'),
                  noRepeatJurisdiction: (val) => noRepeatKey(val, 'jurisdiction')
                }
              }}
              width={Width.Half}
              emptyValue={{ jurisdiction: '', percent_covered: 0 }}
              renderRow={(index, remove) => (
                <>
                  <SingleSelect
                    label="Jurisdiction"
                    options={codes.JurisdictionCode}
                    tooltip="Entity that owns or is responsible for the land base or water body"
                    name={`jurisdictions.${index}.jurisdiction`}
                    rules={{ required: true }}
                    required
                  />
                  <NumberInput
                    label="Percent Covered"
                    type="number"
                    required
                    tooltip="Percent covered by this jurisdiction"
                    error={errors.jurisdictions?.[index]?.percent_covered}
                    {...register(`jurisdictions.${index}.percent_covered`, {
                      required: true,
                      valueAsNumber: true,
                      validate: {
                        min: (val) => minValue(val, 1),
                        max: (val) => maxValue(val, 100)
                      }
                    })}
                  />
                  <DeleteControl onClick={() => remove(index)} />
                </>
              )}
            />
            {/* Start of Project Codes  */}
            <ArrayField<FormSchema, 'projects'>
              name="projects"
              label="Project Codes"
              tooltip='Optional field that can be added to a record to enable searching/sorting for records with that project code entered later. Multiple project codes may be added eg. project areas, contract identifiers. Replaces "paper file ID" field used in IAPP'
              emptyValue={{ description: '' }}
              width={Width.Half}
              renderRow={(index, remove) => (
                <>
                  <TextInput
                    label={'Description'}
                    id={`projects.${index}.description`}
                    {...register(`projects.${index}.description`, { required: true })}
                    error={formState.errors.projects?.[index]?.description}
                  />
                  <DeleteControl onClick={() => remove(index)} />
                </>
              )}
            />

            {/* Start General Comment Boxes  */}
            <TextArea
              label={'Location Description'}
              id="location_description"
              error={errors?.location_description}
              tooltip="Text entry to provide location directions. Locations should start general and get more specific"
              width={Width.Third}
              {...register('location_description', { required: true, validate: (val) => minValue(val, 10) })}
            />
            <TextArea
              width={Width.Third}
              label={'Access Description'}
              error={errors?.access_description}
              tooltip="Text entry to provide access directions."
              {...register('access_description')}
            />
            <TextArea
              label={'Comment'}
              error={errors?.comment}
              tooltip="Plain text description of any supporting information about the observation that is not captured elsewhere"
              width={Width.Third}
              {...register('comment')}
            />
          </Fieldset>
          <SubtypeComposite />

          {/* Submit Button is tied to react-hook-form */}
          <div className="control">
            <input type="submit" value="Submit Form" />
            <button onClick={saveToDraft}>Save to Draft</button>
            <button onClick={handleClear}>Clear Form</button>
          </div>
          <Debug>
            <Accordion title={'Form State (JSON)'}>
              <pre style={{ display: 'flex', textWrap: 'wrap' }}>{JSON.stringify(formData, null, 2)}</pre>
            </Accordion>
          </Debug>
        </form>
      </FormProvider>
    </div>
  );
};

export default ActivityForm;
