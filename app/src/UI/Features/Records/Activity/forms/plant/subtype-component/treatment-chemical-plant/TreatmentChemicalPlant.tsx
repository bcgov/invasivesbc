import { get, useFormContext } from 'react-hook-form';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { ChemTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { YesNoUnknown } from 'UI/Features/Records/Activity/forms/enums';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';
import RadioInput from 'UI/Features/Records/Activity/forms/common/RadioInput/RadioInput';
import FormSpacer from 'UI/Features/Records/Activity/forms/common/FormSpacer/FormSpacer';
import CheckboxInput from 'UI/Features/Records/Activity/forms/common/CheckboxInput/CheckboxInput';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import {
  lessThanEqual,
  lessThan,
  greaterThanEqual,
  noFutureDate
} from 'UI/Features/Records/Activity/forms/common/validators';
import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import { Fragment, useEffect, useState } from 'react';
import TreatmentChemicalPlantDetails from './TreatmentChemicalPlantDetails';
import useFilteredServiceLicenseCodes from 'UI/Features/Records/Activity/forms/plant/hooks/useFilteredServiceLicenseCodes';
import useLocalStorage from 'UI/Features/Records/Activity/forms/plant/hooks/useLocalStorage';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

const TreatmentChemicalPlant = () => {
  const MAX_ALLOWED_TEMP = 28;
  const MIN_ALLOWED_TEMP = 10;
  const MAX_WIND_SPEED = 9;

  /**
   * @desc Validate only PMP or Manual PMP are filled in, not both.
   */
  const validatePMPSelection = (_, formValues: ChemTreatment): true | string => {
    const pmp = formValues.subtype_data?.context?.pest_management_plan;
    const manual = formValues.subtype_data?.context?.pest_management_plan_manual;
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

  const { getPath } = useFieldPath<ChemTreatment>('subtype_data');
  const { getPath: getContextPath } = useFieldPath<ChemTreatment>('subtype_data.context');
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  const wellsInArea = useSelector((state) => state.ActivityPage?.wellsInRecordArea);

  const well_entries = watch(getPath('well_entries'));
  const ntz_bool = watch(getContextPath('ntz_reduction'));
  const temp_c = watch(getContextPath('temperature_c'));
  const wind_speed = watch(getContextPath('wind_speed_kmh'));

  const temperatureConsent = useLocalStorage('isTemperatureAccurate');
  const windSpeedConsent = useLocalStorage('isWindSpeedAccurate');
  /*
    Entry Policy: Out-of-range values (temperature, wind speed) are permitted only if the user has manually flagged them as accurate.
    This prevents data entry errors without blocking edge-case submissions.
  */
  const [userVerifiedTemperatureAccurate, setUserVerifiedTemperatureAccurate] = useState<boolean>(
    temperatureConsent.getConfirmation()
  );
  const [userVerifiedWindspeedAccurate, setUserVerifiedWindspeedAccurate] = useState<boolean>(
    windSpeedConsent.getConfirmation()
  );
  const { serviceLicenseCodes } = useFilteredServiceLicenseCodes(disabled);

  const shouldVerifyWindSpeedAccuracy = !disabled && wind_speed != undefined && wind_speed > MAX_WIND_SPEED;
  const shouldVerifyTemperatureAccuracy =
    !disabled && temp_c != undefined && (temp_c > MAX_ALLOWED_TEMP || temp_c < MIN_ALLOWED_TEMP);

  useEffect(() => {
    // Uncheck confirmation if temperature is changed
    if (!isDirty) return;
    temperatureConsent.remove();
    setUserVerifiedTemperatureAccurate(false);
  }, [temp_c]);

  useEffect(() => {
    // Uncheck confirmation if Wind speed is changed
    if (!isDirty) return;
    windSpeedConsent.remove();
    setUserVerifiedWindspeedAccurate(false);
  }, [wind_speed]);

  useEffect(() => {
    // Refire Temperature validation when confirmation changes
    if (!isDirty) return;
    trigger(getContextPath('temperature_c'));
  }, [userVerifiedTemperatureAccurate]);

  useEffect(() => {
    // Refire Temperature validation when confirmation changes
    if (!isDirty) return;
    trigger(getContextPath('wind_speed_kmh'));
  }, [userVerifiedWindspeedAccurate]);

  // Cleanup NTZ Reduction Rationale if Reduction is changed to False
  useEffect(() => {
    if (isDirty && !ntz_bool) {
      setValue(getContextPath('rationale_for_ntz_reduction'), '');
    }
  }, [ntz_bool]);

  // Update Nearest Wells when values change
  useEffect(() => {
    if (wellsInArea) {
      setValue(getPath('well_entries'), wellsInArea);
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
              required // ensure optional tag not present
              tooltip={tooltips.plant.chemical.wells.field_disclaimer}
              width={Width.Half}
              value={we.well_tag}
            />
            <NumberInput
              label={'Well Proximity (m)'}
              readOnly
              required // ensure optional tag not present
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
          error={get(errors, getContextPath('temperature_c'))}
          label={'Temperature (C°)'}
          required
          tooltip={tooltips.plant.chemical.weather.temperature_c}
          width={Width.Half}
          {...register(getContextPath('temperature_c'), {
            required: true,
            valueAsNumber: true,
            validate: {
              minValueBeforeVerify: (val) => userVerifiedTemperatureAccurate || greaterThanEqual(val, MIN_ALLOWED_TEMP),
              maxValueBeforeVerify: (val) =>
                userVerifiedTemperatureAccurate
                  ? lessThan(val, 100) // If user verifies weather accuracy, check for clearly accidental values (extra digits)
                  : lessThanEqual(val, MAX_ALLOWED_TEMP)
            }
          })}
        />
        <NumberInput
          error={get(errors, getContextPath('wind_speed_kmh'))}
          label={'Wind Speed (km/h)'}
          required
          tooltip={tooltips.plant.chemical.weather.wind_speed_kmh}
          width={Width.Half}
          {...register(getContextPath('wind_speed_kmh'), {
            required: true,
            valueAsNumber: true,
            // If user verifies weather accurate, check for clearly accidental values (extra digits)
            validate: {
              minSpeed: (val) => greaterThanEqual(val, 0),
              maxSpeed: (val) =>
                userVerifiedWindspeedAccurate ? lessThan(val, 100) : lessThanEqual(val, MAX_WIND_SPEED)
            }
          })}
        />
        <SingleSelect
          label={'Wind Direction'}
          name={getContextPath('wind_direction')}
          options={codes?.WindDirectionCode}
          required
          tooltip={tooltips.plant.chemical.weather.wind_direction}
          width={Width.Half}
          rules={{
            required: true,
            deps: [getContextPath('wind_speed_kmh')],
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
          error={get(errors, getContextPath('humidity'))}
          label={'Humidity (%)'}
          tooltip={tooltips.plant.chemical.weather.humidity}
          width={Width.Half}
          {...register(getContextPath('humidity'), {
            valueAsNumber: true,
            validate: {
              min: (val) => greaterThanEqual(val, 0),
              max: (val) => lessThanEqual(val, 100)
            }
          })}
        />
        {shouldVerifyTemperatureAccuracy && (
          <CheckboxUI
            label={
              'The temperature recorded at the time of treatment is an accurate representation of site conditions.'
            }
            required
            state={userVerifiedTemperatureAccurate}
            warningConfirmation
            onChange={() =>
              setUserVerifiedTemperatureAccurate((prev) => {
                prev ? temperatureConsent.remove() : temperatureConsent.confirm();
                return !prev;
              })
            }
          />
        )}
        {shouldVerifyWindSpeedAccuracy && (
          <CheckboxUI
            label={'The wind speed recorded at the time of treatment is an accurate representation of site conditions.'}
            required
            state={userVerifiedWindspeedAccurate}
            warningConfirmation
            onChange={() =>
              setUserVerifiedWindspeedAccurate((prev) => {
                prev ? windSpeedConsent.remove() : windSpeedConsent.confirm();
                return !prev;
              })
            }
          />
        )}
      </Fieldset>

      {/* Chemical Treatment Information */}
      <Fieldset label={'Chemical Treatment Information'}>
        <SingleSelect
          label={'Service License Number and Company Name'}
          name={getContextPath('pesticide_employer_code')}
          options={serviceLicenseCodes}
          required
          rules={{ required: true }}
          tooltip={tooltips.plant.chemical.service_license_number_and_company}
          width={Width.Half}
        />
        <TextInput
          error={get(errors, getContextPath('pesticide_use_permit'))}
          label={'Pesticide Use Permit'}
          tooltip={tooltips.plant.chemical.pesticide_use_permit}
          width={Width.Half}
          {...register(getContextPath('pesticide_use_permit'))}
        />
        <SingleSelect
          label={'Pest Management Plan (PMP)'}
          name={getContextPath('pest_management_plan')}
          options={codes?.PestManagementPlan}
          tooltip={tooltips.plant.chemical.pest_management_plan}
          width={Width.Half}
          rules={{
            deps: [getContextPath('pest_management_plan_manual')],
            validate: validatePMPSelection
          }}
        />
        <TextInput
          error={get(errors, getContextPath('pest_management_plan_manual'))}
          label={'PMP # Not in Dropdown'}
          tooltip={tooltips.plant.chemical.pest_management_plan_manual}
          width={Width.Half}
          {...register(getContextPath('pest_management_plan_manual'), {
            deps: [getContextPath('pest_management_plan')],
            validate: validatePMPSelection
          })}
        />
        <SingleSelect
          label={'Treatment Notice Signs'}
          name={getContextPath('treatment_notice_signs')}
          options={YesNoUnknown}
          required
          rules={{ required: true }}
          tooltip={tooltips.plant.chemical.treatment_notice_signs}
          width={Width.Half}
        />
        <SingleSelect
          label={'Precautionary Statement'}
          name={getContextPath('precautionary_statement')}
          options={codes?.ChemicalPrecautionaryStatement}
          rules={{ required: false }}
          tooltip={tooltips.plant.chemical.required_under_license}
          width={Width.Half}
        />
        <DateInput
          error={get(errors, getContextPath('application_start_time'))}
          includeTime
          label={'Application Start Time'}
          required
          width={Width.Half}
          {...register(getContextPath('application_start_time'), { required: true, validate: noFutureDate })}
        />
        <CheckboxInput
          label={'Additional/Unmapped Wells or Water License intakes within 30m'}
          tooltip={tooltips.plant.chemical.additional_unmapped_water}
          width={Width.Half}
          {...register(getContextPath('additional_unmapped_well_water'))}
        />
        <RadioInput
          label={'NTZ Reduction'}
          name={getContextPath('ntz_reduction')}
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
          <TextArea
            advisoryText="Only the PMP or permit holder may approve an NTZ reduction on public lands."
            error={get(errors, getContextPath('rationale_for_ntz_reduction'))}
            label={'Rationale for NTZ Reduction'}
            tooltip={tooltips.plant.chemical.required_under_license}
            required
            width={Width.Half}
            {...register(getContextPath('rationale_for_ntz_reduction'), { required: true })}
          />
        ) : (
          <FormSpacer width={Width.Half} />
        )}
      </Fieldset>

      {/* Pest Injury Threshold Determination */}
      <Fieldset label={'Pest Injury Threshold Determination'}>
        <RadioInput
          label={'Choose either option'}
          name={getContextPath('pest_injury_threshold_determination')}
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
