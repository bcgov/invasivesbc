import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/*
  Function to validate that treated_area field is not larger than the area field that autofills after you draw geometry
*/
export function getTreatedAreaValidator(): rjsfValidator {
  return ((
    formData: InvasivesFormData & {
      activity_data: { reported_area: number };
      activity_subtype_data: {
        Treatment_MechanicalPlant_Information?: { treated_area: number }[];
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        Treatment_MechanicalPlant_Information: { treated_area: number }[];
      };
    }>
  ): FormValidation => {
    if (
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.Treatment_MechanicalPlant_Information ||
      !formData.activity_data.reported_area ||
      formData.activity_subtype_data.Treatment_MechanicalPlant_Information.length < 1
    ) {
      return errors as FormValidation;
    }

    const reported_area = formData.activity_data.reported_area;

    formData.activity_subtype_data.Treatment_MechanicalPlant_Information.forEach((invPlant, index) => {
      if (invPlant.treated_area && invPlant.treated_area > reported_area) {
        errors.activity_subtype_data?.Treatment_MechanicalPlant_Information?.[index]?.treated_area?.addError(
          "Can't be bigger than reported area"
        );
      }
    });

    return errors as FormValidation;
  }) as unknown as rjsfValidator;
}
