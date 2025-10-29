import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/**
 * @desc The Chemical Treatment Form component has its own validation checks that ensure the data in their forms are correct, therein they set
 *       the `errors` key for that activity subtype. This validator checks the condition of that boolean and applies it to the whole form, syncing the validators.
 *       Doing this ensures that the errors are enforced and the form cannot be submitted.
 */
function chemicalTreatmentFormIsValid(): rjsfValidator {
  return (formData: InvasivesFormData, errors: FormValidation): FormValidation => {
    const chemicalTreatmentDetails = formData.activity_subtype_data?.chemical_treatment_details;
    if ((chemicalTreatmentDetails as Record<PropertyKey, unknown>)?.errors) {
      errors?.addError('Chemical Treatment Form contains errors');
    }
    return errors;
  };
}
export { chemicalTreatmentFormIsValid };
