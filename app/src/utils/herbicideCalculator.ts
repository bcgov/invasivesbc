/**
 * ------------------- GENERAL INFO on function names ----------------------------
 *  sSpecie = single specie
 *  mSpecies = multiple species
 *  sHerb = single herbicide
 *  mHerb = multiple herbicides
 *  LHerb = liquid herbicide
 *  GHerb = granular herbicide
 *  mLGHerb = liquid and granular herbicides (tank_mix only)
 *  spray = spray application method
 *  direct = direct application method
 *  usingProdAppRate = calculations are based on product_application_rate input
 *  usingDilutionPercent = calculations are based on dilution input
 *
 *  FORMAT : {specie}_{herbicide}_{method}_{using}
 * -------------------------------------------------------------------------------
 */

import { IGeneralFields, IHerbicide, IInvasivePlant } from 'components/form/ChemicalTreatmentDetailsForm/Models';

//chooses the scenario based on the values in the form
export const performCalculation = (formData: IGeneralFields, businessCodes: any): IGeneralFields => {
  const {
    tank_mix,
    herbicides,
    tank_mix_object,
    invasive_plants,
    chemical_application_method,
    chemical_application_method_type
  } = formData;

  let calculationResults = {};

  const area = 125; //temporary

  if (tank_mix === false) {
    console.log('false tank mix');
    if (chemical_application_method_type === 'spray') {
      console.log('spray chem app method');
      //single herb single inv plant
      if (herbicides.length < 2 && invasive_plants.length < 2) {
        console.log('single herb and inv plant');
        if (herbicides[0].herbicide_type_code === 'L') {
          console.log('liquid herb');
          if (herbicides[0].calculation_type === 'PAR') {
            console.log('par calc type');
            calculationResults = sSpecie_sLHerb_spray_usingProdAppRate(
              area,
              herbicides[0].product_application_rate,
              herbicides[0].amount_of_mix,
              herbicides[0].delivery_rate_of_mix
            );
          }
          if (herbicides[0].calculation_type === 'D') {
            console.log('D calc type');
            calculationResults = sSpecie_sLHerb_spray_usingDilutionPercent(
              area,
              herbicides[0].amount_of_mix,
              herbicides[0].dilution,
              herbicides[0].area_treated_sqm
            );
          }
        }
      }
      //single herb multiple inv plants
      else if (herbicides.length < 2 && invasive_plants.length > 2) {
        console.log('single herb and >2 plants');
        if (herbicides[0].herbicide_type_code === 'L') {
          if (herbicides[0].calculation_type === 'PAR') {
            const percentages_of_treatment_on_species = [];
            invasive_plants.forEach((plant) => {
              percentages_of_treatment_on_species.push(plant.percent_area_covered);
            });

            calculationResults = mSpecie_sLHerb_spray_usingProdAppRate(
              area,
              herbicides[0].product_application_rate,
              herbicides[0].amount_of_mix,
              herbicides[0].delivery_rate_of_mix,
              percentages_of_treatment_on_species
            );
          }
        }
      } else if (herbicides.length < 2 && invasive_plants.length > 1) {
        console.log('single herb and >1 plant');
        if (herbicides[0].herbicide_type_code === 'L') {
          console.log('liquid herb');
          if (herbicides[0].calculation_type === 'D') {
            console.log('D calc type');
            const percentages_of_treatment_on_species = [];
            invasive_plants.forEach((plant) => {
              percentages_of_treatment_on_species.push(plant.percent_area_covered);
            });
            calculationResults = mSpecie_sLHerb_spray_usingDilutionPercent(
              area,
              herbicides[0].amount_of_mix,
              herbicides[0].dilution,
              herbicides[0].area_treated_sqm,
              percentages_of_treatment_on_species
            );
          }
        } else if (herbicides[0].herbicide_type_code === 'G') {
          console.log('granular herb');
          if (herbicides[0].calculation_type === 'PAR') {
            console.log('PAR calc type');
            calculationResults = sSpecie_sGHerb_spray_usingProdAppRate(
              area,
              herbicides[0].product_application_rate,
              herbicides[0].amount_of_mix,
              herbicides[0].delivery_rate_of_mix
            );
          } else if (herbicides[0].calculation_type === 'D') {
            console.log('D calc type');
            calculationResults = sSpecie_sGHerb_spray_usingDilutionPercent(
              area,
              herbicides[0].amount_of_mix,
              herbicides[0].dilution,
              herbicides[0].area_treated_sqm
            );
          }
        }
      }
    }
    if (chemical_application_method_type === 'direct') {
      console.log('direct chem app method');
      if (herbicides.length < 2 && invasive_plants.length < 2) {
        if (herbicides[0].herbicide_type_code === 'L') {
          if (herbicides[0].calculation_type === 'D') {
            calculationResults = sSpecie_sLHerb_direct_usingDilutionPercent(
              area,
              herbicides[0].amount_of_mix,
              herbicides[0].dilution,
              herbicides[0].area_treated_sqm
            );
          }
        }
      }
    }
  } else if (tank_mix === true) {
    calculationResults = mSpecie_mLGHerb_spray_usingProdAppRate(
      area,
      tank_mix_object.amount_of_mix,
      tank_mix_object.delivery_rate_of_mix,
      invasive_plants,
      tank_mix_object.herbicides
    );
  }
  return { ...calculationResults };
};

