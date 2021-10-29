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

  const dilution: number = (product_application_rate_lha / amount_of_mix) * 100;
  const area_treated_hectares: number = amount_of_mix / delivery_rate_of_mix;
  const area_treated_sqm: number = area_treated_hectares * 10000;
  const percent_area_covered: number = area_treated_sqm / area;
  const amount_of_undiluted_herbicide_used: number = (dilution / 100) * amount_of_mix;

  resultObj = {
    dilution: dilution,
    area_treated_hectares: area_treated_hectares,
    area_treated_sqm: area_treated_sqm,
    percent_area_covered: percent_area_covered,
    amount_of_undiluted_herbicide_used: amount_of_undiluted_herbicide_used
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

  const dilution = (product_application_rate_lha / amount_of_mix) * 100;

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
  }

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
    area_treated_hectares: area_treated_hectares,
    percent_area_covered: percent_area_covered,
    amount_of_undiluted_herbicide_used: amount_of_undiluted_herbicide_used
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

  let areas_treated_hectares: number = area_treated_sqm / 10000;
  let areas_treated_sqm: number[] = [];
  let percentages_area_covered: number[] = [];
  let amounts_of_undiluted_herbicide_used: number[] = [];

  for (let i = 0; i < percentages_of_treatment_on_species.length; i++) {
    areas_treated_sqm[i] = areas_treated_hectares[i] * (percentages_of_treatment_on_species[i] / 100);
    percentages_area_covered[i] = (areas_treated_sqm[i] / area) * 100;
    amounts_of_undiluted_herbicide_used[i] =
      (dilution / 100) * amount_of_mix * (percentages_of_treatment_on_species[i] / 100);
  }

  resultObj = {
    areas_treated_hectares: areas_treated_hectares,
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
  const dilution: number = (product_application_rate_lha / amount_of_mix) * 100;
  const area_treated_hectares: number = amount_of_mix / delivery_rate_of_mix;
  const area_treated_sqm: number = area_treated_hectares * 10000;
  const percent_area_covered: number = area_treated_sqm / area;
  const amount_of_undiluted_herbicide_used: number = (dilution / 100) * amount_of_mix;

  resultObj = {
    product_application_rate_lha: product_application_rate_lha,
    dilution: dilution,
    area_treated_hectares: area_treated_hectares,
    area_treated_sqm: area_treated_sqm,
    percent_area_covered: percent_area_covered,
    amount_of_undiluted_herbicide_used: amount_of_undiluted_herbicide_used
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
 * Amount of Undiluted Herbicide used (liters) ============+TODOOOOOOOO
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
    area_treated_hectares: area_treated_hectares,
    percent_area_covered: percent_area_covered,
    amount_of_undiluted_herbicide_used: amount_of_undiluted_herbicide_used
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
    area_treated_hectares: area_treated_hectares,
    percent_area_covered: percent_area_covered,
    amount_of_undiluted_herbicide_used: amount_of_undiluted_herbicide_used
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
 * @param { number[] } areas_of_species
 * @param { number[] } product_application_rates_lha
 * @return { object }  containing:
 * Area treated (ha),
 * Percent Area Covered (%),
 * Amount of Undiluted Herbicide used (liters)
 */

export const mSpecie_mLGHerb_spray_usingProdAppRate = (
  area: number,
  amount_of_mix: number,
  delivery_rate_of_mix: number,
  areas_of_species: number[],
  product_application_rates_lha: number[]
) => {
  let resultObj = {};

  if (
    !area ||
    !amount_of_mix ||
    !delivery_rate_of_mix ||
    !areas_of_species ||
    !product_application_rates_lha ||
    areas_of_species.length < 1 ||
    product_application_rates_lha.length < 2
  ) {
    return resultObj;
  }
};
