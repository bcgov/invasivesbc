import { HerbicideApplicationRates } from './herbicideApplicationRates';
import { IGeneralFields } from '../src/herbicideCalculator';

export const runValidation = (
  area: number,
  formData: IGeneralFields,
  errors: any[],
  businessCodes: any,
  herbicideDictionary: any,
  skipAppRateValidation: boolean
) => {
  let newErrors = errors;

  if (!area) {
    newErrors.push('No area provided');
  }

  newErrors = validate_inv_plants_arr_length(formData, errors);
  newErrors = validate_inv_plants_fields(formData, errors);
  newErrors = validate_herbicides_arr_length(formData, errors);
  newErrors = validate_general_fields(formData, errors);
  newErrors = validate_chem_app_method_value(formData, errors, businessCodes);
  newErrors = validate_herbicide_fields(
    area,
    formData,
    errors,
    businessCodes,
    herbicideDictionary,
    skipAppRateValidation
  );
  newErrors = validate_tank_mix_fields(area, formData, errors);
  newErrors = validate_tank_mix_herbicides(formData, errors, businessCodes, herbicideDictionary, skipAppRateValidation);

  return newErrors;
};

/**
 * Validates that Invasive Plants array is not empty
 */
export const validate_inv_plants_arr_length = (formData: IGeneralFields, errors: any[]) => {
  if (!formData || !formData.invasive_plants) {
    return errors;
  }
  let newErrors = errors;

  if (formData.invasive_plants.length < 1) {
    newErrors.push('You must have at least one Invasive Plant added');
  }
  return newErrors;
};

/**
 * Validates fields inside Invasive Plant object
 */
export const validate_inv_plants_fields = (formData: IGeneralFields, errors: any) => {
  if (!formData || !formData.invasive_plants || formData.invasive_plants.length < 1) {
    return errors;
  }
  const newErrors = errors;

  let noPlantName: boolean = false;
  let noPercentage: boolean = false;
  let negativePercentage: boolean = false;
  let totalPercentage: number = 0;

  let plantCodeList = [];

  for (let invPlantIndex = 0; invPlantIndex < formData.invasive_plants.length; invPlantIndex++) {
    if (!formData.invasive_plants[invPlantIndex].invasive_plant_code) {
      noPlantName = true;
    } else {
      plantCodeList.push(formData.invasive_plants[invPlantIndex].invasive_plant_code);
    }
    if (formData.invasive_plants.length > 1) {
      if (!formData.invasive_plants[invPlantIndex].percent_area_covered) {
        noPercentage = true;
      } else {
        if (formData.invasive_plants[invPlantIndex].percent_area_covered < 0) {
          negativePercentage = true;
        }
        totalPercentage += formData.invasive_plants[invPlantIndex].percent_area_covered;
      }
    }
  }

  if (new Set(plantCodeList).size !== plantCodeList.length) {
    newErrors.push(
      `There are duplicated invasive plant species identified.
        Please remove or fix duplicated species.`
    );
  }

  if (negativePercentage) {
    newErrors.push('At least 1 of your invasive plants has negative value for percent of area covered');
  }
  if (noPlantName) {
    newErrors.push("At least 1 of your invasive plants doesn't have a name");
  }
  if (noPercentage) {
    newErrors.push("At least 1 of your invasive plants doesn't have a percent of area covered");
  }
  if (formData.invasive_plants.length > 1 && totalPercentage !== 100) {
    newErrors.push('Total percent of area covered for invasive plants should be equal to 100');
  }
  return newErrors;
};

/**
 * Validates that Herbicides array is not empty
 */
export const validate_herbicides_arr_length = (formData: IGeneralFields, errors: any) => {
  if (!formData || !formData.herbicides || formData.tank_mix === true) {
    return errors;
  }
  const newErrors = errors;
  if (formData.herbicides.length < 1) {
    newErrors.push('You must have at least one Herbicide added');
  }
  if (formData.herbicides.length > 1) {
    newErrors.push('You can have a maximum of 1 herbicide per record, unless you are using tank mix');
  }
  return newErrors;
};

/**
 * Validates that general fields are not undefined/null
 */
export const validate_general_fields = (formData: IGeneralFields, errors: any) => {
  if (!formData) {
    return errors;
  }
  const newErrors = errors;

  if (formData.tank_mix === null || formData.tank_mix === undefined) {
    newErrors.push('You have to choose if you are using tank mix or not');
  }

  if (!formData.chemical_application_method) {
    newErrors.push('You have to choose chemical application method');
  }

  return newErrors;
};

/**
 * Validates that chemical application method has the right value based on the tank mix value
 */
