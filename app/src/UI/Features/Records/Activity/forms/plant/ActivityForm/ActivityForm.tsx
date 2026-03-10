import { useForm, SubmitHandler, useWatch, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'utils/use_selector';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import {
  checkSum,
  maxValue,
  minArrayLength,
  minValue,
  noFutureDate,
  noRepeatKey
} from 'UI/Features/Records/Activity/forms/common/validators';
import { MouseEvent, TouchEvent, useCallback, useEffect, useState } from 'react';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import SubtypeComposite from 'UI/Features/Records/Activity/forms/plant/subtype-component/SubtypeComposite';
import './activityForm.css';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';
import Spacer from 'UI/Reusable/Spacer/Spacer';
import debounce from 'lodash.debounce';
import FormActions from 'state/actions/activity/FormActions';
import Alerts from 'state/actions/alerts/Alerts';
import tripAlertMessages from 'constants/alerts/tripAlerts';
import Prompt from 'state/actions/prompts/Prompt';
import RecordMetadata from 'UI/Features/Records/Activity/forms/common/RecordMetadata/RecordMetadata';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import Participants from './Participants';
import { Feature } from 'geojson';
import { UtmInputObj } from 'interfaces/prompt-interfaces';
import GeoShapes from 'constants/geoShapes';
import MapActions from 'state/actions/map';
import DrawToolActions from 'state/actions/drawtool/drawToolActions';
import DebugFormData from 'UI/Features/Records/Activity/forms/debug/DebugFormData';
import DebugButton from 'UI/Features/Records/Activity/forms/debug/DebugButton';
import FundingAgency from './FundingAgency';
import Employer from './Employers';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import LinkedActivities from './LinkedActivities';
import { Error } from '@mui/icons-material';

const FORM_UPDATE_THROTTLE_DELAY = 1000; //ms
const FORM_UPDATE_MAX_DELAY = 5000; //ms

const ActivityForm = () => {
  // TODO: Replace with Permission Logic
  const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  /**
   * @desc Initiate Mouseclick on Polygon draw icon, alert user to start drawing
   */
  const handleDrawStart = () => {
    (document.getElementsByClassName('mapbox-gl-draw_polygon')?.[0] as HTMLButtonElement).click();
    dispatch(Alerts.create(tripAlertMessages.drawToolClicked));
  };

  const handleOpenMenu = (evt: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>) => {
    setAnchorEl(evt.currentTarget);
  };
  /**
   * @desc Handler for creating a manual UTM Entry initiated by user
   */
  const handleManualUTM = () => {
    const utmCallback = (input: UtmInputObj) => {
      const [lng, lat] = input.results;
      const geo: Feature = {
        type: 'Feature',
        geometry: {
          type: GeoShapes.Point,
          coordinates: [lng, lat]
        },
        properties: {}
      };
      dispatch(MapActions.centerMap({ lat, lng, zoom: 16 }));
      dispatch(DrawToolActions.updateGeo([geo]));
    };

    dispatch(
      Prompt.utm({
        title: 'Enter a manual UTM',
        prompt: 'Fill in the fields below to create your own UTM Coordinates',
        callback: utmCallback
      })
    );
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

  const codes = useSelector((state) => state.ActivityPage?.formCodes);
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
    formState,
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
      <FormProvider {...methods}>
        <form autoComplete={'off'} id="activity-form" onSubmit={handleSubmit(onSubmit)}>
          <RecordMetadata formState={getValues()} />
          {/* Start of Geometry Fields */}
          <Fieldset label={'Geometry Information'}>
            <NumberInput
              label={'Area (m²)'}
              readOnly
              error={errors?.area_m}
              required
              tooltip={tooltips.basic.area_m}
              {...register(`area_m`, {
                required: true,
                min: { value: 1, message: 'Area must be greater than 1m' },
                max: { value: 500000, message: 'Area cannot exceed 500,000m' }
              })}
              width={Width.Third}
            />
            <NumberInput
              label={'Latitude'}
              readOnly
              required
              error={errors?.latitude}
              tooltip={tooltips.basic.latitude}
              {...register(`latitude`, { required: true, validate: (val) => !!val })}
              width={Width.Third}
            />
            <NumberInput
              label={'Longitude'}
              readOnly
              required
              tooltip={tooltips.basic.longitude}
              error={errors?.longitude}
              {...register(`longitude`, { required: true, validate: (val) => !!val })}
              width={Width.Third}
            />
            <NumberInput
              label={'UTM Zone'}
              readOnly
              required
              error={errors?.utm_zone}
              tooltip={tooltips.basic.utm_zone}
              {...register(`utm_zone`, { required: true, validate: (val) => !!val })}
              width={Width.Third}
            />
            <NumberInput
              label={'UTM Easting'}
              readOnly
              required
              tooltip={tooltips.basic.utm_easting}
              error={errors?.utm_easting}
              {...register(`utm_easting`, { required: true, validate: (val) => !!val })}
              width={Width.Third}
            />
            <NumberInput
              label={'UTM Northing'}
              readOnly
              required
              tooltip={tooltips.basic.utm_northing}
              error={errors?.utm_northing}
              {...register(`utm_northing`, { required: true, validate: (val) => !!val })}
              width={Width.Third}
            />
            <p>To modify or update, please draw a new shape on the Map</p>
            <div className="control">
              <input
                type="button"
                className="control-button"
                disabled={disabled}
                onClick={handleDrawStart}
                value="Click to Start Drawing"
              />
              <input
                type="button"
                className="control-button"
                disabled={disabled}
                onClick={handleManualUTM}
                value="Click to Enter UTM"
              />
            </div>
          </Fieldset>
          <LinkedActivities />
          {/* Start Basic Information Fields */}
          <Fieldset label={'Basic Information'}>
            <DateInput
              label={'Date'}
              tooltip={tooltips.basic.date}
              required
              error={errors?.date}
              {...register('date', { required: true, validate: (val) => noFutureDate(val) })}
              width={Width.Half}
            />
            <Employer width={Width.Half} />
            <FundingAgency width={Width.Half} />
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
                    tooltip={tooltips.basic.jurisdiction}
                    name={`jurisdictions.${index}.jurisdiction`}
                    rules={{ required: true }}
                    required
                  />
                  <NumberInput
                    label="Percent Covered"
                    type="number"
                    required
                    tooltip={tooltips.basic.jurisdiction_percent_covered}
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
              tooltip={tooltips.basic.projects}
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
              required
              tooltip={tooltips.basic.location_description}
              width={Width.Third}
              {...register('location_description', { required: true, validate: (val) => minValue(val, 10) })}
            />
            <TextArea
              width={Width.Third}
              label={'Access Description'}
              error={errors?.access_description}
              tooltip={tooltips.basic.access_description}
              {...register('access_description')}
            />
            <TextArea
              label={'Comment'}
              error={errors?.comment}
              tooltip={tooltips.basic.general_comments}
              width={Width.Third}
              {...register('comment')}
            />
          </Fieldset>
          <Participants />
          <SubtypeComposite />

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
