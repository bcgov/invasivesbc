import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

type FormDataWithAccessDescription = InvasivesFormData & {
  activity_data: {
    access_description: string;
  };
};

function IsFormDataWithAccessDescription(formData: InvasivesFormData): formData is FormDataWithAccessDescription {
  return formData.activity_data.access_description !== undefined;
}

// Validate access description length
function accessDescriptionMinChars(): rjsfValidator {
  return (
    formData: InvasivesFormData,
    errors: FormValidation<{
      activity_data: { access_description: string };
    }>
  ): FormValidation => {
    if (!IsFormDataWithAccessDescription(formData)) {
      return errors as FormValidation;
    }

    if (formData.activity_data.access_description.length < 5) {
      if (errors.activity_data?.access_description) {
        errors.activity_data.access_description.addError(
          'If there is an access description it must be 5 or more characters long.'
        );
      }
    }

    return errors as FormValidation;
  };
}

export { accessDescriptionMinChars };
