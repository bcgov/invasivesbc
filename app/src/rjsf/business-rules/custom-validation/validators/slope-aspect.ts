import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/*
  Function to validate that in case 'slope' field has 'flat' option
  selected, 'aspect' field option has to be 'flat' as well (and vice versa)
*/
function getSlopeAspectBothFlatValidator(): rjsfValidator {
  return (
    formData: InvasivesFormData & {
      activity_subtype_data: {
        Observation_PlantTerrestrial_Information?: {
          slope_code: string;
          aspect_code: string;
        };
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        Observation_PlantTerrestrial_Information: {
          slope_code: string;
          aspect_code: string;
        };
      };
    }>
  ): FormValidation => {
    if (
      !formData?.activity_subtype_data.Observation_PlantTerrestrial_Information?.slope_code ||
      !formData?.activity_subtype_data.Observation_PlantTerrestrial_Information?.aspect_code
    ) {
      return errors as FormValidation;
    }
    const { slope_code, aspect_code } = formData.activity_subtype_data.Observation_PlantTerrestrial_Information;

    const onlyOneOfSuppliedCodesAreFlat = [aspect_code, slope_code].filter((val) => val === 'FL').length === 1;

    const MUTUALLY_FLAT = 'If either Aspect or Slope is flat, both of them must be flat.';

    if (onlyOneOfSuppliedCodesAreFlat) {
      const shortHand = errors.activity_subtype_data?.Observation_PlantTerrestrial_Information;
      shortHand?.aspect_code?.addError(MUTUALLY_FLAT);
      shortHand?.slope_code?.addError(MUTUALLY_FLAT);
    }
    return errors as FormValidation;
  };
}

export { getSlopeAspectBothFlatValidator };
