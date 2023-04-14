import {
  validate_chem_app_method_value,
  validate_general_fields,
  validate_herbicide_fields,
  validate_herbicides_arr_length,
  validate_inv_plants_arr_length,
  validate_inv_plants_fields,
  validate_tank_mix_fields,
  validate_tank_mix_herbicides
} from 'sharedAPI';
import { BatchCellValidationMessage, RowValidationResult } from './validation';
import { getLogger } from '../../logger';

const defaultLog = getLogger('batch');

export const ValidateHerbicides = (row) => {
  const appliesToFields = [
    'Herbicide - 1 - PAR - Production Application Rate',
    'Herbicide - 2 - PAR - Production Application Rate',
    'Herbicide - 1 - PAR - Delivery Rate of Mix',
    'Herbicide - 2 - PAR - Delivery Rate of Mix',
    'Herbicide - Amount of Mix Used',
    'Herbicide - 1 - Calculation Type',
    'Herbicide - 2 - Calculation Type',
    'Herbicide - 1 - Area Treated (Dilution)',
    'Herbicide - 2 - Area Treated (Dilution)',
    'Herbicide - 1 - Dilution - Dilution %',
    'Herbicide - 2 - Dilution - Dilution %'
  ];

  const area = row?.mappedObject?.form_data?.activity_data.reported_area;
  const formData = mapFormDataToLegacy(row?.mappedObject?.payload.form_data);
  const validationFunctionArgs = [area, formData, []];

  return runLegacyValidation(
    validate_herbicide_fields,
    validationFunctionArgs,
    appliesToFields,
    'Herbicides Validation'
  );
};

export const ValidateGeneralFields = (row) => {
  const appliesToFields = [
    'Chemical Treatment - Herbicide 1',
    'Chemical Treatment - Herbicide 2',
    'Chemical Treatment - Herbicide 3',
    'Chemical Treatment - Invasive Species 1',
    'Chemical Treatment - Invasive Species 2',
    'Chemical Treatment - Invasive Species 3',
    'Chemical Treatment - Tank Mix'
  ];

  const formData = mapFormDataToLegacy(row?.mappedObject?.payload.form_data);
  const validationFunctionArgs = [formData, []];

  return runLegacyValidation(
    validate_general_fields,
    validationFunctionArgs,
    appliesToFields,
    'General Fields Validation'
  );
};

export const ValidateTankMixHerbicides = (row) => {
  const appliesToFields = [
    'Herbicide - Tank Mix?',
    'Herbicide - 1 - Type',
    'Herbicide - 2 - Type',
    'Herbicide - 1 - Herbicide',
    'Herbicide - 2 - Herbicide',
    'Herbicide - 1 - Calculation Type',
    'Herbicide - 2 - Calculation Type',
    'Herbicide - 1 - PAR - Production Application Rate',
    'Herbicide - 2 - PAR - Production Application Rate'
  ];

  const formData = mapFormDataToLegacy(row?.mappedObject?.payload.form_data);

  //doesn't actually use it, but it's required
  const businessCodes = {};

  const herbicideDictionary = {};
  row.data['Herbicide - 1 - Herbicide'].templateColumn.codes.map(
    (codeObj) => (herbicideDictionary[codeObj.code] = codeObj.description)
  );

  const skipAppRateValidation = false;
  const validationFunctionArgs = [formData, [], businessCodes, herbicideDictionary, skipAppRateValidation];

  return runLegacyValidation(
    validate_tank_mix_herbicides,
    validationFunctionArgs,
    appliesToFields,
    'Tank Mix Herbicides Validation'
  );
};

export const ValidateTankMixFields = (row) => {
  const appliesToFields = [
    'Herbicide - Tank Mix?',
    'Herbicide - 1 - Calculation Type',
    'Herbicide - 2 - Calculation Type',
    'Herbicide - Amount of Mix Used',
    'Herbicide - 1 - Area Treated (Dilution)',
    'Herbicide - 1 - PAR - Delivery Rate of Mix',
    'Herbicide - 1 - Herbicide',
    'Herbicide - 2 - Herbicide',
    'Herbicide - 1 - Type',
    'Herbicide - 2 - Type'
  ];
  const area = row?.mappedObject?.form_data?.activity_data?.reported_area || NaN;
  const formData = mapFormDataToLegacy(row?.mappedObject?.payload.form_data);
  const validationFunctionArgs = [area, formData, []];

  return runLegacyValidation(
    validate_tank_mix_fields,
    validationFunctionArgs,
    appliesToFields,
    'Tank Mix Fields Validation'
  );
};