/**
 * SCENARIO 1
 * description: 1 LIQUID herbicide on 1 species - SPRAY methods using PRODUCT APPLICATION RATE
 *
 * @param { number } area (x)
 * @param { number } product_application_rate_lha (a)
 * @param { number } amount_of_mix (b)
 * @param { number } delivery_rate_of_mix (c)
 * @return { object }  containing:
 * Dilution (%),
 * Area treated (ha),
 * Area treated (sq m),
 * Percent Area Covered (%),
 * Amount of Undiluted Herbicide used (liters)
 */

export const sSpecie_sLHerb_spray_usingProdAppRate = (
  area: number,
  product_application_rate_lha: number,
  amount_of_mix: number,
  delivery_rate_of_mix: number
): Object => {
  let resultObj = {};

  if (!area || !product_application_rate_lha || !amount_of_mix || !delivery_rate_of_mix) {
    return resultObj;
  }

  const dilution: number = (product_application_rate_lha / delivery_rate_of_mix) * 100;
  const area_treated_hectares: number = amount_of_mix / delivery_rate_of_mix;
  const area_treated_sqm: number = area_treated_hectares * 10000;
  const percent_area_covered: number = (area_treated_sqm / area) * 100;
  const amount_of_undiluted_herbicide_used: number = (dilution / 100) * amount_of_mix;

  resultObj = {
    dilution: parseToRightFormat(dilution),
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    area_treated_sqm: parseToRightFormat(area_treated_sqm),
    percent_area_covered: parseToRightFormat(percent_area_covered),
    amount_of_undiluted_herbicide_used: parseToRightFormat(amount_of_undiluted_herbicide_used)
  };
  return resultObj;
};

/**
 * SCENARIO 2
 * description: 1 LIQUID herbicide on 2 or more species - SPRAY methods using PRODUCT APPLICATION RATE
 *
 * @param { number } area (x)
 * @param { number } product_application_rate_lha (a)
 * @param { number } amount_of_mix (b)
 * @param { number } delivery_rate_of_mix (c)
 * @param { number[] } percentages_of_treatment_on_species (g, h...)
 * @return { object }  containing:
 * Amountx of mixed used [],
 * Dilution (%),
 * Area treated (ha) [],
 * Area treated (sq m) [],
 * Percent Area Covered (%) [],
 * Herbicides used on species (liters) []
 */

