import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/*
  Function to validate that:
  users should not be able to create both a positive and negative observation of the same species
  users should not be able to make two observations of the same species within a record.
*/
function getPosAndNegObservationValidator(): rjsfValidator {
  return ((
    formData: InvasivesFormData & {
      activity_subtype_data: {
        TerrestrialPlants?: { invasive_plant_code: string }[];
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        TerrestrialPlants: { invasive_plant_code: string }[];
      };
    }>
  ): FormValidation => {
    if (
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.TerrestrialPlants ||
      formData.activity_subtype_data.TerrestrialPlants.length < 1
    ) {
      return errors as FormValidation;
    }

    const invPlantCodes: string[] = [];

    formData.activity_subtype_data.TerrestrialPlants.forEach((invPlant) => {
      if (invPlantCodes.includes(invPlant.invasive_plant_code)) {
        errors.activity_subtype_data?.TerrestrialPlants?.addError(
          "You can't make two observations of the same species within a record."
        );
      } else {
        invPlantCodes.push(invPlant.invasive_plant_code);
      }
    });

    return errors as FormValidation;
  }) as unknown as rjsfValidator;
}

function getPosAndNegObservationValidatorAquatic(): rjsfValidator {
  return ((
    formData: InvasivesFormData & {
      activity_subtype_data: {
        AquaticPlants?: { invasive_plant_code: string }[];
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        AquaticPlants: { invasive_plant_code: string }[];
      };
    }>
  ): FormValidation => {
    if (
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.AquaticPlants ||
      formData.activity_subtype_data.AquaticPlants.length < 1
    ) {
      return errors as FormValidation;
    }

    const invPlantCodes: string[] = [];

    formData.activity_subtype_data.AquaticPlants.forEach((invPlant) => {
      if (invPlantCodes.includes(invPlant.invasive_plant_code)) {
        errors.activity_subtype_data?.AquaticPlants?.addError(
          "You can't make two observations of the same species within a record."
        );
      } else {
        invPlantCodes.push(invPlant.invasive_plant_code);
      }
    });

    return errors as FormValidation;
  }) as unknown as rjsfValidator;
}

export { getPosAndNegObservationValidatorAquatic, getPosAndNegObservationValidator };
