import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import {
  AquaticChemicalTreatmentSchema,
  TerrestrialChemicalTreatmentSchema
} from 'UI/Features/Records/Activity/forms/plant/interfaces';
import {
  mSpecie_mLGHerb_spray_usingProdAppRate,
  mSpecie_sGHerb_spray_usingDilutionPercent,
  mSpecie_sGHerb_spray_usingProdAppRate,
  mSpecie_sLHerb_spray_usingDilutionPercent,
  mSpecie_sLHerb_spray_usingProdAppRate,
  sSpecie_sLHerb_direct_usingDilutionPercent,
  sSpecie_sLHerb_spray_usingDilutionPercent,
  sSpecie_sLHerb_spray_usingProdAppRate
} from './calculations';
import { useSelector } from 'utils/use_selector';

type ChemTreatment = AquaticChemicalTreatmentSchema | TerrestrialChemicalTreatmentSchema;
enum CalculationType {
  Dilution = 'Dilution',
  ApplicationRate = 'Product Application Rate'
}
const TreatmentChemicalPlantCalculations = () => {
  const performCalculation = () => {
    const NUM_INVASIVE_PLANTS = plants_treated.length;
    const NUM_HERBICIDES = herbicide.length;

    if (!NUM_HERBICIDES || !NUM_INVASIVE_PLANTS) return 'Violation: Missing Herbicides and/or Invasive Plants';

    const isMultipleHerbicides = NUM_HERBICIDES > 1;
    const isMultiplePlants = NUM_INVASIVE_PLANTS > 1;

    if (tank_mix && !isMultipleHerbicides) return 'Violation: Tank mix requires multiple herbicides';
    if (tank_mix && isMultipleHerbicides) {
      return mSpecie_mLGHerb_spray_usingProdAppRate(
        area_m,
        amount_mix_used_l,
        delivery_rate,
        plants_treated,
        herbicide
      );
    }
    if (isMultipleHerbicides) return 'Violation: Only tank mix may have multiple herbicides.';

    const { type: herbicide_type, application_rate } = herbicide[0];
    const applicationMethod = (() => {
      const isSprayMethod = codes.ChemicalApplicationMethodSprayCode.some(({ code }) => code === application_method);
      if (isSprayMethod) return 'Spray';
      const isDirectMethod = codes.ChemicalApplicationMethodDirectCode.some(({ code }) => code === application_method);
      if (isDirectMethod) return 'Direct';
    })();
    const isHerbicideLiquid = herbicide_type === 'liquid';
    const isHerbicideSolid = herbicide_type === 'granular';
    const isApplicationCalculation = calculation_type === CalculationType.ApplicationRate;
    const isDilutionCalculation = calculation_type === CalculationType.Dilution;

    if (applicationMethod === 'Direct' && !isMultiplePlants && isHerbicideLiquid && isDilutionCalculation) {
      return sSpecie_sLHerb_direct_usingDilutionPercent(area_m, amount_mix_used_l, dilution_percent, area_treated_sqm);
    } else if (applicationMethod !== 'Spray') {
      return 'The information provided is an invalid scenario';
    }

    if (!isMultiplePlants && isHerbicideLiquid && isApplicationCalculation) {
      return sSpecie_sLHerb_spray_usingProdAppRate(area_m, application_rate, amount_mix_used_l, delivery_rate);
    } else if (!isMultiplePlants && isHerbicideLiquid && isDilutionCalculation) {
      return sSpecie_sLHerb_spray_usingDilutionPercent(area_m, amount_mix_used_l, dilution_percent, area_treated_sqm);
    } else if (isHerbicideSolid && isApplicationCalculation) {
      return mSpecie_sGHerb_spray_usingProdAppRate(
        area_m,
        application_rate,
        amount_mix_used_l,
        delivery_rate,
        plants_treated
      );
    } else if (isHerbicideSolid && isDilutionCalculation) {
      return mSpecie_sGHerb_spray_usingDilutionPercent(
        area_m,
        amount_mix_used_l,
        dilution_percent,
        area_treated_sqm,
        plants_treated
      );
    } else if (isMultiplePlants && isHerbicideLiquid && isApplicationCalculation) {
      return mSpecie_sLHerb_spray_usingProdAppRate(
        area_m,
        application_rate,
        amount_mix_used_l,
        delivery_rate,
        plants_treated
      );
    } else if (isMultiplePlants && isHerbicideLiquid && isDilutionCalculation) {
      return mSpecie_sLHerb_spray_usingDilutionPercent(
        area_m,
        amount_mix_used_l,
        dilution_percent,
        area_treated_sqm,
        plants_treated
      );
    }
    return 'The information provided is an invalid scenario';
  };

  const codes = useSelector((state) => state.ActivityPage.formCodes);
  const { control, watch } = useFormContext<ChemTreatment>();

  const {
    tank_mix,
    application_method,
    calculation_type,
    herbicide,
    plants_treated,
    amount_mix_used_l,
    dilution_percent,
    area_treated_sqm,
    delivery_rate
  } = useWatch<ChemTreatment>({
    control,
    name: 'subtype_data.treatment_context'
  });
  const area_m = watch('area_m');

  const calculations = useMemo(() => {
    try {
      return performCalculation();
    } catch (e) {
      console.error(e);
    }
  }, [
    area_m,
    tank_mix,
    application_method,
    calculation_type,
    herbicide,
    plants_treated,
    amount_mix_used_l,
    dilution_percent,
    area_treated_sqm
  ]);

  return (
    <Fieldset label={'Calculations'}>
      <pre style={{ textAlign: 'left' }}>{JSON.stringify(calculations, null, 2)}</pre>
    </Fieldset>
  );
};

export default TreatmentChemicalPlantCalculations;