export const mSpecie_sLHerb_spray_usingProdAppRate = (
  area: number,
  product_application_rate_lha: number,
  amount_of_mix: number,
  delivery_rate_of_mix: number,
  percentages_of_treatment_on_species: number[]
): Object => {
  let resultObj = {};

  if (
    !area ||
    !product_application_rate_lha ||
    !amount_of_mix ||
    !delivery_rate_of_mix ||
    !percentages_of_treatment_on_species ||
    percentages_of_treatment_on_species.length < 2
  ) {
    return resultObj;
  }

  let dilution: number = (product_application_rate_lha / delivery_rate_of_mix) * 100;
  let amounts_of_mix_used: number[] = [];
  let areas_treated_hectares: number[] = [];
  let areas_treated_sqm: number[] = [];
  let percentages_area_covered: number[] = [];
  let amounts_of_undiluted_herbicide_used: number[] = [];

  for (let i = 0; i < percentages_of_treatment_on_species.length; i++) {
    amounts_of_mix_used[i] = amount_of_mix * (percentages_of_treatment_on_species[i] / 100);
    areas_treated_hectares[i] = ((amount_of_mix / delivery_rate_of_mix) * percentages_of_treatment_on_species[i]) / 100;
    areas_treated_sqm[i] = areas_treated_hectares[i] * 10000;
    percentages_area_covered[i] = (areas_treated_sqm[i] / area) * 100;
    amounts_of_undiluted_herbicide_used[i] =
      (dilution / 100) * amount_of_mix * (percentages_of_treatment_on_species[i] / 100);

    percentages_area_covered[i] = parseToRightFormat(percentages_area_covered[i]);
    amounts_of_mix_used[i] = parseToRightFormat(amounts_of_mix_used[i]);
    areas_treated_hectares[i] = parseToRightFormat(areas_treated_hectares[i]);
    areas_treated_sqm[i] = parseToRightFormat(areas_treated_sqm[i]);
    amounts_of_undiluted_herbicide_used[i] = parseToRightFormat(amounts_of_undiluted_herbicide_used[i]);
  }

  dilution = parseToRightFormat(dilution);
  resultObj = {
    dilution: dilution,
    amounts_of_mix_used: amounts_of_mix_used,
    areas_treated_hectares: areas_treated_hectares,
    areas_treated_sqm: areas_treated_sqm,
    percentages_area_covered: percentages_area_covered,
    amounts_of_undiluted_herbicide_used: amounts_of_undiluted_herbicide_used
  };

  return resultObj;
};

/**
 * SCENARIO 3
 * description: Application with 1 LIQUID herbicide on 1   species - SPRAY methods using DILUTION % calculation
 *
 * @param { number } area (x)
 * @param { number } amount_of_mix (b)
 * @param { number } dilution (d)
 * @param { number } area_treated_sqm (d)
 * @return { object }  containing:
 * Area treated (ha),
 * Percent Area Covered (%),
 * Amount of Undiluted Herbicide used (liters)
 */

export const sSpecie_sLHerb_spray_usingDilutionPercent = (
  area: number,
  amount_of_mix: number,
  dilution: number,
  area_treated_sqm: number
): Object => {
  let resultObj = {};

  if (!area || !amount_of_mix || !dilution || !area_treated_sqm) {
    return resultObj;
  }

  const area_treated_hectares: number = area_treated_sqm / 10000;
  const percent_area_covered: number = (area_treated_sqm / area) * 100;
  const amount_of_undiluted_herbicide_used = (dilution / 100) * amount_of_mix;

  resultObj = {
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    percent_area_covered: parseToRightFormat(percent_area_covered),
    amount_of_undiluted_herbicide_used: parseToRightFormat(amount_of_undiluted_herbicide_used)
  };

  return resultObj;
};

/**
 * SCENARIO 4
 * description:  Application with 1 LIQUID herbicide on More than 1 species - SPRAY methods using DILUTION calculation
 *
 * @param { number } area (x)
 * @param { number } amount_of_mix (b)
 * @param { number } dilution (d)
 * @param { number } area_treated_sqm (d)
 * @param { number[] } percentages_of_treatment_on_species (g, h...)
 * @return { object }  containing:
 * Area treated (ha),
 * Area treated (sq m) [],
 * Percent Area Covered (%) [],
 * Herbicides used on species (liters) []
 */