export const validate_chem_app_method_value = (formData: IGeneralFields, errors: any, businessCodes: any) => {
  if (!formData || !formData.chemical_application_method || !formData.tank_mix) {
    return errors;
  }
  const newErrors = errors;

  const direct_method_values = businessCodes['chemical_method_direct'].map((item) => item.value);

  if (formData.tank_mix === true && direct_method_values.includes(formData.chemical_application_method)) {
    newErrors.push('You must choose one of the spray chemical application methods when you are using a tank mix');
  }

  return newErrors;
};

/**
 * Validates that all herbicide object fields are not undefined and not negative (for numbers)
 */
export const validate_herbicide_fields = (
  area: number,
  formData: IGeneralFields,
  errors: any,
  businessCodes: any,
  herbicideDictionary: any,
  skipAppRateValidation: boolean
) => {
  if (!formData || !formData.herbicides || formData.herbicides.length < 1 || formData.tank_mix === true) {
    return errors;
  }

  const newErrors = errors;

  let noHerbCode = false;
  let noHerbTypeCode = false;

  let noAmountOfMix = false;
  let negativeAmountOfMix = false;

  let noCalculationType = false;

  let noDilution = false;
  let negativeDilution = false;

  let noAreaTreatedSqm = false;
  let negativeAreaTreatedSqm = false;
  let areaLargerThanTreatmentArea = false;

  let noProdAppRate = false;
  let negativeProdAppRate = false;

  let noDeliveryRate = false;
  let negativeDeliveryRate = false;

  let herbCodeList = [];

  formData.herbicides.forEach((herb) => {
    if (!herb.herbicide_code) {
      noHerbCode = true;
    } else {
      herbCodeList.push(herb.herbicide_code);
    }
    if (!herb.herbicide_type_code) {
      noHerbTypeCode = true;
    }
    if (!herb.amount_of_mix) {
      noAmountOfMix = true;
    }
    if (herb.amount_of_mix < 0) {
      negativeAmountOfMix = true;
    }

    if (!herb.product_application_rate || !herb.herbicide_code || skipAppRateValidation) {
    } else if (
      herb.calculation_type === 'PAR' &&
      herb.product_application_rate &&
      herb.product_application_rate > HerbicideApplicationRates[herb.herbicide_code.toString()]
    ) {
      errors.push(
        `Application rate of ${
          herbicideDictionary[Number(herb.herbicide_code)]
        } herbicide exceeds maximum applicable rate of ${
          HerbicideApplicationRates[herb.herbicide_code]
        } L/ha for this herbicide`
      );
    }
    if (!herb.calculation_type) {
      noCalculationType = true;
    } else {
      if (herb.calculation_type === 'D') {
        if (!herb.dilution) {
          noDilution = true;
        }
        if (herb.dilution < 0) {
          negativeDilution = true;
        }
        if (!herb.area_treated_sqm) {
          noAreaTreatedSqm = true;
        } else if (herb.area_treated_sqm > area) {
          areaLargerThanTreatmentArea = true;
        }
        if (herb.area_treated_sqm < 0) {
          negativeAreaTreatedSqm = true;
        }
      } else if (herb.calculation_type === 'PAR') {
        if (!herb.delivery_rate_of_mix) {
          noDeliveryRate = true;
        }
        if (herb.delivery_rate_of_mix < 0) {
          negativeDeliveryRate = true;
        }
        if (!herb.product_application_rate) {
          noProdAppRate = true;
        }
        if (herb.product_application_rate < 0) {
          negativeProdAppRate = true;
        }
      }
    }
  });

  if (new Set(herbCodeList).size !== herbCodeList.length) {
    newErrors.push(
      `There are duplicated herbicides identified.
        Please remove or fix duplicated herbicides.`
    );
  }

  if (areaLargerThanTreatmentArea) {
    newErrors.push('Ar least 1 of your herbicides area treated is larger than the area of entire treatment');
  }
  if (noHerbCode) {
    newErrors.push("At least 1 of your herbicides doesn't have a herbicide name");
  }
  if (noHerbTypeCode) {
    newErrors.push("At least 1 of your herbicides doesn't have a herbicide type");
  }
  if (noAmountOfMix) {
    newErrors.push("At least 1 of your herbicides doesn't have an amount of mix");
  }
  if (negativeAmountOfMix) {
    newErrors.push('At least 1 of your herbicides has negative value for the amount of mix');
  }
  if (noCalculationType) {
    newErrors.push("At least 1 of your herbicides doesn't have a calculation type");
  }
  if (noDilution) {
    newErrors.push(
      'At least 1 of your herbicides has dilution calculation type specified, but has no value for dilution'
    );
  }
  if (negativeDilution) {
    newErrors.push('At least 1 of your herbicides has negative value for the dilution');
  }
  if (noAreaTreatedSqm) {
    newErrors.push(
      'At least 1 of your herbicides has dilution calculation type specified, but has no value for area treated'
    );
  }
  if (negativeAreaTreatedSqm) {
    newErrors.push('At least 1 of your herbicides has negative value for the area treated');
  }
  if (noDeliveryRate) {
    newErrors.push(
      'At least 1 of your herbicides has product application rate calculation type specified, but has no value for delivery rate'
    );
  }
  if (negativeDeliveryRate) {
    newErrors.push('At least 1 of your herbicides has negative value for the delivery rate');
  }
  if (noProdAppRate) {
    newErrors.push(
      'At least 1 of your herbicides has product application rate calculation type specified, but has no value for product application rate'
    );
  }
  if (negativeProdAppRate) {
    newErrors.push('At least 1 of your herbicides has negative value for the product application rate');
  }

  return newErrors;
};

