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


//chooses the scenario based on the values in the form
export const performCalculation = (area: number, formData: IGeneralFields, businessCodes: any): IGeneralFields => {
  const { tank_mix, herbicides, tank_mix_object, invasive_plants, chemical_application_method_type } = formData;

  let calculationResults = {};

  if (tank_mix === false) {
    if (chemical_application_method_type === 'spray') {
      //single herb single inv plant
      if (herbicides.length < 2 && invasive_plants.length < 2) {
        const percentages_of_treatment_on_species = [];
        invasive_plants.forEach((plant) => {
          if (invasive_plants.length < 2) {
            percentages_of_treatment_on_species.push(100);
          } else {
            percentages_of_treatment_on_species.push(plant.percent_area_covered);
          }
        });
        if (herbicides[0].herbicide_type_code === 'L') {
          if (herbicides[0].calculation_type === 'PAR') {
            calculationResults = sSpecie_sLHerb_spray_usingProdAppRate(
              area,
              herbicides[0].product_application_rate,
              herbicides[0].amount_of_mix,
              herbicides[0].delivery_rate_of_mix
            );
          }
          if (herbicides[0].calculation_type === 'D') {
            calculationResults = sSpecie_sLHerb_spray_usingDilutionPercent(
              area,
              herbicides[0].amount_of_mix,
              herbicides[0].dilution,
              herbicides[0].area_treated_sqm
            );
          }
        } else if (herbicides[0].herbicide_type_code === 'G') {
          if (herbicides[0].calculation_type === 'PAR') {
            calculationResults = mSpecie_sGHerb_spray_usingProdAppRate(
              area,
              herbicides[0].product_application_rate,
              herbicides[0].amount_of_mix,
              herbicides[0].delivery_rate_of_mix,
              percentages_of_treatment_on_species
            );
          } else if (herbicides[0].calculation_type === 'D') {
            calculationResults = mSpecie_sGHerb_spray_usingDilutionPercent(
              area,
              herbicides[0].amount_of_mix,
              herbicides[0].dilution,
              herbicides[0].area_treated_sqm,
              percentages_of_treatment_on_species
            );
          }
        }
      }
      //single herb multiple (>2) inv plants
      else if (herbicides.length < 2 && invasive_plants.length > 1) {
        const percentages_of_treatment_on_species = [];
        invasive_plants.forEach((plant) => {
          percentages_of_treatment_on_species.push(plant.percent_area_covered);
        });
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
          } else if (herbicides[0].calculation_type === 'D') {
            calculationResults = mSpecie_sLHerb_spray_usingDilutionPercent(
              area,
              herbicides[0].amount_of_mix,
              herbicides[0].dilution,
              herbicides[0].area_treated_sqm,
              percentages_of_treatment_on_species
            );
          }
        } else if (herbicides[0].herbicide_type_code === 'G') {
          if (herbicides[0].calculation_type === 'PAR') {
            calculationResults = mSpecie_sGHerb_spray_usingProdAppRate(
              area,
              herbicides[0].product_application_rate,
              herbicides[0].amount_of_mix,
              herbicides[0].delivery_rate_of_mix,
              percentages_of_treatment_on_species
            );
          } else if (herbicides[0].calculation_type === 'D') {
            calculationResults = mSpecie_sGHerb_spray_usingDilutionPercent(
              area,
              herbicides[0].amount_of_mix,
              herbicides[0].dilution,
              herbicides[0].area_treated_sqm,
              percentages_of_treatment_on_species
            );
          }
        }
      }
    }
    if (chemical_application_method_type === 'direct') {
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
  const amount_of_undiluted_herbicide_used_liters: number = (dilution / 100) * amount_of_mix;

  resultObj = {
    dilution: parseToRightFormat(dilution),
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    area_treated_sqm: parseToRightFormat(area_treated_sqm),
    percent_area_covered: parseToRightFormat(percent_area_covered),
    amount_of_undiluted_herbicide_used_liters: parseToRightFormat(amount_of_undiluted_herbicide_used_liters)
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

  let dilution: number = (product_application_rate_lha / 1000 / delivery_rate_of_mix) * 100;

  let species: any[] = [];

  for (let i = 0; i < percentages_of_treatment_on_species.length; i++) {
    species[i] = {};
    species[i].amount_of_mix_used = amount_of_mix * (percentages_of_treatment_on_species[i] / 100);
    species[i].index = i;
    species[i].area_treated_hectares =
      ((amount_of_mix / delivery_rate_of_mix) * percentages_of_treatment_on_species[i]) / 100;
    species[i].area_treated_sqm = species[i].area_treated_hectares * 10000;
    species[i].percentage_area_covered = (species[i].area_treated_sqm / area) * 100;
    species[i].amount_of_undiluted_herbicide_used_liters =
      (dilution / 100) * amount_of_mix * (percentages_of_treatment_on_species[i] / 100);

    species[i].percentage_area_covered = parseToRightFormat(species[i].percentage_area_covered);
    species[i].amount_of_mix_used = parseToRightFormat(species[i].amount_of_mix_used);
    species[i].area_treated_hectares = parseToRightFormat(species[i].area_treated_hectares);
    species[i].area_treated_sqm = parseToRightFormat(species[i].area_treated_sqm);
    species[i].amount_of_undiluted_herbicide_used_liters = parseToRightFormat(
      species[i].amount_of_undiluted_herbicide_used_liters
    );
  }

  dilution = parseToRightFormat(dilution);
  resultObj = {
    dilution: dilution,
    invasive_plants: species
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
  const amount_of_undiluted_herbicide_used_liters = (dilution / 100) * amount_of_mix;

  resultObj = {
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    percent_area_covered: parseToRightFormat(percent_area_covered),
    amount_of_undiluted_herbicide_used_liters: parseToRightFormat(amount_of_undiluted_herbicide_used_liters)
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

  let species: any[] = [];

  for (let i = 0; i < percentages_of_treatment_on_species.length; i++) {
    species[i] = {};
    species[i].index = i;
    species[i].area_treated_sqm = area_treated_sqm * (percentages_of_treatment_on_species[i] / 100);
    species[i].percentage_area_covered = (species[i].area_treated_sqm / area) * 100;
    species[i].amount_of_undiluted_herbicide_used_liters =
      (dilution / 100) * amount_of_mix * (percentages_of_treatment_on_species[i] / 100);

    species[i].area_treated_sqm = parseToRightFormat(species[i].area_treated_sqm);
    species[i].percentage_area_covered = parseToRightFormat(species[i].percentage_area_covered);
    species[i].amount_of_undiluted_herbicide_used_liters = parseToRightFormat(
      species[i].amount_of_undiluted_herbicide_used_liters
    );
  }

  resultObj = {
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    invasive_plants: species
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
 * @param { number[] } percentages_of_treatment_on_species (g, h...)
 * @return { object }  containing:
 * Product Application Rate (l/ha),
 * Dilution (%),
 * Area treated (ha),
 * Area treated (sq m),
 * Percent Area Covered (%),
 * Amount of Undiluted Herbicide used (liters)
 */

export const mSpecie_sGHerb_spray_usingProdAppRate = (
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
    percentages_of_treatment_on_species.length < 1
  ) {
    return resultObj;
  }

  let dilution: number = (product_application_rate_lha / 1000 / delivery_rate_of_mix) * 100;

  let species: any[] = [];

  for (let i = 0; i < percentages_of_treatment_on_species.length; i++) {
    species[i] = {};
    species[i].amount_of_mix_used = amount_of_mix * (percentages_of_treatment_on_species[i] / 100);
    species[i].index = i;
    species[i].area_treated_hectares =
      ((amount_of_mix / delivery_rate_of_mix) * percentages_of_treatment_on_species[i]) / 100;
    species[i].area_treated_sqm = species[i].area_treated_hectares * 10000;
    species[i].percentage_area_covered = (species[i].area_treated_sqm / area) * 100;
    species[i].amount_of_undiluted_herbicide_used_liters =
      (dilution / 100) * amount_of_mix * (percentages_of_treatment_on_species[i] / 100);

    species[i].percentage_area_covered = parseToRightFormat(species[i].percentage_area_covered);
    species[i].amount_of_mix_used = parseToRightFormat(species[i].amount_of_mix_used);
    species[i].area_treated_hectares = parseToRightFormat(species[i].area_treated_hectares);
    species[i].area_treated_sqm = parseToRightFormat(species[i].area_treated_sqm);
    species[i].amount_of_undiluted_herbicide_used_liters = parseToRightFormat(
      species[i].amount_of_undiluted_herbicide_used_liters
    );
  }

  dilution = parseToRightFormat(dilution);

  resultObj = {
    dilution: dilution,
    invasive_plants: species
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
export const mSpecie_sGHerb_spray_usingDilutionPercent = (
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
    percentages_of_treatment_on_species.length < 1
  ) {
    return resultObj;
  }

  let area_treated_hectares: number = area_treated_sqm / 10000;

  let species: any[] = [];

  for (let i = 0; i < percentages_of_treatment_on_species.length; i++) {
    species[i] = {};
    species[i].index = i;
    species[i].area_treated_sqm = area_treated_sqm * (percentages_of_treatment_on_species[i] / 100);
    species[i].percentage_area_covered = (species[i].area_treated_sqm / area) * 100;
    species[i].amount_of_undiluted_herbicide_used_liters =
      (dilution / 100) * amount_of_mix * (percentages_of_treatment_on_species[i] / 100);

    species[i].area_treated_sqm = parseToRightFormat(species[i].area_treated_sqm);
    species[i].percentage_area_covered = parseToRightFormat(species[i].percentage_area_covered);
    species[i].amount_of_undiluted_herbicide_used_liters = parseToRightFormat(
      species[i].amount_of_undiluted_herbicide_used_liters
    );
  }

  resultObj = {
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    invasive_plants: species
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
  const amount_of_undiluted_herbicide_used_liters = (dilution / 100) * amount_of_mix;

  resultObj = {
    area_treated_hectares: parseToRightFormat(area_treated_hectares),
    percent_area_covered: parseToRightFormat(percent_area_covered),
    amount_of_undiluted_herbicide_used_liters: parseToRightFormat(amount_of_undiluted_herbicide_used_liters)
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
  species?: IInvasivePlant[],
  herbicides?: IHerbicide[]
) => {
  let resultObj = {};

  if (!area || !amount_of_mix || !delivery_rate_of_mix || !species || species.length < 1) {
    return resultObj;
  }

  let outputInvPlantsArr = [];

  species.forEach((specie, plant_index) => {
    let outputSpecie: any = {};

    let percent_area_covered = specie.percent_area_covered ? specie.percent_area_covered : 100;

    outputSpecie.index = plant_index;
    outputSpecie.amount_of_mix_used = amount_of_mix * (percent_area_covered / 100);
    outputSpecie.area_treated_ha = (amount_of_mix / delivery_rate_of_mix) * (percent_area_covered / 100);
    outputSpecie.area_treated_sqm = outputSpecie.area_treated_ha * 10000;
    outputSpecie.percent_area_covered = (outputSpecie.area_treated_sqm / area) * 100;

    outputSpecie.herbicides = [];

    herbicides.forEach((herb, index) => {
      let outputHerb: any = {};

      outputHerb.plantIndex = plant_index;
      outputHerb.herbIndex = index;
      outputHerb.dilution = (herbicides[index].product_application_rate / 1000 / delivery_rate_of_mix) * 100;
      outputHerb.amount_of_undiluted_herbicide_used_liters =
        ((outputHerb.dilution / 100) * amount_of_mix * percent_area_covered) / 100;

      outputHerb.dilution = parseToRightFormat(outputHerb.dilution);
      outputHerb.amount_of_undiluted_herbicide_used_liters = parseToRightFormat(
        outputHerb.amount_of_undiluted_herbicide_used_liters
      );
      outputHerb.product_application_rate = herbicides[index].product_application_rate;

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
export interface IGeneralFields {
  application_start_time?: Date;
  invasive_plants?: IInvasivePlant[];
  tank_mix?: boolean;
  chemical_application_method?: string;
  chemical_application_method_type?: string;
  herbicides?: IHerbicide[];
  tank_mix_object?: ITankMix;
  skipAppRateValidation?: boolean;
}

export interface IInvasivePlant {
  invasive_plant_code: string | null;
  percent_area_covered?: number;
  index: number;
}

export interface ITankMix {
  calculation_type?: string;
  herbicides?: IHerbicide[];
  amount_of_mix?: number;
  delivery_rate_of_mix?: number;
  area_treated_sqm?: number;
}

export interface IHerbicide {
  herbicide_type_code?: string;
  herbicide_code?: string;
  application_rate?: number; //only if in tank
  calculation_type?: string; //only if NOT in tank
  amount_of_mix?: number;
  dilution?: number;
  area_treated_sqm?: number;
  delivery_rate_of_mix?: number;
  product_application_rate?: number;
  index: number;
}
