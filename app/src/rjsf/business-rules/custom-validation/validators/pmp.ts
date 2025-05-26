import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

function getPestManagementPlanValidator(): rjsfValidator {
  return (
    formData: InvasivesFormData & {
      activity_subtype_data: {
        Treatment_ChemicalPlant_Information?: { pest_management_plan: string; pmp_not_in_dropdown: string };
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        Treatment_ChemicalPlant_Information: { pest_management_plan: string; pmp_not_in_dropdown: string };
      };
    }>
  ): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.Treatment_ChemicalPlant_Information
    ) {
      return errors as FormValidation;
    }
    const EXCLUSIVE_SELECTION = 'Either Pest Management Plan or Unlisted Drop Down field has to be filled.';

    const { pest_management_plan, pmp_not_in_dropdown } =
      formData.activity_subtype_data.Treatment_ChemicalPlant_Information;

    if (!pest_management_plan && !pmp_not_in_dropdown) {
      errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.pest_management_plan?.addError(
        EXCLUSIVE_SELECTION
      );
      errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.pmp_not_in_dropdown?.addError(
        EXCLUSIVE_SELECTION
      );
    }

    if (pest_management_plan && pmp_not_in_dropdown) {
      errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.pest_management_plan?.addError(
        'You must only fill either Pest Management Plan or Unlisted Drop Down field.'
      );
      errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.pmp_not_in_dropdown?.addError(
        'You must only fill either Pest Management Plan or Unlisted Drop Down field.'
      );
    }

    return errors as FormValidation;
  };
}

export { getPestManagementPlanValidator };