/**
 * Validates that all tank mix fields are not undefined and not negative(for numbers)
 */
export const validate_tank_mix_fields = (area: number, formData: IGeneralFields, errors: any) => {
  if (!formData || !formData.tank_mix || !formData.tank_mix_object) {
    return errors;
  }
  const newErrors = errors;

  if (!formData.tank_mix_object.calculation_type) {
    newErrors.push('There is no value provided for calculation type in your tank mix');
  }
  if (!formData.tank_mix_object.amount_of_mix) {
    newErrors.push('There is no value provided for amount of mix in your tank mix');
  }
  if (formData.tank_mix_object.amount_of_mix < 0) {
    newErrors.push('There is a negative value provided for amount of mix in your tank mix');
  }
  if (formData.tank_mix_object.area_treated_sqm < 0) {
    newErrors.push('There is a negative value provided for area treated in your tank mix');
  }
  if (!formData.tank_mix_object.delivery_rate_of_mix) {
    newErrors.push('There is no value provided for delivery rate in your tank mix');
  }
  if (formData.tank_mix_object.delivery_rate_of_mix < 0) {
    newErrors.push('There is a negative value provided for delivery rate in your tank mix');
  }
  if (formData.tank_mix_object.herbicides.length < 2) {
    newErrors.push('There must be 2 or more herbicides selected for your tank mix');
  }

  return newErrors;
};

/**
 * Validates that herbicides array inside tank mix has right values specified
 */
export const validate_tank_mix_herbicides = (
  formData: IGeneralFields,
  errors: any,
  businessCodes: any,
  herbicideDictionary: any,
  skipAppRateValidation: boolean
) => {
  if (
    !formData ||
    !formData.tank_mix ||
    !formData.tank_mix_object ||
    !formData.tank_mix_object.herbicides ||
    formData.tank_mix_object.herbicides.length < 2
  ) {
    return errors;
  }
  const newErrors = errors;

  let noHerbCode = false;
  let noHerbTypeCode = false;

  let noProdAppRate = false;
  let negativeProdAppRate = false;

  let herbCodeList = [];

  formData.tank_mix_object.herbicides.forEach((herb) => {
    if (!herb.product_application_rate || !herb.herbicide_code || skipAppRateValidation) {
    } else if (
      herb.calculation_type === 'PAR' &&
      herb.product_application_rate &&
      herb.product_application_rate > HerbicideApplicationRates[herb.herbicide_code.toString()]
    ) {
      errors.push(
        `Application rate of ${
          herbicideDictionary[Number(herb.herbicide_code)]
        } herbicide exceeds maximum applicable rate of ${
          HerbicideApplicationRates[herb.herbicide_code]
        } L/ha for this herbicide`
      );
    }

    if (!herb.herbicide_code) {
      noHerbCode = true;
    } else {
      herbCodeList.push(herb.herbicide_code);
    }
    if (!herb.herbicide_type_code) {
      noHerbTypeCode = true;
    }
    if (!herb.product_application_rate) {
      noProdAppRate = true;
    }
    if (herb.product_application_rate < 0) {
      negativeProdAppRate = true;
    }
  });

  if (new Set(herbCodeList).size !== herbCodeList.length) {
    newErrors.push(
      `There are duplicated herbicides identified.
        Please remove or fix duplicated herbicides.`
    );
  }

  if (noHerbCode) {
    newErrors.push("At least 1 of your herbicides doesn't have a herbicide name");
  }
  if (noHerbTypeCode) {
    newErrors.push("At least 1 of your herbicides doesn't have a herbicide type");
  }
  if (noProdAppRate) {
    newErrors.push('At least 1 of your herbicides has no value for product application rate');
  }
  if (negativeProdAppRate) {
    newErrors.push('At least 1 of your herbicides has negative value for the product application rate');
  }

  return newErrors;
};