export const mSpecie_sLHerb_spray_usingDilutionPercent = (
  area: number,
  amount_of_mix: number,
  dilution: number,
  area_treated_sqm: number,
  percentages_of_treatment_on_species: number[]
): Object => {
  let resultObj = {};

  if (
    !area ||
    !amount_of_mix ||
    !dilution ||
    !area_treated_sqm ||
    !percentages_of_treatment_on_species ||
    percentages_of_treatment_on_species.length < 2
  ) {
    return resultObj;
  }

  let area_treated_hectares: number = area_treated_sqm / 10000;
  let areas_treated_sqm: number[] = [];
  let percentages_area_covered: number[] = [];
  let amounts_of_undiluted_herbicide_used: number[] = [];

  for (let i = 0; i < percentages_of_treatment_on_species.length; i++) {
    areas_treated_sqm[i] = area_treated_sqm * (percentages_of_treatment_on_species[i] / 100);
    percentages_area_covered[i] = (areas_treated_sqm[i] / area) * 100;
    amounts_of_undiluted_herbicide_used[i] =
      (dilution / 100) * amount_of_mix * (percentages_of_treatment_on_species[i] / 100);
    areas_treated_sqm[i] = parseToRightFormat(areas_treated_sqm[i]);
    percentages_area_covered[i] = parseToRightFormat(percentages_area_covered[i]);
    amounts_of_undiluted_herbicide_used[i] = parseToRightFormat(amounts_of_undiluted_herbicide_used[i]);
  }

  resultObj = {
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    areas_treated_sqm: areas_treated_sqm,
    percentages_area_covered: percentages_area_covered,
    amounts_of_undiluted_herbicide_used: amounts_of_undiluted_herbicide_used
  };

  return resultObj;
};

/**
 * SCENARIO 5
 * description: Application with 1 GRANULAR herbicide on 1 or more species - SPRAY methods using PRODUCT APPLICATION RATE calculation
 *
 * @param { number } area (x)
 * @param { number } product_application_rate_gha (a)
 * @param { number } amount_of_mix (b)
 * @param { number } delivery_rate_of_mix (c)
 * @return { object }  containing:
 * Product Application Rate (l/ha),
 * Dilution (%),
 * Area treated (ha),
 * Area treated (sq m),
 * Percent Area Covered (%),
 * Amount of Undiluted Herbicide used (liters)
 */

export const sSpecie_sGHerb_spray_usingProdAppRate = (
  area: number,
  product_application_rate_gha: number,
  amount_of_mix: number,
  delivery_rate_of_mix: number
): Object => {
  let resultObj = {};

  if (!area || !product_application_rate_gha || !amount_of_mix || !delivery_rate_of_mix) {
    return resultObj;
  }
  const product_application_rate_lha = product_application_rate_gha / 1000;
  const dilution: number = (product_application_rate_lha / delivery_rate_of_mix) * 100;
  const area_treated_hectares: number = amount_of_mix / delivery_rate_of_mix;
  const area_treated_sqm: number = area_treated_hectares * 10000;
  const percent_area_covered: number = (area_treated_sqm / area) * 100;
  const amount_of_undiluted_herbicide_used: number = (dilution / 100) * amount_of_mix;

  resultObj = {
    product_application_rate_lha: parseToRightFormat(product_application_rate_lha),
    dilution: parseToRightFormat(dilution),
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    area_treated_sqm: parseToRightFormat(area_treated_sqm),
    percent_area_covered: parseToRightFormat(percent_area_covered),
    amount_of_undiluted_herbicide_used: parseToRightFormat(amount_of_undiluted_herbicide_used)
  };

  return resultObj;
};

/**
 * SCENARIO 6
 * description: Application with 1 GRANULAR herbicide on 1 or more species - SPRAY methods using DILUTION calculation
 *
 * @param { number } area (x)
 * @param { number } amount_of_mix (b)
 * @param { number } dilution (d)
 * @param { number } area_treated_sqm (c)
 * @param { number } delivery_rate_of_mix (not needed for calculations)
 * @return { object }  containing:
 * Area treated (ha),
 * Percent Area Covered (%),
 * Amount of Undiluted Herbicide used (liters)
 */
export const sSpecie_sGHerb_spray_usingDilutionPercent = (
  area: number,
  amount_of_mix: number,
  dilution: number,
  area_treated_sqm: number,
  delivery_rate_of_mix?: number
): Object => {
  let resultObj = {};

  if (!area || !amount_of_mix || !dilution || !area_treated_sqm) {
    return resultObj;
  }

  const area_treated_hectares = area_treated_sqm / 10000;
  const percent_area_covered = (area_treated_sqm / area) * 100;
  const amount_of_undiluted_herbicide_used = (dilution / 100) * amount_of_mix;

  resultObj = {
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    percent_area_covered: parseToRightFormat(percent_area_covered),
    amount_of_undiluted_herbicide_used: parseToRightFormat(amount_of_undiluted_herbicide_used)
  };

  return resultObj;
};

