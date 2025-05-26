import { FieldErrors, FieldValidation, FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

type FormDataWithChemicalTreatment = InvasivesFormData & {
  activity_subtype_data: {
    chemical_treatment_details: FieldErrors;
  };
};

function IsFormDataWithChemicalTreatment(formData: InvasivesFormData): formData is FormDataWithChemicalTreatment {
  return formData.activity_subtype_data.chemical_treatment_details !== undefined;
}

/*
  function to transfer error state from chemical details form to main rjsf form
 */
function transferErrorsFromChemDetails(): rjsfValidator {
  return (
    formData: InvasivesFormData,
    errors: FormValidation<{
      activity_subtype_data: {
        chemical_treatment_details: FieldErrors;
      };
    }>
  ): FormValidation => {
    if (!IsFormDataWithChemicalTreatment(formData)) {
      return errors as FormValidation;
    }

    if (formData.activity_subtype_data.chemical_treatment_details.__errors) {
      errors.activity_subtype_data?.addError('Chemical Treatment details form has errors');
    } else {
      errors.activity_subtype_data?.__errors?.pop();
    }
    return errors as FormValidation;
  };
}

export { transferErrorsFromChemDetails };
