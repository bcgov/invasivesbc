import { FormValidation } from '@rjsf/core';

let areaLimit = 0;

// keep track of all business rules for custom form validation logic
export function customValidation(activitySubtype: string) {
  if (activitySubtype === 'Activity_Observation_PlantTerrestial') {
    areaLimit = 10000;
  } else {
    areaLimit = Number.POSITIVE_INFINITY;
  }

  return validate;
}

function validate(formData: any, errors: FormValidation) : FormValidation {
  // validate reported area limit
  errors.activity_data['reported_area'].__errors = [];
  if (formData.activity_data['reported_area'] > areaLimit) { 
    errors.activity_data['reported_area'].addError("Area is too large for given activity type");
  }

  return errors;
}
