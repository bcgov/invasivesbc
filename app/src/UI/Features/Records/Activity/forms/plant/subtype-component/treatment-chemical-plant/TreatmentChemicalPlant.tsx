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
import { useEffect, useState } from 'react';

type PropTypes = {
  type: 'terrestrial' | 'aquatic';
};

type ChemTreatment = AquaticChemicalTreatmentSchema | TerrestrialChemicalTreatmentSchema;

const TreatmentChemicalPlant = ({ type }: PropTypes) => {
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

  return (
    <>
      <Fieldset label={'Well Information'} tooltip={tooltips.plant.chemical.wells.section_disclaimer}>
        {well_entries?.length === 0 && (
          <p>
            No Wells found in area <TooltipWithIcon tooltipText={tooltips.plant.chemical.wells.field_disclaimer} />
          </p>
        )}
        {well_entries?.map((we) => (
          <>
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
          </>
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
          label={'Wind Speed (km/h)'}
          error={errors?.subtype_data?.wind_speed_kmh}
          tooltip={tooltips.plant.chemical.weather.wind_speed_kmh}
          required
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
          required
          name={'subtype_data.wind_direction'}
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
          options={CardinalDirection}
          width={Width.Half}
          tooltip={tooltips.plant.chemical.weather.wind_direction}
        />
        <NumberInput
          label={'Humidity (%)'}
          error={errors?.subtype_data?.humidity}
          tooltip={tooltips.plant.chemical.weather.humidity}
          width={Width.Half}
          {...register('subtype_data.humidity', { valueAsNumber: true })}
        />
        {!disabled && temp_c > MAX_ALLOWED_TEMP && (
          <CheckboxUI
            label={
              'The temperature recorded at the time of treatment is an accurate representation of site conditions.'
            }
            warningConfirmation
            required
            state={isTemperatureAccurate}
            onChange={() => {
              localStorage.setItem('isTemperatureAccurate', 'true');
              setIsTemperatureAccurate((prev) => !prev);
            }}
          />
        )}
        {!disabled && wind_speed > MAX_WIND_SPEED && (
          <CheckboxUI
            warningConfirmation
            label={'The wind speed recorded at the time of treatment is an accurate representation of site conditions.'}
            required
            state={isWindSpeedAccurate}
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
          options={codes?.ServiceLicenseNumberAndCompany}
          name={'subtype_data.service_license_number'}
          required
          rules={{ required: true }}
          tooltip={tooltips.plant.chemical.service_license_number_and_company}
          width={Width.Half}
        />
        <TextInput
          label={'Pesticide Use Permit'}
          tooltip={tooltips.plant.chemical.pesticide_use_permit}
          width={Width.Half}
          error={errors?.subtype_data?.pesticide_use_permit}
          {...register('subtype_data.pesticide_use_permit')}
        />
        <SingleSelect
          label={'Pest Management Plan (PMP)'}
          name={'subtype_data.pest_management_plan'}
          width={Width.Half}
          tooltip={tooltips.plant.chemical.pest_management_plan}
          options={codes?.PestManagementPlan}
          rules={{
            deps: ['subtype_data.pest_management_plan_manual'],
            validate: validatePMPSelection
          }}
        />
        <TextInput
          label={'PMP # Not in Dropdown'}
          tooltip={tooltips.plant.chemical.pest_management_plan_manual}
          width={Width.Half}
          error={errors?.subtype_data?.pest_management_plan_manual}
          {...register('subtype_data.pest_management_plan_manual', {
            deps: ['subtype_data.pest_management_plan'],
            validate: validatePMPSelection
          })}
        />
        <SingleSelect
          label={'Treatment Notice Signs'}
          required
          name={'subtype_data.treatment_notice_signs'}
          rules={{ required: true }}
          options={YesNoUnknown}
          width={Width.Half}
          tooltip={tooltips.plant.chemical.treatment_notice_signs}
        />
        <SingleSelect
          label={'Precautionary Statement'}
          required
          name={'subtype_data.precautionary_statement'}
          rules={{ required: true }}
          options={codes?.ChemicalPrecautionaryStatement}
          width={Width.Half}
          tooltip={tooltips.plant.chemical.required_under_license}
        />
        <DateInput
          label={'Application Start Time'}
          required
          includeTime
          width={Width.Half}
          error={errors?.subtype_data?.application_start_time}
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
          tooltip={tooltips.plant.chemical.required_under_license}
          width={Width.Half}
          rules={{ validate: (value) => value !== undefined || 'NTZ reduction is required' }}
          required
          name={'subtype_data.ntz_reduction_bool'}
          options={[
            { code: 'true', full_name: 'Yes', table: 'NTZ' },
            { code: 'false', full_name: 'No', table: 'NTZ' }
          ]}
        />
        {ntz_bool ? (
          <TextInput
            label={'Rationale for NTZ Reduction'}
            tooltip={tooltips.plant.chemical.required_under_license}
            width={Width.Half}
            error={errors?.subtype_data?.rationale_for_ntz_reduction}
            advisoryText="Only the PMP or permit holder may approve an NTZ reduction on public lands."
            required
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
          tooltip={tooltips.plant.chemical.required_under_license}
          rules={{ validate: (value) => value !== undefined || 'NTZ reduction is required' }}
          required
          name={'subtype_data.pest_injury_threshold_determination_bool'}
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
      <p>TODO: Calculation Fields for {type}</p>
    </>
  );
};

export default TreatmentChemicalPlant;
