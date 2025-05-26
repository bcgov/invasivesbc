import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/*
  Function to validate that the total percent value of all jurisdictions combined = 100
*/
function getJurisdictionPercentValidator(): rjsfValidator {
  return (
    formData: InvasivesFormData,
    errors: FormValidation<{
      activity_data: {
        jurisdictions: unknown;
      };
    }>
  ): FormValidation => {
    if (!formData || !formData.activity_data || !formData.activity_data.jurisdictions) {
      return errors as FormValidation;
    }
    const { jurisdictions } = formData.activity_data;
    let totalPercent = 0;

    jurisdictions.forEach((jurisdiction) => {
      totalPercent += jurisdiction.percent_covered;
    });

    if (errors.activity_data?.jurisdictions?.__errors) {
      errors.activity_data.jurisdictions.__errors = [];
    }

    if (totalPercent !== 100) {
      errors.activity_data?.jurisdictions?.addError(
        'Total percentage of area covered by jurisdictions must equal 100%'
      );
      errors.addError('Total percentage of area covered by jurisdictions must equal 100%');
    }

    const jurCodes: string[] = [];

    formData.activity_data.jurisdictions.forEach((jurCode) => {
      if (jurCodes.includes(jurCode.jurisdiction_code)) {
        errors.activity_data?.jurisdictions?.addError('You cannot have two of the same jurisdiction.');
        errors.addError('You cannot have two of the same jurisdiction.');
      } else {
        jurCodes.push(jurCode.jurisdiction_code);
      }
    });

    return errors as FormValidation;
  };
}

export { getJurisdictionPercentValidator };
