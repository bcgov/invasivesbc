import { get, useFormContext, useWatch } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';
import { useEffect, useMemo } from 'react';
import { ChemTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces';
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
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';
import { ApplicationRateHerbicide } from '../../interfaces/ChemicalTreatmentContext';

const TreatmentChemicalPlantDetails = () => {
  enum CalculationType {
    Dilution = 'D',
    ApplicationRate = 'PAR'
  }
  const { getPath } = useFieldPath<ChemTreatment>('subtype_data.treatment_context');
  const {
    control,
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
  const calculation_type = watch(getPath('calculation_type'));
  const tank_mix = watch(getPath('tank_mix'));
  const application_method = watch(getPath('application_method'));
  const herbicides = useWatch({ control, name: 'subtype_data.treatment_context.herbicide' });

  /**
   * Business Rule: Herbicide Delivery Rate must be less than or equal the Application rate to be considered valid.
   */
  const validateDeliveryRate = (deliveryRate: number): boolean | string => {
    const maxApplicationRate = Math.max(
      ...(herbicides as Array<ApplicationRateHerbicide>).map((h: ApplicationRateHerbicide): number => {
        const rate = h?.application_rate ?? 0;
        if (!rate) return 0;
        if (h.type === 'granular') return rate / 1000; // Convert all to same units (e.g.: 300g == 0.3L.
        return rate;
      })
    );
    return (
      maxApplicationRate <= deliveryRate ||
      'Delivery rate cannot be less than the highest declared Product Application Rate'
    );
  };

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
    const calculationCodes = [{ code: 'PAR', full_name: 'Product Application Rate' }];
    if (!tank_mix) calculationCodes.push({ code: 'D', full_name: 'Dilution' });
    return calculationCodes;
  }, [tank_mix]);

  // If application_method changes and is no longer valid, reset the field.
  useEffect(() => {
    if (!isDirty) return;
    const currentSelectionNoLongerValid =
      application_method && !application_method_codes.some(({ code }) => code === application_method);
    if (currentSelectionNoLongerValid) {
      setValue(getPath('application_method'), '', { shouldDirty: true });
    }
  }, [application_method_codes, application_method]);

  // Trigger Validation on Herbicides when tank mix changes (modifies maxLength Constraints)
  useEffect(() => {
    if (!isDirty) return;
    trigger(getPath('herbicide'));
  }, [tank_mix]);

  useEffect(() => {
    if (!isDirty) return;
    const currentSelectionNoLongerValid =
      calculationOptions && !calculationOptions.some(({ code }) => code === calculation_type);
    if (currentSelectionNoLongerValid) {
      setValue(getPath('calculation_type'), '', { shouldDirty: true });
    }
  }, [calculationOptions]);

  return (
    <Fieldset label={'Chemical Treatment Details'}>
      <RadioInput
        label={'Tank Mix'}
        name={getPath('tank_mix')}
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
        name={getPath('application_method')}
        options={application_method_codes}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.chemical.calculation_fields.application_method}
        width={Width.Half}
      />
      <SingleSelect
        label={'Calculation Type'}
        name={getPath('calculation_type')}
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
              name={getPath(`plants_treated.${index}.invasive_plant`)}
              options={invasivePlantCodes}
              required
              rules={{ required: true }}
              tooltip={tooltips.plant.invasive_plant}
            />
            <NumberInput
              error={get(errors, getPath(`plants_treated.${index}.percent_covered`))}
              label={'Percent Area Covered'}
              tooltip={tooltips.plant.chemical.calculation_fields.area_covered}
              required
              {...register(getPath(`plants_treated.${index}.percent_covered`), {
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
        acceptFloats
        error={get(errors, getPath('amount_mix_used_l'))}
        {...register(getPath('amount_mix_used_l'), {
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
            acceptFloats
            error={get(errors, getPath('dilution_percent'))}
            {...register(getPath('dilution_percent'), {
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
            error={get(errors, getPath('area_treated_sqm'))}
            required
            {...register(getPath('area_treated_sqm'), {
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
          label={`Delivery Rate of Mix (L/ha)`}
          width={Width.Half}
          tooltip={tooltips.plant.chemical.calculation_fields.delivery_rate_of_mix}
          required
          error={get(errors, getPath('delivery_rate'))}
          {...register(getPath('delivery_rate'), {
            required: true,
            valueAsNumber: true,
            shouldUnregister: true,
            validate: {
              isPositive: (val) => greaterThan(val, 0),
              isLessThanAppRate: (val) => validateDeliveryRate(val)
            }
          })}
        />
      )}
      <TreatmentChemicalPlantCalculations />
    </Fieldset>
  );
};

export default TreatmentChemicalPlantDetails;
