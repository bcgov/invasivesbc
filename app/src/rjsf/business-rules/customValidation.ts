import { FormValidation } from '@rjsf/core';
import { HerbicideApplicationRates } from 'rjsf/business-rules/constants/herbicideApplicationRates';

type rjsfValidator = (formData: any, errors: FormValidation) => FormValidation;

// keep track of all business rules for custom form validation logic
export function getCustomValidator(validators: rjsfValidator[]): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    for (const validator of validators) {
      errors = validator(formData, errors);
    }

    return errors;
  };
}

export function getAreaValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    let areaLimit = Number.POSITIVE_INFINITY;
    const tenThousandAreaLimitSubtypes = [
      'Activity_Treatment_MechanicalPlant',
      'Activity_Observation_PlantTerrestrial',
      'Activity_Treatment_ChemicalPlant'
    ];

    if (tenThousandAreaLimitSubtypes.includes(activitySubtype)) {
      areaLimit = 50000;
    }

    // validate reported area limit
    errors.activity_data['reported_area'].__errors = [];
    if (formData.activity_data['reported_area'] > areaLimit) {
      errors.activity_data['reported_area'].addError(`Area cannot exceed ${areaLimit} m\u00B2`);
    }

    return errors;
  };
}

export function getWindValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (activitySubtype !== 'Activity_Treatment_ChemicalPlant') {
      return errors;
    }

    // validate wind speed with wind direction
    errors.activity_subtype_data['wind_direction_code'].__errors = [];
    const { wind_speed, wind_direction_code } = formData.activity_subtype_data;

    if (wind_speed > 0 && wind_direction_code === 'No Wind') {
      errors.activity_subtype_data['wind_direction_code'].addError(
        'Must specify a wind direction when wind speed is > 0'
      );
    }

    if (wind_speed === 0 && wind_direction_code !== 'No Wind') {
      errors.activity_subtype_data['wind_direction_code'].addError(
        'Cannot specify a wind direction when wind speed is 0'
      );
    }

    return errors;
  };
}

export function getHerbicideApplicationRateValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.herbicide ||
      !formData.activity_subtype_data.herbicide.length
    ) {
      return errors;
    }

    const herbicides = formData.activity_subtype_data.herbicide;

    herbicides.forEach((herbicide: any, index: number) => {
      // validate herbicide application rate maximums
      errors.activity_subtype_data['herbicide'][index]['application_rate'].__errors = [];

      if (
        herbicide.application_rate &&
        herbicide.application_rate > HerbicideApplicationRates[herbicide.liquid_herbicide_code]
      ) {
        errors.activity_subtype_data['herbicide'][index]['application_rate'].addError(
          `Application rate exceeds maximum applicable rate of ${
            HerbicideApplicationRates[herbicide.liquid_herbicide_code]
          } L/ha for this herbicide`
        );
      }
    });

    return errors;
  };
}