export const ValidateChemAppMethod = (row) => {
  const appliesToFields = ['Chemical Treatment - Application Method', 'Herbicide - Tank Mix?'];
  const formData = mapFormDataToLegacy(row?.mappedObject?.payload.form_data);
  const validationFunctionArgs = [formData, [], {}];

  return runLegacyValidation(
    validate_chem_app_method_value,
    validationFunctionArgs,
    appliesToFields,
    'Chem App Method Validation'
  );
};

export const ValidateHerbicidesArray = (row) => {
  const appliesToFields = [
    'Chemical Treatment - Herbicide 1',
    'Chemical Treatment - Herbicide 2',
    'Herbicide - 1 - Herbicide',
    'Herbicide - 2 - Herbicide',
    'Herbicide - 1 - Type',
    'Herbicide - 2 - Type',
    'Herbicide - Tank Mix?'
  ];

  const formData = mapFormDataToLegacy(row?.mappedObject?.payload.form_data);
  const validationFunctionArgs = [formData, []];

  return runLegacyValidation(
    validate_herbicides_arr_length,
    validationFunctionArgs,
    appliesToFields,
    'Herbicides Array Validation'
  );
};

export const ValidateInvasivePlantsFields = (row) => {
  const appliesToFields = [
    'Chemical Treatment - Invasive Species 1',
    'Chemical Treatment - Invasive Species 2',
    'Chemical Treatment - Invasive Species 3',
    'Chemical Treatment - Invasive Species 1 %',
    'Chemical Treatment - Invasive Species 2 %',
    'Chemical Treatment - Invasive Species 3 %'
  ];

  const formData = mapFormDataToLegacy(row?.mappedObject?.payload.form_data);
  const validationFunctionArgs = [formData, []];

  return runLegacyValidation(
    validate_inv_plants_fields,
    validationFunctionArgs,
    appliesToFields,
    'Invasive Plants Fields Validation'
  );
};

export const ValidateInvasivePlantsArray = (row) => {
  const appliesToFields = [
    'Chemical Treatment - Invasive Species 1',
    'Chemical Treatment - Invasive Species 2',
    'Chemical Treatment - Invasive Species 3'
  ];

  const formData = mapFormDataToLegacy(row?.mappedObject?.payload.form_data);
  const validationFunctionArgs = [formData, []];

  return runLegacyValidation(
    validate_inv_plants_arr_length,
    validationFunctionArgs,
    appliesToFields,
    'Invasive Plants Array Validation'
  );
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

const mapErrorsToValidationMessages = (errors, appliesToFields, messageTitle) => {
  const validationMessages = [];
  errors.map((e) => {
    validationMessages.push({
      severity: 'error',
      messageTitle: messageTitle,
      messageDetail: typeof e === 'object' ? JSON.stringify(e) : e
    });
  });
  return validationMessages;
};

const runLegacyValidation = (
  validationFunction,
  validationFunctionArgs,
  appliesToFields: string[],
  errorMessageTitle: string
) => {
  const validationMessages: BatchCellValidationMessage[] = [];
  let valid = true;

  defaultLog.debug({ message: 'running legacy validation' });

  try {
    const errors = validationFunction(...validationFunctionArgs);
    const newValidationMessages = mapErrorsToValidationMessages(errors, appliesToFields, errorMessageTitle);
    validationMessages.push(...newValidationMessages);
    valid = newValidationMessages.length == 0;
  } catch (e) {
    defaultLog.error({ message: 'caught an error while running legacy validation', error: e });
    const newValidationMessages = mapErrorsToValidationMessages([e], appliesToFields, errorMessageTitle);
    validationMessages.push(...newValidationMessages);
    valid = newValidationMessages.length == 0;
  }

  defaultLog.debug({
    message: 'legacy validation result',
    result: {
      validationMessages,
      appliesToFields,
      valid
    }
  });

  return {
    validationMessages: validationMessages,
    appliesToFields: appliesToFields,
    valid: valid
  } as RowValidationResult;
};
const mapFormDataToLegacy = (formData) => {
  let mappedData = {};
  try {
    mappedData = {
      application_start_time: formData.activity_subtype_data.Treatment_ChemicalPlant_Information.application_start_time,
      invasive_plants: formData.activity_subtype_data.chemical_treatment_details.invasive_plants,
      tank_mix: formData.activity_subtype_data.chemical_treatment_details.tank_mix,
      chemical_application_method:
        formData.activity_subtype_data.chemical_treatment_details.chemical_application_method,
      chemical_application_method_type:
        formData.activity_subtype_data.chemical_treatment_details.chemical_application_method_type,
      herbicides: formData.activity_subtype_data.chemical_treatment_details.herbicides,
      tank_mix_object: formData.activity_subtype_data.chemical_treatment_details.tank_mix_object,
      skipAppRateValidation: formData.activity_subtype_data.chemical_treatment_details.skipAppRateValidation
    };
  } catch (e) {
    defaultLog.error({ message: 'I am the problem', error: e });
  }
  return mappedData;
};
