import { get, useFormContext } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';
import { useEffect, useMemo } from 'react';
import {
  AquaticChemicalTreatmentSchema,
  TerrestrialChemicalTreatmentSchema
} from 'UI/Features/Records/Activity/forms/plant/interfaces';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import RadioInput from 'UI/Features/Records/Activity/forms/common/RadioInput/RadioInput';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { ActivitySubtypes } from 'sharedAPI';
import HerbicideEntry from './HerbicideEntry';
import {
  checkSum,
  greaterThan,
  lessThanEqual,
  minArrayLength,
  greaterThanEqual,
  noRepeatKey
} from 'UI/Features/Records/Activity/forms/common/validators';
import TreatmentChemicalPlantCalculations from './TreatmentChemicalPlantCalculations';

type ChemTreatment = AquaticChemicalTreatmentSchema | TerrestrialChemicalTreatmentSchema;

const TreatmentChemicalPlantDetails = () => {
  enum CalculationType {
    Dilution = 'Dilution',
    ApplicationRate = 'Product Application Rate'
  }

  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { isDirty, errors }
  } = useFormContext<ChemTreatment>();

  // Selectors
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  const subtype = useSelector((state) => state.ActivityPage.formType);

  // Watched form values
  const calculation_type = watch('subtype_data.treatment_context.calculation_type');
  const tank_mix = watch('subtype_data.treatment_context.tank_mix');
  const application_method = watch('subtype_data.treatment_context.application_method');

  // Filter plant codes based on if subtype is Aquatic or Terrestrial.
  const invasivePlantCodes = useMemo(() => {
    if (subtype === ActivitySubtypes.Treatment_Chemical_Plant_Aquatic) return codes.AquaticPlantCode;
    if (subtype === ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial) return codes.TerrestrialPlantCode;
    return [];
  }, [subtype, codes]);

  const application_method_codes = useMemo(() => {
    if (tank_mix) return codes?.ChemicalApplicationMethodSprayCode;
    return [...codes.ChemicalApplicationMethodSprayCode, ...codes.ChemicalApplicationMethodDirectCode];
  }, [tank_mix, codes]);

  // Calculation methods available depending on if a tank mix or not
  const calculationOptions = useMemo(() => {
    const codes = [
      { code: CalculationType.ApplicationRate, full_name: CalculationType.ApplicationRate, table: 'CalculationType' }
    ];
    if (!tank_mix)
      codes.push({
        code: CalculationType.Dilution,
        full_name: CalculationType.Dilution,
        table: 'CalculationType'
      });
    return codes;
  }, [tank_mix]);

  // If application_method changes and is no longer valid, reset the field.
  useEffect(() => {
    if (!isDirty) return;
    const currentSelectionNoLongerValid =
      application_method && !application_method_codes.some(({ code }) => code === application_method);
    if (currentSelectionNoLongerValid) {
      setValue('subtype_data.treatment_context.application_method', '', { shouldDirty: true });
    }
  }, [application_method_codes, application_method]);

  // Trigger Validation on Herbicides when tank mix changes (modifies maxLength Constraints)
  useEffect(() => {
    if (!isDirty) return;
    trigger('subtype_data.treatment_context.herbicide');
  }, [tank_mix]);

  useEffect(() => {
    if (!isDirty) return;
    const currentSelectionNoLongerValid =
      calculationOptions && !calculationOptions.some(({ code }) => code === calculation_type);
    if (currentSelectionNoLongerValid) {
      setValue('subtype_data.treatment_context.calculation_type', '', { shouldDirty: true });
    }
  }, [calculationOptions]);

  return (
    <Fieldset label={'Chemical Treatment Details'}>
      <RadioInput
        label={'Tank Mix'}
        name={'subtype_data.treatment_context.tank_mix'}
        required
        rules={{ validate: (value) => value !== undefined || 'Tank mix is required' }}
        tooltip={tooltips.plant.chemical.calculation_fields.tank_mix}
        width={Width.Half}
        options={[
          { code: 'true', full_name: 'Yes', table: 'TankMix' },
          { code: 'false', full_name: 'No', table: 'TankMix' }
        ]}
      />
      <SingleSelect
        label="Chemical Application Method"
        name={'subtype_data.treatment_context.application_method'}
        options={application_method_codes}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.chemical.calculation_fields.application_method}
        width={Width.Half}
      />
      <SingleSelect
        label={'Calculation Type'}
        name={'subtype_data.treatment_context.calculation_type'}
        options={calculationOptions}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.chemical.calculation_fields.calculation_type}
      />
      <ArrayField<ChemTreatment, 'subtype_data.treatment_context.plants_treated'>
        label={'Invasive Plants'}
        name={'subtype_data.treatment_context.plants_treated'}
        width={Width.Half}
        emptyValue={
          (getDefaultFormState(ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial) as ChemTreatment).subtype_data
            .treatment_context.plants_treated[0]
        }
        rules={{
          required: true,
          validate: {
            minEntries: (val) => minArrayLength(val, 1),
            sumHundred: (val) => checkSum(val, 100, { key: 'percent_covered', readable: 'percent covered' }),
            noRepeatPlant: (val) => noRepeatKey(val, 'invasive_plant', 'Invasive plant')
          }
        }}
        renderRow={(index) => (
          <>
            <SingleSelect
              label="Invasive Plant"
              name={`subtype_data.treatment_context.plants_treated.${index}.invasive_plant`}
              options={invasivePlantCodes}
              required
              rules={{ required: true }}
              tooltip={tooltips.plant.invasive_plant}
            />
            <NumberInput
              error={get(errors, `subtype_data.treatment_context.plants_treated.${index}.percent_covered`)}
              label={'Percent Area Covered'}
              tooltip={tooltips.plant.chemical.calculation_fields.area_covered}
              {...register(`subtype_data.treatment_context.plants_treated.${index}.percent_covered`, {
                required: true,
                valueAsNumber: true,
                validate: {
                  min: (val) => greaterThan(val, 0),
                  max: (val) => lessThanEqual(val, 100)
                }
              })}
            />
          </>
        )}
      />

      <ArrayField<ChemTreatment, 'subtype_data.treatment_context.herbicide'>
        label={'Herbicides'}
        name={'subtype_data.treatment_context.herbicide'}
        emptyValue={{ type: '', name: '' }}
        width={Width.Half}
        rules={{
          required: true,
          validate: {
            min: (val) => greaterThanEqual(val.length, 1),
            max: (val) => tank_mix || lessThanEqual(val.length, 1), // Only limit on non-tank mixes
            noDuplicateHerbicide: (val) => noRepeatKey(val, 'name', 'name')
          }
        }}
        renderRow={(index) => <HerbicideEntry idx={index} type={calculation_type as CalculationType} />}
      />
      <NumberInput
        label={`Amount of Mix Used (L)`}
        width={Width.Half}
        tooltip={tooltips.plant.chemical.calculation_fields.amount_mix_used}
        required
        error={get(errors, 'subtype_data.treatment_context.amount_mix_used_l')}
        {...register('subtype_data.treatment_context.amount_mix_used_l', {
          valueAsNumber: true,
          required: true,
          validate: (val) => greaterThan(val, 0)
        })}
      />

      {calculation_type === CalculationType.Dilution && (
        <>
          <NumberInput
            label={`Dilution (%)`} // Figure out G/L measurement
            width={Width.Half}
            tooltip={tooltips.plant.chemical.calculation_fields.dilution_percent}
            required
            error={get(errors, 'subtype_data.treatment_context.dilution_percent')}
            {...register('subtype_data.treatment_context.dilution_percent', {
              required: true,
              valueAsNumber: true,
              shouldUnregister: true,
              validate: {
                min: (val) => greaterThan(val, 0),
                max: (val) => lessThanEqual(val, 100)
              }
            })}
          />
          <NumberInput
            label={`Area Treated (m²)`}
            width={Width.Half}
            tooltip={tooltips.plant.chemical.calculation_fields.area_treated_msq}
            error={get(errors, 'subtype_data.treatment_context.area_treated_sqm')}
            required
            {...register('subtype_data.treatment_context.area_treated_sqm', {
              required: true,
              valueAsNumber: true,
              shouldUnregister: true,
              validate: (val) => greaterThan(val, 0)
            })}
          />
        </>
      )}
      {calculation_type === CalculationType.ApplicationRate && (
        <NumberInput
          label={`Delivery Rate of Mix (L)`}
          width={Width.Half}
          tooltip={tooltips.plant.chemical.calculation_fields.delivery_rate_of_mix}
          required
          error={get(errors, 'subtype_data.treatment_context.delivery_rate')}
          {...register('subtype_data.treatment_context.delivery_rate', {
            required: true,
            valueAsNumber: true,
            shouldUnregister: true,
            validate: (val) => greaterThan(val, 0)
          })}
        />
      )}
      <TreatmentChemicalPlantCalculations />
    </Fieldset>
  );
};

export default TreatmentChemicalPlantDetails;
