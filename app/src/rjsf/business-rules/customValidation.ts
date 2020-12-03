import { FormValidation } from '@rjsf/core';

let areaLimit = Number.POSITIVE_INFINITY;

// keep track of all business rules for custom form validation logic
export function customValidation(activitySubtype: string) {
  if (activitySubtype === 'Activity_Observation_PlantTerrestial') {
    areaLimit = 10000;
  }

  return validate;
}

export function validate(formData: any, errors: FormValidation) : FormValidation {
  if (formData.activity_data['reported_area'] > areaLimit) { 
    errors.activity_data['reported_area'].addError("Area is too large for given activity type.");
  }

  return errors;
}
