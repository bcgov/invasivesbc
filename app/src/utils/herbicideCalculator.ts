export const isWeedPoison = (input: string) => {
  if (String.length > 10) {
    return true;
  }
  return false;
};

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

export const parseToRightFormat = (value: number, decimal_places: number) => {
  return Number(value.toFixed(decimal_places));
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
    dilution: parseToRightFormat(dilution, 1),
    area_treated_hectares: parseToRightFormat(area_treated_hectares, 4),
    area_treated_sqm: parseToRightFormat(area_treated_sqm, 0),
    percent_area_covered: parseToRightFormat(percent_area_covered, 1),
    amount_of_undiluted_herbicide_used: parseToRightFormat(amount_of_undiluted_herbicide_used, 3)
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

    percentages_area_covered[i] = parseToRightFormat(percentages_area_covered[i], 1);
    amounts_of_mix_used[i] = parseToRightFormat(amounts_of_mix_used[i], 2);
    areas_treated_hectares[i] = parseToRightFormat(areas_treated_hectares[i], 4);
    areas_treated_sqm[i] = parseToRightFormat(areas_treated_sqm[i], 2);
    amounts_of_undiluted_herbicide_used[i] = parseToRightFormat(amounts_of_undiluted_herbicide_used[i], 4);
  }

  dilution = parseToRightFormat(dilution, 1);
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
    area_treated_hectares: parseToRightFormat(area_treated_hectares, 4),
    percent_area_covered: parseToRightFormat(percent_area_covered, 1),
    amount_of_undiluted_herbicide_used: parseToRightFormat(amount_of_undiluted_herbicide_used, 1)
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
    areas_treated_sqm[i] = parseToRightFormat(areas_treated_sqm[i], 2);
    percentages_area_covered[i] = parseToRightFormat(percentages_area_covered[i], 1);
    amounts_of_undiluted_herbicide_used[i] = parseToRightFormat(amounts_of_undiluted_herbicide_used[i], 3);
  }

  resultObj = {
    area_treated_hectares: parseToRightFormat(area_treated_hectares, 4),
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
    product_application_rate_lha: parseToRightFormat(product_application_rate_lha, 2),
    dilution: parseToRightFormat(dilution, 2),
    area_treated_hectares: parseToRightFormat(area_treated_hectares, 4),
    area_treated_sqm: parseToRightFormat(area_treated_sqm, 0),
    percent_area_covered: parseToRightFormat(percent_area_covered, 1),
    amount_of_undiluted_herbicide_used: parseToRightFormat(amount_of_undiluted_herbicide_used, 5)
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
    area_treated_hectares: parseToRightFormat(area_treated_hectares, 2),
    percent_area_covered: parseToRightFormat(percent_area_covered, 1),
    amount_of_undiluted_herbicide_used: parseToRightFormat(amount_of_undiluted_herbicide_used, 6)
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
    area_treated_hectares: parseToRightFormat(area_treated_hectares, 3),
    percent_area_covered: parseToRightFormat(percent_area_covered, 1),
    amount_of_undiluted_herbicide_used: parseToRightFormat(amount_of_undiluted_herbicide_used, 1)
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

export interface IHerbicide {
  product_application_rate_lha: number;
  dilution: number;
  amount_of_undiluted_herbicide_used: number;
}
export interface ISpecie {
  herbicides: IHerbicide[];
  area_of_specie: number;
  area_treated_ha: number;
  area_treated_sqm: number;
  percent_area_covered: number;
  amount_of_mix_used: number;
}

export const mSpecie_mLGHerb_spray_usingProdAppRate = (
  area: number,
  amount_of_mix: number,
  delivery_rate_of_mix: number,
  species: ISpecie[]
) => {
  let resultObj = {};

  if (!area || !amount_of_mix || !delivery_rate_of_mix || !species || species.length < 1) {
    return resultObj;
  }

  const newSpecies = species.map((specie) => {
    if (!specie.herbicides || specie.herbicides.length < 2) {
      return {};
    }
    const newSpecie = { ...specie };
    newSpecie.amount_of_mix_used = amount_of_mix * (specie.area_of_specie / 100);
    newSpecie.area_treated_ha = (amount_of_mix / delivery_rate_of_mix) * (specie.area_of_specie / 100);
    newSpecie.area_treated_sqm = newSpecie.area_treated_ha * 10000;
    newSpecie.percent_area_covered = (newSpecie.area_treated_sqm / area) * 100;

    const newHerbArr: any[] = newSpecie.herbicides.map((herb) => {
      if (!herb.product_application_rate_lha) {
        return {};
      }
      const newHerbicide = { ...herb };
      newHerbicide.dilution = (herb.product_application_rate_lha / delivery_rate_of_mix) * 100;
      newHerbicide.amount_of_undiluted_herbicide_used =
        ((newHerbicide.dilution / 100) * amount_of_mix * specie.area_of_specie) / 100;

      newHerbicide.dilution = parseToRightFormat(newHerbicide.dilution, 1);
      newHerbicide.amount_of_undiluted_herbicide_used = parseToRightFormat(
        newHerbicide.amount_of_undiluted_herbicide_used,
        4
      );

      return newHerbicide;
    });

    newSpecie.herbicides = [...newHerbArr];
    newSpecie.amount_of_mix_used = parseToRightFormat(newSpecie.amount_of_mix_used, 2);
    newSpecie.area_treated_ha = parseToRightFormat(newSpecie.area_treated_ha, 4);
    newSpecie.area_treated_sqm = parseToRightFormat(newSpecie.area_treated_sqm, 2);
    newSpecie.percent_area_covered = parseToRightFormat(newSpecie.percent_area_covered, 1);
    return newSpecie;
  });

  return newSpecies;
};

/**
 * ------------------------Helper Functions-----------------------------------
 */
