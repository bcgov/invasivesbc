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

const HECTARE_TO_SQM = 10000;
const trunc = (value: number) => Number(value.toFixed(10));

/**
 *    **Application Method**: Spray
 *
 *    **Calculation Type**: Product Application Rate
 *
 *    **Herbicides**: x1 Liquid
 *
 *    **Plants**: One
 *
 *    **Scenario**: One
 */
const sSpecie_sLHerb_spray_usingProdAppRate = (
  area: number,
  product_application_rate_lha: number,
  amount_of_mix: number,
  delivery_rate_of_mix: number
): object => {
  console.debug('Calculation scenario: 1');
  const dilution = (product_application_rate_lha / delivery_rate_of_mix) * 100;
  const area_treated_sqm = (amount_of_mix / delivery_rate_of_mix) * HECTARE_TO_SQM;
  const area_covered_pct = trunc((area_treated_sqm / area) * 100);
  const undiluted_herbicide_used_l = trunc((dilution / 100) * amount_of_mix);

  return {
    dilution: trunc(dilution),
    area_treated_sqm: trunc(area_treated_sqm),
    area_covered_pct,
    undiluted_herbicide_used_l
  };
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
 *    **Scenario**: Two
 */
const mSpecie_sLHerb_spray_usingProdAppRate = (
  area: number,
  product_application_rate_lha: number,
  amount_of_mix: number,
  delivery_rate_of_mix: number,
  plant_treated: BaseChemicalContext['plants_treated']
): object => {
  console.debug('Calculation scenario: 2');
  const dilution = (product_application_rate_lha / delivery_rate_of_mix) * 100;

  const species = plant_treated.map((plant, index) => {
    const amount_of_mix_used = trunc(amount_of_mix * (plant.percent_covered / 100));
    const area_treated_hectares = ((amount_of_mix / delivery_rate_of_mix) * plant.percent_covered) / 100;
    const area_treated_by_plant = area_treated_hectares * HECTARE_TO_SQM;
    const area_covered_pct = trunc((area_treated_by_plant / area) * 100);
    const undiluted_herbicide_used_l = trunc((dilution / 100) * amount_of_mix * (plant.percent_covered / 100));
    return {
      index,
      amount_of_mix_used,
      area_covered_pct,
      area_treated_sqm: trunc(area_treated_hectares * HECTARE_TO_SQM),
      undiluted_herbicide_used_l
    };
  });
  return {
    dilution: trunc(dilution),
    invasive_plants: species
  };
};

/**
 *    **Application Method**: Spray
 *
 *    **Calculation Type**: Dilution
 *
 *    **Herbicides**: x1 Liquid
 *
 *    **Plants**: One
 *
 *    **Scenario**: Three
 */
const sSpecie_sLHerb_spray_usingDilutionPercent = (
  area: number,
  amount_of_mix: number,
  dilution: number,
  area_treated_sqm: number
) => {
  console.debug('Calculation scenario: 3');
  const area_treated_hectares = trunc(area_treated_sqm / HECTARE_TO_SQM);
  const area_covered_pct = trunc((area_treated_sqm / area) * 100);
  const undiluted_herbicide_used_l = trunc((dilution / 100) * amount_of_mix);
  return {
    area_treated_sqm: area_treated_hectares * HECTARE_TO_SQM,
    area_covered_pct,
    undiluted_herbicide_used_l
  };
};

/**
 *    **Application Method**: Spray
 *
 *    **Calculation Type**: Dilution
 *
 *    **Herbicides**: x1 Liquid
 *
 *    **Plants** : Two+
 *
 *    **Scenario**: Four
 */
const mSpecie_sLHerb_spray_usingDilutionPercent = (
  area: number,
  amount_of_mix: number,
  dilution: number,
  area_treated_sqm: number,
  plants_treated: BaseChemicalContext['plants_treated']
) => {
  console.debug('Calculation scenario: 4');
  const species = plants_treated.map((plant, index) => {
    const plant_area_treated_sqm = area_treated_sqm * (plant.percent_covered / 100);
    const percentage_area_covered = trunc((plant_area_treated_sqm / area) * 100);
    const undiluted_herbicide_used_l = trunc((dilution / 100) * amount_of_mix * (plant.percent_covered / 100));
    return {
      index,
      area_treated_sqm: plant_area_treated_sqm,
      percentage_area_covered: percentage_area_covered,
      undiluted_herbicide_used_l: undiluted_herbicide_used_l
    };
  });
  return {
    area_treated_sqm,
    invasive_plants: species
  };
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
const mSpecie_sGHerb_spray_usingProdAppRate = (
  area_m: number,
  product_application_rate_lha: number,
  amount_mix_used_l: number,
  delivery_rate: number,
  plants_treated: BaseChemicalContext['plants_treated']
) => {
  console.debug('Calculation scenario: 5');
  const dilution = (product_application_rate_lha / 1000 / delivery_rate) * 100;

  const species = plants_treated.map((plant, index) => {
    const amount_of_mix_used = amount_mix_used_l * (plant.percent_covered / 100);
    const area_treated_sqm = (((amount_mix_used_l / delivery_rate) * plant.percent_covered) / 100) * HECTARE_TO_SQM;
    const percentage_area_covered = trunc((area_treated_sqm / area_m) * 100);
    const undiluted_herbicide_used_l = trunc((dilution / 100) * amount_mix_used_l * (plant.percent_covered / 100));
    return {
      index,
      amount_of_mix_used: trunc(amount_of_mix_used),
      area_treated_sqm: trunc(area_treated_sqm),
      percentage_area_covered,
      undiluted_herbicide_used_l
    };
  });
  return {
    dilution: trunc(dilution),
    invasive_plants: species
  };
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
const mSpecie_sGHerb_spray_usingDilutionPercent = (
  area_m: number,
  amount_mix_used_l: number,
  dilution_percent: number,
  area_treated_sqm: number,
  plants_treated: BaseChemicalContext['plants_treated']
) => {
  console.debug('Calculation scenario: 6');
  const species = plants_treated.map((plant, index) => {
    const area_treated_by_plant = area_treated_sqm * (plant.percent_covered / 100);
    const percentage_area_covered = trunc((area_treated_by_plant / area_m) * 100);
    const undiluted_herbicide_used_l = trunc(
      (dilution_percent / 100) * amount_mix_used_l * (plant.percent_covered / 100)
    );
    return {
      index: index,
      area_treated_sqm: trunc(area_treated_by_plant),
      percentage_area_covered,
      undiluted_herbicide_used_l
    };
  });
  return {
    area_treated_sqm: area_treated_sqm,
    invasive_plants: species
  };
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
const sSpecie_sLHerb_direct_usingDilutionPercent = (
  area_m: number,
  amount_mix_used_l: number,
  dilution_percent: number,
  area_treated_sqm: number
) => {
  console.debug('Calculation scenario: 7');
  const area_covered_pct = trunc((area_treated_sqm / area_m) * 100);
  const undiluted_herbicide_used_l = trunc((dilution_percent / 100) * amount_mix_used_l);
  return {
    area_treated_sqm,
    area_covered_pct,
    undiluted_herbicide_used_l
  };
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
) => {
  console.debug('Calculation scenario: 8-10 (11)');
  const outputInvPlantsArr: Array<OutputSpecie> = plants_treated.map(({ percent_covered }, plantIndex) => {
    const amount_of_mix_used = amount_mix_used_l * (percent_covered / 100);
    const area_treated_sqm = (amount_mix_used_l / delivery_rate) * (percent_covered / 100) * HECTARE_TO_SQM;
    const area_covered_pct = (area_treated_sqm / area_m) * 100;
    const herbicides = herbicide.map(({ application_rate, type }, herbIndex) => {
      const dilution = (() => {
        if (type === 'granular') return (application_rate / 1000 / delivery_rate) * 100;
        return (application_rate / delivery_rate) * 100;
      })();

      const undiluted_herbicide_used_l = ((dilution / 100) * amount_mix_used_l * percent_covered) / 100;
      const outputHerb: OutputHerb = {
        dilution: trunc(dilution),
        plantIndex,
        herbIndex,
        undiluted_herbicide_used_l: trunc(undiluted_herbicide_used_l),
        product_application_rate: application_rate
      };
      return outputHerb;
    });
    return {
      index: plantIndex,
      amount_of_mix_used: trunc(amount_of_mix_used),
      area_treated_sqm: trunc(area_treated_sqm),
      area_covered_pct: trunc(area_covered_pct),
      herbicides
    };
  });
  return {
    invasive_plants: outputInvPlantsArr
  };
};

type OutputHerb = {
  plantIndex: number;
  herbIndex: number;
  dilution: number;
  undiluted_herbicide_used_l: number;
  product_application_rate: number;
};
type OutputSpecie = {
  index: number;
  amount_of_mix_used: number;
  area_treated_sqm: number;
  area_covered_pct: number;
  herbicides: Array<OutputHerb>;
};
export {
  sSpecie_sLHerb_spray_usingProdAppRate,
  mSpecie_sLHerb_spray_usingProdAppRate,
  sSpecie_sLHerb_spray_usingDilutionPercent,
  mSpecie_sLHerb_spray_usingDilutionPercent,
  mSpecie_sGHerb_spray_usingProdAppRate,
  mSpecie_sGHerb_spray_usingDilutionPercent,
  sSpecie_sLHerb_direct_usingDilutionPercent,
  mSpecie_mLGHerb_spray_usingProdAppRate
};
