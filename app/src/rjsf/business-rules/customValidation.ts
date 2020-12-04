import { FormValidation } from "@rjsf/core";

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
    if (activitySubtype === "Activity_Observation_PlantTerrestial") {
      areaLimit = 10000;
    }

    // validate reported area limit
    errors.activity_data["reported_area"].__errors = [];
    if (formData.activity_data["reported_area"] > areaLimit) {
      errors.activity_data["reported_area"].addError(
        `Area cannot exceed ${areaLimit} m\u00B2`
      );
    }

    return errors;
  };
};
