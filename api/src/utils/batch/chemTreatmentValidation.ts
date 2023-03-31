import { validate_herbicide_fields } from 'sharedAPI';
import { RowValidationResult } from './validation';


//temp param cheat cheat 
/*
newErrors = validate_inv_plants_arr_length(formData, errors);
newErrors = validate_inv_plants_fields(formData, errors);
newErrors = validate_herbicides_arr_length(formData, errors);
newErrors = validate_general_fields(formData, errors);
newErrors = validate_chem_app_method_value(formData, errors, businessCodes);
newErrors = validate_herbicide_fields(
newErrors = validate_tank_mix_fields(area, formData, errors);
newErrors = validate_tank_mix_herbicides(formData, errors, businessCodes, herbicideDictionary, skipAppRateValidation);
*/

export const ValidateHerbicides = (rowData) => {
  const appliesToFields = [];
  let validationMessages = [];
  let valid = true;

  try {
    //area: number, formData: IGeneralFields, errors: any, businessCodes: any, herbicideDictionary: any, skipAppRateValidation: boolean
    //const result = validate_herbicide_fields()
  } catch (e) {
    console.log(e);
    valid = false;
  }

  return { validationMessages: validationMessages, appliesToFields: appliesToFields, valid: valid };

  // validate_herbicides
};

export const ValidateTankMixHerbicides = (rowData) => {
  const appliesToFields = [];
  let validationMessages = [];
  let valid = true;

  try {
    //const result = validate_tank_mix_herbicides()
  } catch (e) {
    console.log(e);
    valid = false;
  }

  return { validationMessages: validationMessages, appliesToFields: appliesToFields, valid: valid };

};

export const ValidateTankMixFields = (rowData) => {
    const appliesToFields = [];
    let validationMessages = [];
    let valid = true;
  
    try {
      //const result = validate_tank_mix_fields()
    } catch (e) {
      console.log(e);
      valid = false;
    }
  
    return { validationMessages: validationMessages, appliesToFields: appliesToFields, valid: valid };
  
  // 
};

export const ValidateChemAppMethod = (rowData) => {
    const appliesToFields = [];
    let validationMessages = [];
    let valid = true;
  
    try {
      //const result = validate_chem_app_method()
    } catch (e) {
      console.log(e);
      valid = false;
    }
  
    return { validationMessages: validationMessages, appliesToFields: appliesToFields, valid: valid };
  
  //
};

export const ValidateHerbicidesArray = (rowData) => {
    const appliesToFields = [];
    let validationMessages = [];
    let valid = true;
  
    try {
      //const result = validate_herbicides_arr_length()
    } catch (e) {
      console.log(e);
      valid = false;
    }
  
    return { validationMessages: validationMessages, appliesToFields: appliesToFields, valid: valid };
  
  //
};

export const ValidateInvasivePlantsFields = (rowData) => {
    const appliesToFields = [];
    let validationMessages = [];
    let valid = true;
  
    try {
      //const result = validate_inv_plants_fields()
    } catch (e) {
      console.log(e);
      valid = false;
    }
  
    return { validationMessages: validationMessages, appliesToFields: appliesToFields, valid: valid };
  
  //
};

export const ValidateInvasivePlantsArray = (rowData) => {
    const appliesToFields = [];
    let validationMessages = [];
    let valid = true;
  
    try {
      //const result = validate_inv_plants_arr_length()
    } catch (e) {
      console.log(e);
      valid = false;
    }
  
    return { validationMessages: validationMessages, appliesToFields: appliesToFields, valid: valid };
  
  //
};

export const ChemTreatmentValidators = [
  ValidateHerbicides,
  ValidateTankMixHerbicides,
  ValidateTankMixFields,
  ValidateChemAppMethod,
  ValidateHerbicidesArray,
  ValidateInvasivePlantsFields,
  ValidateInvasivePlantsArray
];
