import { FormValidation } from '@rjsf/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

type rjsfValidator = (formData: InvasivesFormData, errors: FormValidation) => FormValidation;

function combineValidators(validators: rjsfValidator[]): rjsfValidator {
  return (formData: InvasivesFormData, errors: FormValidation): FormValidation => {
    for (const validator of validators) {
      errors = validator(formData, errors);
    }

    //dispatch({ type: ACTIVITY_ERRORS , payload: { source: 'custom validators', errors: errors?.__errors}})
    return errors;
  };
}

export type { rjsfValidator };
export { combineValidators };