/**
 * SCENARIO 7
 * description: Application with 1 LIQUID herbicide on 1 or more species - DIRECT methods using DILUTION calculation
 *
 * @param { number } area (x)
 * @param { number } amount_of_mix (b)
 * @param { number } dilution (d)
 * @param { number } area_treated_sqm (c)
 * @param { number } delivery_rate_of_mix (not needed for calculations)
 * @return { object }  containing:
 * Area treated (ha),
 * Percent Area Covered (%),
 * Amount of Undiluted Herbicide used (liters)
 */

export const sSpecie_sLHerb_direct_usingDilutionPercent = (
  area: number,
  amount_of_mix: number,
  dilution: number,
  area_treated_sqm: number,
  delivery_rate_of_mix?: number
): Object => {
  let resultObj = {};

  if (!area || !amount_of_mix || !dilution || !area_treated_sqm) {
    return resultObj;
  }

  const area_treated_hectares = area_treated_sqm / 10000;
  const percent_area_covered = (area_treated_sqm / area) * 100;
  const amount_of_undiluted_herbicide_used = (dilution / 100) * amount_of_mix;

  resultObj = {
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    percent_area_covered: parseToRightFormat(percent_area_covered),
    amount_of_undiluted_herbicide_used: parseToRightFormat(amount_of_undiluted_herbicide_used)
  };

  return resultObj;
};

/**
 * SCENARIO 8-10 (11)
 * description: 2 or more herbicides on 1 or more species - SPRAY methods AKA TANK MIX using PRODUCT APPLICATION RATE
 *
 * @param { number } area (x)
 * @param { number } amount_of_mix (b)
 * @param { number } delivery_rate_of_mix (b)
 * @param { ISpecie[] } species
 * @return { ISpecie[] } species
 */

export const mSpecie_mLGHerb_spray_usingProdAppRate = (
  area: number,
  amount_of_mix: number,
  delivery_rate_of_mix: number,
  species: IInvasivePlant[],
  herbicides: IHerbicide[]
) => {
  let resultObj = {};

  if (!area || !amount_of_mix || !delivery_rate_of_mix || !species || species.length < 1) {
    return resultObj;
  }

  let outputInvPlantsArr = [];

  species.forEach((specie, plant_index) => {
    let outputSpecie: any = {};

    outputSpecie.amount_of_mix_used = amount_of_mix * (specie.percent_area_covered / 100);
    outputSpecie.area_treated_ha = (amount_of_mix / delivery_rate_of_mix) * (specie.percent_area_covered / 100);
    outputSpecie.area_treated_sqm = outputSpecie.area_treated_ha * 10000;
    outputSpecie.percent_area_covered = (outputSpecie.area_treated_sqm / area) * 100;

    outputSpecie.herbicides = [];

    herbicides.forEach((herb, index) => {
      let outputHerb: any = {};

      outputHerb.dilution = (herbicides[index].product_application_rate / delivery_rate_of_mix) * 100;
      outputHerb.amount_of_undiluted_herbicide_used =
        ((outputHerb.dilution / 100) * amount_of_mix * specie.percent_area_covered) / 100;

      outputHerb.dilution = parseToRightFormat(outputHerb.dilution);
      outputHerb.amount_of_undiluted_herbicide_used = parseToRightFormat(outputHerb.amount_of_undiluted_herbicide_used);

      outputSpecie.herbicides.push(outputHerb);
    });

    outputSpecie.amount_of_mix_used = parseToRightFormat(outputSpecie.amount_of_mix_used);
    outputSpecie.area_treated_ha = parseToRightFormat(outputSpecie.area_treated_ha);
    outputSpecie.area_treated_sqm = parseToRightFormat(outputSpecie.area_treated_sqm);
    outputSpecie.percent_area_covered = parseToRightFormat(outputSpecie.percent_area_covered);

    outputInvPlantsArr.push(outputSpecie);
  });

  return { invasive_plants: [...outputInvPlantsArr] };
};

/**
 * ------------------------Helper Functions-----------------------------------
 */
export const parseToRightFormat = (value: number) => {
  return Number(value.toFixed(4));
};
