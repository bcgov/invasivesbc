import { useFormContext } from 'react-hook-form';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import {
  AquaticChemicalTreatmentSchema,
  TerrestrialChemicalTreatmentSchema
} from 'UI/Features/Records/Activity/forms/plant/interfaces';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { CardinalDirection, YesNoUnknown } from 'UI/Features/Records/Activity/forms/enums';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';
import RadioInput from 'UI/Features/Records/Activity/forms/common/RadioInput/RadioInput';
import FormSpacer from 'UI/Features/Records/Activity/forms/common/FormSpacer/FormSpacer';
import CheckboxInput from 'UI/Features/Records/Activity/forms/common/CheckboxInput/CheckboxInput';
import { maxValue, minValue, noFutureDate } from 'UI/Features/Records/Activity/forms/common/validators';
import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import { Fragment, useEffect, useState } from 'react';
import TreatmentChemicalPlantDetails from './TreatmentChemicalPlantDetails';

type ChemTreatment = AquaticChemicalTreatmentSchema | TerrestrialChemicalTreatmentSchema;

const TreatmentChemicalPlant = () => {
  const MAX_ALLOWED_TEMP = 28;
  const MIN_ALLOWED_TEMP = 10;
  const MAX_WIND_SPEED = 9;

  /**
   * @desc Cast localStorage value to boolean from string.
   * @param key localStorage Key
   */
  const coerceLocalBool = (key: string): boolean => {
    const bool = localStorage.getItem(key);
    if (bool === 'true') return true;
    return false;
  };
  /**
   * @desc Validate only PMP or Manual PMP are filled in, not both.
   */
  const validatePMPSelection = (_, formValues: ChemTreatment): true | string => {
    const pmp = formValues.subtype_data?.pest_management_plan;
    const manual = formValues.subtype_data?.pest_management_plan_manual;
    if ((pmp && !manual) || (!pmp && manual)) return true;
    if (!pmp && !manual) return 'You must only fill either Pest Management Plan or Unlisted Drop Down field.';
    return 'Either "Pest Management Plan" or "PMP # not in dropdown" has to be filled.';
  };

  const {
    register,
    watch,
    trigger,
    setValue,
    formState: { isDirty, errors, disabled }
  } = useFormContext<ChemTreatment>();
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  const wellsInArea = useSelector((state) => state.ActivityPage?.wellsInRecordArea);

  const well_entries = watch('subtype_data.well_entries');
  const ntz_bool = watch('subtype_data.ntz_reduction_bool');
  const temp_c = watch('subtype_data.temperature_c');
  const wind_speed = watch('subtype_data.wind_speed_kmh');

  /*
    Entry Policy: Out-of-range values (temperature, wind speed) are permitted only if the user has manually flagged them as accurate.
    This prevents data entry errors without blocking edge-case submissions.
  */
  const [isTemperatureAccurate, setIsTemperatureAccurate] = useState<boolean>(coerceLocalBool('isTemperatureAccurate'));
  const [isWindSpeedAccurate, setIsWindSpeedAccurate] = useState<boolean>(coerceLocalBool('isWindSpeedAccurate'));

  const shouldVerifyWindSpeedAccuracy = !disabled && wind_speed != undefined && wind_speed > MAX_WIND_SPEED;
  const shouldVerifyTemperatureAccuracy =
    !disabled && temp_c != undefined && (temp_c > MAX_ALLOWED_TEMP || temp_c < MIN_ALLOWED_TEMP);

  useEffect(() => {
    // Uncheck confirmation if temperature is changed
    if (!isDirty) return;
    setIsTemperatureAccurate(false);
    localStorage.setItem('isTemperatureAccurate', 'false');
  }, [temp_c]);

  useEffect(() => {
    // Uncheck confirmation if Wind speed is changed
    if (!isDirty) return;
    setIsWindSpeedAccurate(false);
    localStorage.setItem('isWindSpeedAccurate', 'false');
  }, [wind_speed]);

  useEffect(() => {
    // Refire Temperature validation when confirmation changes
    if (!isDirty) return;
    trigger('subtype_data.temperature_c');
  }, [isTemperatureAccurate]);

  useEffect(() => {
    // Refire Temperature validation when confirmation changes
    if (!isDirty) return;
    trigger('subtype_data.wind_speed_kmh');
  }, [isWindSpeedAccurate]);

  // Cleanup NTZ Reduction Rationale if Reduction is changed to False
  useEffect(() => {
    if (isDirty && !ntz_bool) {
      setValue('subtype_data.rationale_for_ntz_reduction', '');
    }
  }, [ntz_bool]);

  // Update Nearest Wells when values change
  useEffect(() => {
    if (wellsInArea) {
      setValue('subtype_data.well_entries', wellsInArea);
    }
  }, [wellsInArea]);

  return (
    <>
      <Fieldset label={'Well Information'} tooltip={tooltips.plant.chemical.wells.section_disclaimer}>
        {well_entries?.length === 0 && (
          <p>
            No Wells found in area <TooltipWithIcon tooltipText={tooltips.plant.chemical.wells.field_disclaimer} />
          </p>
        )}
        {well_entries?.map((we) => (
          <Fragment key={we.well_tag}>
            <TextInput
              label={'Well ID'}
              readOnly
              tooltip={tooltips.plant.chemical.wells.field_disclaimer}
              width={Width.Half}
              value={we.well_tag}
            />
            <NumberInput
              label={'Well Proximity (m)'}
              readOnly
              tooltip={tooltips.plant.chemical.wells.field_disclaimer}
              value={we.distance}
              width={Width.Half}
            />
          </Fragment>
        ))}
      </Fieldset>

      {/* Weather Information */}
      <Fieldset label={'Weather Information'}>
        <NumberInput
          error={errors?.subtype_data?.temperature_c}
          label={'Temperature (C°)'}
          required
          tooltip={tooltips.plant.chemical.weather.temperature_c}
          width={Width.Half}
          {...register('subtype_data.temperature_c', {
            required: true,
            valueAsNumber: true,
            validate: {
              minValueBeforeVerify: (val) => isTemperatureAccurate || minValue(val, MIN_ALLOWED_TEMP),
              maxValueBeforeVerify: (val) =>
                isTemperatureAccurate
                  ? maxValue(val, 99) // If user verifies weather accuracy, check for clearly accidental values (extra digits)
                  : maxValue(val, MAX_ALLOWED_TEMP)
            }
          })}
        />
        <NumberInput
          error={errors?.subtype_data?.wind_speed_kmh}
          label={'Wind Speed (km/h)'}
          required
          tooltip={tooltips.plant.chemical.weather.wind_speed_kmh}
          width={Width.Half}
          {...register('subtype_data.wind_speed_kmh', {
            required: true,
            valueAsNumber: true,
            // If user verifies weather accurate, check for clearly accidental values (extra digits)
            validate: {
              minSpeed: (val) => minValue(val, 0),
              maxSpeed: (val) => (isWindSpeedAccurate ? maxValue(val, 99) : maxValue(val, MAX_WIND_SPEED))
            }
          })}
        />
        <SingleSelect
          label={'Wind Direction'}
          name={'subtype_data.wind_direction'}
          options={CardinalDirection}
          required
          tooltip={tooltips.plant.chemical.weather.wind_direction}
          width={Width.Half}
          rules={{
            required: true,
            deps: ['subtype_data.wind_speed_kmh'],
            validate: (direction, formValues) => {
              const windSpeed = formValues.subtype_data?.wind_speed_kmh;
              if (direction === 'NA' && windSpeed > 0) {
                return 'Must specify a wind direction when wind speed > 0';
              }
              return true;
            }
          }}
        />
        <NumberInput
          error={errors?.subtype_data?.humidity}
          label={'Humidity (%)'}
          tooltip={tooltips.plant.chemical.weather.humidity}
          width={Width.Half}
          {...register('subtype_data.humidity', { valueAsNumber: true })}
        />
        {shouldVerifyTemperatureAccuracy && (
          <CheckboxUI
            label={
              'The temperature recorded at the time of treatment is an accurate representation of site conditions.'
            }
            required
            state={isTemperatureAccurate}
            warningConfirmation
            onChange={() => {
              localStorage.setItem('isTemperatureAccurate', 'true');
              setIsTemperatureAccurate((prev) => !prev);
            }}
          />
        )}
        {shouldVerifyWindSpeedAccuracy && (
          <CheckboxUI
            label={'The wind speed recorded at the time of treatment is an accurate representation of site conditions.'}
            required
            state={isWindSpeedAccurate}
            warningConfirmation
            onChange={() => {
              localStorage.setItem('isWindSpeedAccurate', 'true');
              setIsWindSpeedAccurate((prev) => !prev);
            }}
          />
        )}
      </Fieldset>

      {/* Chemical Treatment Information */}
      <Fieldset label={'Chemical Treatment Information'}>
        <SingleSelect
          label={'Service License Number and Company Name'}
          name={'subtype_data.service_license_number'}
          options={codes?.ServiceLicenseNumberAndCompany}
          required
          rules={{ required: true }}
          tooltip={tooltips.plant.chemical.service_license_number_and_company}
          width={Width.Half}
        />
        <TextInput
          error={errors?.subtype_data?.pesticide_use_permit}
          label={'Pesticide Use Permit'}
          tooltip={tooltips.plant.chemical.pesticide_use_permit}
          width={Width.Half}
          {...register('subtype_data.pesticide_use_permit')}
        />
        <SingleSelect
          label={'Pest Management Plan (PMP)'}
          name={'subtype_data.pest_management_plan'}
          options={codes?.PestManagementPlan}
          tooltip={tooltips.plant.chemical.pest_management_plan}
          width={Width.Half}
          rules={{
            deps: ['subtype_data.pest_management_plan_manual'],
            validate: validatePMPSelection
          }}
        />
        <TextInput
          error={errors?.subtype_data?.pest_management_plan_manual}
          label={'PMP # Not in Dropdown'}
          tooltip={tooltips.plant.chemical.pest_management_plan_manual}
          width={Width.Half}
          {...register('subtype_data.pest_management_plan_manual', {
            deps: ['subtype_data.pest_management_plan'],
            validate: validatePMPSelection
          })}
        />
        <SingleSelect
          label={'Treatment Notice Signs'}
          name={'subtype_data.treatment_notice_signs'}
          options={YesNoUnknown}
          required
          rules={{ required: true }}
          tooltip={tooltips.plant.chemical.treatment_notice_signs}
          width={Width.Half}
        />
        <SingleSelect
          label={'Precautionary Statement'}
          name={'subtype_data.precautionary_statement'}
          options={codes?.ChemicalPrecautionaryStatement}
          required
          rules={{ required: true }}
          tooltip={tooltips.plant.chemical.required_under_license}
          width={Width.Half}
        />
        <DateInput
          error={errors?.subtype_data?.application_start_time}
          includeTime
          label={'Application Start Time'}
          required
          width={Width.Half}
          {...register('subtype_data.application_start_time', { required: true, validate: noFutureDate })}
        />
        <CheckboxInput
          label={'Additional/Unmapped Wells or Water License intakes within 30m'}
          tooltip={tooltips.plant.chemical.additional_unmapped_water}
          width={Width.Half}
          {...register('subtype_data.additional_unmapped_well_water_bool')}
        />
        <RadioInput
          label={'NTZ Reduction'}
          name={'subtype_data.ntz_reduction_bool'}
          required
          rules={{ validate: (value) => value !== undefined || 'NTZ reduction is required' }}
          tooltip={tooltips.plant.chemical.required_under_license}
          width={Width.Half}
          options={[
            { code: 'true', full_name: 'Yes', table: 'NTZ' },
            { code: 'false', full_name: 'No', table: 'NTZ' }
          ]}
        />
        {ntz_bool ? (
          <TextInput
            advisoryText="Only the PMP or permit holder may approve an NTZ reduction on public lands."
            error={errors?.subtype_data?.rationale_for_ntz_reduction}
            label={'Rationale for NTZ Reduction'}
            tooltip={tooltips.plant.chemical.required_under_license}
            required
            width={Width.Half}
            {...register('subtype_data.rationale_for_ntz_reduction', { required: true })}
          />
        ) : (
          <FormSpacer width={Width.Half} />
        )}
      </Fieldset>

      {/* Pest Injury Threshold Determination */}
      <Fieldset label={'Pest Injury Threshold Determination'}>
        <RadioInput
          label={'Choose either option'}
          name={'subtype_data.pest_injury_threshold_determination_bool'}
          required
          rules={{ validate: (value) => value !== undefined || 'NTZ reduction is required' }}
          tooltip={tooltips.plant.chemical.required_under_license}
          options={[
            {
              code: 'true',
              full_name:
                'A full survey was completed prior to herbicide application. The survey determined that injury thresholds had been met to fulfill IPM obligations.',
              table: 'NTZ'
            },
            { code: 'false', full_name: 'No threshold determination was completed.', table: 'NTZ' }
          ]}
        />
      </Fieldset>

      <TreatmentChemicalPlantDetails />
    </>
  );
};

export default TreatmentChemicalPlant;
