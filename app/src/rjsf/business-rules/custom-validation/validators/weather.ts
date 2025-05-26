import { FormValidation } from '@rjsf/utils';
import { MAX_TEMP, MIN_TEMP } from 'sharedAPI';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/*
  Function to validate temperature field on the chemical treatment form
*/
function getTemperatureValidator(activitySubtype: string): rjsfValidator {
  return (
    formData: InvasivesFormData & {
      activity_subtype_data: {
        Treatment_ChemicalPlant_Information?: {
          temperature: number;
        };
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        Treatment_ChemicalPlant_Information: {
          temperature: number;
        };
      };
    }>
  ): FormValidation => {
    if (activitySubtype !== 'Activity_Treatment_ChemicalPlantTerrestrial') {
      return errors as FormValidation;
    }

    const temperature = formData.activity_subtype_data.Treatment_ChemicalPlant_Information?.temperature;

    if (temperature === undefined) {
      return errors as FormValidation;
    }

    if (errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.temperature) {
      errors.activity_subtype_data.Treatment_ChemicalPlant_Information.temperature.__errors = [];
    }

    //if the temperature is out of normal range, display an error
    if (temperature < MIN_TEMP || temperature > MAX_TEMP) {
      errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.temperature?.addError(
        `Temperature should ideally be between ${MIN_TEMP} and ${MAX_TEMP} degrees`
      );
    }
    //if the user clicked proceed in the warning dialog, remove the error
    if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes('temperature')) {
      errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.temperature?.__errors?.pop();
      return errors as FormValidation;
    }
    return errors as FormValidation;
  };
}

/*
  Function to validate wind fields on chemical treatment forms

  If no wind, there should be no wind direction
  If wind, there must be a wind direction
*/
function getWindValidator(activitySubtype: string): rjsfValidator {
  return (
    formData: InvasivesFormData & {
      activity_subtype_data: {
        Treatment_ChemicalPlant_Information?: {
          wind_speed: number;
          wind_direction_code: string;
        };
        Treatment_MechanicalPlant_Information?: {
          wind_speed: number;
        };
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        Treatment_ChemicalPlant_Information: {
          wind_speed: number;
          wind_direction_code: string;
        };
      };
    }>
  ): FormValidation => {
    if (
      !['Activity_Treatment_ChemicalPlantTerrestrial', 'Activity_Treatment_ChemicalPlantAquatic'].includes(
        activitySubtype
      )
    ) {
      return errors as FormValidation;
    }

    // validate wind speed with the wind direction
    if (errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.wind_direction_code) {
      errors.activity_subtype_data.Treatment_ChemicalPlant_Information.wind_direction_code.__errors = [];
    }
    const wind_speed = formData.activity_subtype_data?.Treatment_ChemicalPlant_Information?.wind_speed;
    const wind_direction_code =
      formData.activity_subtype_data?.Treatment_ChemicalPlant_Information?.wind_direction_code;

    if (wind_speed !== undefined && wind_direction_code !== undefined) {
      if (wind_speed > 0 && wind_direction_code === 'No Wind') {
        errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.wind_direction_code?.addError(
          'Must specify a wind direction when wind speed is > 0'
        );
      }

      if (wind_speed === 0 && wind_direction_code !== 'No Wind') {
        errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.wind_direction_code?.addError(
          'Cannot specify a wind direction when wind speed is 0'
        );
      }

      //if the user clicked proceed in the warning dialog, remove the error
      if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes('wind_speed')) {
        errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.wind_speed?.__errors?.pop();
        return errors as FormValidation;
      }
    }
    return errors as FormValidation;
  };
}

function getWindValidatorBiocontrol(activitySubtype: string): rjsfValidator {
  return (
    formData: InvasivesFormData & {
      activity_subtype_data: {
        Weather_Conditions?: {
          wind_speed: number;
          wind_direction_code: string;
        };
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        Weather_Conditions: {
          wind_speed: number;
          wind_direction_code: string;
        };
      };
    }>
  ): FormValidation => {
    if (
      ![
        'Activity_Biocontrol_Release',
        'Activity_Biocontrol_Collection',
        'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant',
        'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'
      ].includes(activitySubtype)
    ) {
      return errors as FormValidation;
    }

    // validate wind speed with the wind direction

    if (errors.activity_subtype_data?.Weather_Conditions?.wind_direction_code) {
      errors.activity_subtype_data['Weather_Conditions']['wind_direction_code'].__errors = [];
    }
    const wind_speed = formData.activity_subtype_data.Weather_Conditions?.wind_speed;
    const wind_direction_code = formData.activity_subtype_data.Weather_Conditions?.wind_direction_code;

    if (wind_speed !== undefined && wind_direction_code !== undefined) {
      if (wind_speed > 0 && wind_direction_code === 'No Wind') {
        errors.activity_subtype_data?.Weather_Conditions?.wind_direction_code?.addError(
          'Must specify a wind direction when wind speed is > 0'
        );
      }

      if (wind_speed === 0 && wind_direction_code !== 'No Wind') {
        errors.activity_subtype_data?.Weather_Conditions?.wind_direction_code?.addError(
          'Cannot specify a wind direction when wind speed is 0'
        );
      }

      //if the user clicked proceed in the warning dialog, remove the error
      if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes('wind_speed')) {
        errors.activity_subtype_data?.Weather_Conditions?.wind_direction_code?.__errors?.pop();
        return errors as FormValidation;
      }
    }
    return errors as FormValidation;
  };
}

export { getWindValidator, getWindValidatorBiocontrol, getTemperatureValidator };
