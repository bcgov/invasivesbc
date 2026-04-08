/**
 * GENERAL INFO on function names:
 *  - sSpecie: single specie
 *  - mSpecies: multiple species
 *  - sHerb: single herbicide
 *  - mHerb: multiple herbicides
 *  - LHerb: liquid herbicide
 *  - GHerb: granular herbicide
 *  - mLGHerb: liquid and granular herbicides (tank_mix only)
 *  - spray: spray application method
 *  - direct: direct application method
 *  - usingProdAppRate: calculations are based on product_application_rate input
 *  - usingDilutionPercent: calculations are based on dilution input
 *
 *  FORMATTING : {specie}_{herbicide}_{method}_{using}
 */
import {
  ApplicationRateHerbicide,
  BaseChemicalContext
} from 'UI/Features/Records/Activity/forms/plant/interfaces/ChemicalTreatmentContext';

/**
 * @desc All Possible Return values for Herbicide Calculations.
 *       Typed to ensure naming consistency.
 */
type CalculationResponseValues = {
  herbicide_name: string;
  dilution: number;
  invasive_plant: string;
  amount_of_mix_used: number;
  area_treated_sqm: number;
  percentage_area_covered: number;
  undiluted_herbicide_used_l: number;
  product_application_rate: number;
};
const HECTARE_TO_SQM = 10000;
const trunc = (value: number) => Number(value.toFixed(10));

/**
 * Sort Order for Return Values
 * - invasive_plant
 * - herbicide_name
 * - amount_of_mix_used
 * - product_application_rate
 * - dilution
 * - area_treated_sqm
 * - undiluted_herbicide_used_l
 * - percentage_area_covered
 */

type ApplicationCalculationVariables = {
  area_m: number;
  product_application_rate_lha: number;
  amount_mix_used_l: number;
  delivery_rate_of_mix: number;
  plants_treated: BaseChemicalContext['plants_treated'];
  herbicide_name: string;
};

type DilutionCalculationVariables = {
  area_m: number;
  amount_mix_used_l: number;
  dilution_percent: number;
  area_treated_sqm: number;
  plants_treated: BaseChemicalContext['plants_treated'];
  herbicide_name: string;
};

/**
 *    **Application Method**: Spray
 *
 *    **Calculation Type**: Product Application Rate
 *
 *    **Herbicides**: x1 Liquid
 *
 *    **Plants** : Two+
 *
 *    **Scenario**: One/Two
 */
const mSpecie_sLHerb_spray_usingProdAppRate = ({
  area_m,
  product_application_rate_lha,
  amount_mix_used_l,
  delivery_rate_of_mix,
  plants_treated,
  herbicide_name
}: ApplicationCalculationVariables): Array<Partial<CalculationResponseValues>> => {
  console.debug('Calculation scenario: 2');
  const dilution = (product_application_rate_lha / delivery_rate_of_mix) * 100;

  return plants_treated.map((plant) => {
    const amount_of_mix_used = trunc(amount_mix_used_l * (plant.percent_covered / 100));
    const area_treated_hectares = ((amount_mix_used_l / delivery_rate_of_mix) * plant.percent_covered) / 100;
    const area_treated_by_plant = area_treated_hectares * HECTARE_TO_SQM;
    const percentage_area_covered = trunc((area_treated_by_plant / area_m) * 100);
    const undiluted_herbicide_used_l = trunc((dilution / 100) * amount_mix_used_l * (plant.percent_covered / 100));
    return {
      invasive_plant: plant.invasive_plant,
      herbicide_name,
      amount_of_mix_used,
      dilution: trunc(dilution),
      area_treated_sqm: trunc(area_treated_hectares * HECTARE_TO_SQM),
      undiluted_herbicide_used_l,
      percentage_area_covered
    } as CalculationResponseValues;
  });
};

/**
 *    **Application Method**: Spray
 *
 *    **Calculation Type**: Dilution / Direct
 *
 *    **Herbicides**: x1 Liquid
 *
 *    **Plants** : Two+
 *
 *    **Scenario**: Three/Four
 */
const mSpecie_sLHerb_spray_usingDilutionPercent = ({
  area_m,
  amount_mix_used_l,
  dilution_percent,
  area_treated_sqm,
  plants_treated,
  herbicide_name
}: DilutionCalculationVariables): Array<Partial<CalculationResponseValues>> => {
  console.debug('Calculation scenario: 4');
  return plants_treated.map((plant) => {
    const plant_area_treated_sqm = area_treated_sqm * (plant.percent_covered / 100);
    const percentage_area_covered = trunc((plant_area_treated_sqm / area_m) * 100);
    const undiluted_herbicide_used_l = trunc(
      (dilution_percent / 100) * amount_mix_used_l * (plant.percent_covered / 100)
    );
    return {
      invasive_plant: plant.invasive_plant,
      herbicide_name,
      area_treated_sqm: plant_area_treated_sqm,
      undiluted_herbicide_used_l: undiluted_herbicide_used_l,
      percentage_area_covered: percentage_area_covered
    } as CalculationResponseValues;
  });
};

/**
 *    **Application Method**: Spray
 *
 *    **Calculation Type**: Product Application Rate
 *
 *    **Herbicides**: x1 Granular
 *
 *    **Plants** : Two+
 *
 *    **Scenario**: Five
 */
