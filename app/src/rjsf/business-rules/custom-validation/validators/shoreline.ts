import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/*
  Function to validate that the total percent value of all shoreline types combined = 100
*/
function getShorelineTypesPercentValidator(): rjsfValidator {
  return (
    formData: InvasivesFormData & {
      activity_subtype_data: { ShorelineTypes?: { percent_covered: number; shoreline_type_code: string }[] };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        ShorelineTypes: { percent_covered: number; shoreline_type_code: string }[];
      };
    }>
  ): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.ShorelineTypes ||
      formData.activity_subtype_data.ShorelineTypes.length < 1
    ) {
      return errors as FormValidation;
    }

    const { ShorelineTypes } = formData.activity_subtype_data;

    let totalPercent = 0;

    ShorelineTypes.forEach((shoreline_type) => {
      totalPercent += shoreline_type.percent_covered;
    });

    if (errors.activity_subtype_data?.ShorelineTypes) {
      errors.activity_subtype_data.ShorelineTypes.__errors = [];
    }
    if (totalPercent !== 100) {
      errors.activity_subtype_data?.ShorelineTypes?.addError(
        'Total percentage of area covered by shoreline types must be equal 100%'
      );
    }

    return errors as FormValidation;
  };
}

export { getShorelineTypesPercentValidator };
