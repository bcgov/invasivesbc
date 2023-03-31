import { RowValidationResult } from './validation';

export const ValidateHerbicides = (rowData) => {
  let x: any;
  return x;
  // validate_herbicides
};

export const ValidateTankMixHerbicides = (rowData) => {
  let x: any;
  return x;
  // validate_tank_mix_herbicides
};

export const ValidateTankMixFields = (rowData) => {
  let x: any;
  return x;
  // validate_tank_mix_fields
};

export const ValidateChemAppMethod = (rowData) => {
  let x: any;
  return x;
  //validate_chem_app_method
};

export const ValidateHerbicidesArray = (rowData) => {
  let x: any;
  return x;
  //validate_herbicides_arr_length
};

export const ValidateInvasivePlantsFields = (rowData) => {
  let x: any;
  return x;
  //validate_inv_plants_fields
};

export const ValidateInvasivePlantsArray = (rowData) => {
  let x: any;
  return x;
  //validate_inv_plants_arr_length
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