const mSpecie_sGHerb_spray_usingProdAppRate = ({
  area_m,
  product_application_rate_lha,
  amount_mix_used_l,
  delivery_rate_of_mix,
  plants_treated,
  herbicide_name
}: ApplicationCalculationVariables): Array<Partial<CalculationResponseValues>> => {
  console.debug('Calculation scenario: 5');
  const dilution = (product_application_rate_lha / 1000 / delivery_rate_of_mix) * 100;

  const calculations = plants_treated.map((plant) => {
    const amount_of_mix_used = amount_mix_used_l * (plant.percent_covered / 100);
    const area_treated_sqm =
      (((amount_mix_used_l / delivery_rate_of_mix) * plant.percent_covered) / 100) * HECTARE_TO_SQM;
    const percentage_area_covered = trunc((area_treated_sqm / area_m) * 100);
    const undiluted_herbicide_used_l = trunc((dilution / 100) * amount_mix_used_l * (plant.percent_covered / 100));
    return {
      invasive_plant: plant.invasive_plant,
      herbicide_name,
      amount_of_mix_used: trunc(amount_of_mix_used),
      product_application_rate: product_application_rate_lha,
      dilution: trunc(dilution),
      area_treated_sqm: trunc(area_treated_sqm),
      undiluted_herbicide_used_l,
      percentage_area_covered
    } as CalculationResponseValues;
  });
  return calculations;
};

/**
 *    **Application Method**: Spray
 *
 *    **Calculation Type**: Dilution
 *
 *    **Herbicides**: x1 Granular
 *
 *    **Plants** : One+
 *
 *    **Scenario**: Six
 */
const mSpecie_sGHerb_spray_usingDilutionPercent = ({
  area_m,
  amount_mix_used_l,
  dilution_percent,
  area_treated_sqm,
  plants_treated,
  herbicide_name
}: DilutionCalculationVariables): Array<Partial<CalculationResponseValues>> => {
  console.debug('Calculation scenario: 6');
  const calculations = plants_treated.map((plant) => {
    const area_treated_by_plant = area_treated_sqm * (plant.percent_covered / 100);
    const percentage_area_covered = trunc((area_treated_by_plant / area_m) * 100);
    const undiluted_herbicide_used_l = trunc(
      (dilution_percent / 100) * amount_mix_used_l * (plant.percent_covered / 100)
    );
    return {
      invasive_plant: plant.invasive_plant,
      herbicide_name,
      area_treated_sqm: trunc(area_treated_by_plant),
      undiluted_herbicide_used_l,
      percentage_area_covered
    } as CalculationResponseValues;
  });
  return calculations;
};

/**
 *    **Application Method**: Direct
 *
 *    **Calculation Type**: Dilution
 *
 *    **Herbicides**: x1 Liquid
 *
 *    **Plants** : One
 *
 *    **Scenario**: Seven
 */
const sSpecie_sLHerb_direct_usingDilutionPercent = ({
  area_m,
  amount_mix_used_l,
  dilution_percent,
  area_treated_sqm,
  plants_treated,
  herbicide_name
}: DilutionCalculationVariables): Array<Partial<CalculationResponseValues>> => {
  console.debug('Calculation scenario: 7');
  const area_covered_pct = trunc((area_treated_sqm / area_m) * 100);
  const undiluted_herbicide_used_l = trunc((dilution_percent / 100) * amount_mix_used_l);
  return [
    {
      invasive_plant: plants_treated[0].invasive_plant,
      herbicide_name,
      area_treated_sqm,
      undiluted_herbicide_used_l,
      percentage_area_covered: area_covered_pct
    } as CalculationResponseValues
  ];
};

/**
 *    **Application Method**: Spray
 *
 *    **Calculation Type**: Product Application Rate
 *
 *    **Herbicides**: Two+ Liquid or Solid
 *
 *    **Plants** : One+
 *
 *    **Scenario**: 8-11
 */
const mSpecie_mLGHerb_spray_usingProdAppRate = (
  area_m: number,
  amount_mix_used_l: number,
  delivery_rate: number,
  plants_treated: BaseChemicalContext['plants_treated'],
  herbicide: ApplicationRateHerbicide[]
): Array<Partial<CalculationResponseValues>> => {
  console.debug('Calculation scenario: 8-10 (11)');
  return plants_treated.flatMap(({ percent_covered, invasive_plant }) => {
    const area_treated_sqm = (amount_mix_used_l / delivery_rate) * (percent_covered / 100) * HECTARE_TO_SQM;
    const area_covered_pct = (area_treated_sqm / area_m) * 100;
    return herbicide.map(({ application_rate, type, name }) => {
      const dilution = (() => {
        if (type === 'granular') return (application_rate / 1000 / delivery_rate) * 100;
        return (application_rate / delivery_rate) * 100;
      })();
      const undiluted_herbicide_used_l = ((dilution / 100) * amount_mix_used_l * percent_covered) / 100;

      return {
        invasive_plant,
        herbicide_name: name,
        product_application_rate: application_rate,
        dilution: trunc(dilution),
        area_treated_sqm: trunc(area_treated_sqm),
        undiluted_herbicide_used_l: trunc(undiluted_herbicide_used_l),
        percentage_area_covered: trunc(area_covered_pct)
      } as CalculationResponseValues;
    });
  });
};

export {
  mSpecie_sLHerb_spray_usingProdAppRate,
  mSpecie_sLHerb_spray_usingDilutionPercent,
  mSpecie_sGHerb_spray_usingProdAppRate,
  mSpecie_sGHerb_spray_usingDilutionPercent,
  sSpecie_sLHerb_direct_usingDilutionPercent,
  mSpecie_mLGHerb_spray_usingProdAppRate
};
export type { DilutionCalculationVariables, ApplicationCalculationVariables };
