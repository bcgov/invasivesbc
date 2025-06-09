import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/*
  Function to validate that the value selected for invasive plant in dropdown
  is one of the plants from the linked record

  Ex: cannot create a treatment for a plant that was not observed in linked observation
*/
function getInvasivePlantsValidator(
  linkedActivity:
    | {
        properties?: { species_treated: string[] };
      }
    | undefined
): rjsfValidator {
  return ((
    formData: InvasivesFormData & {
      activity_subtype_data: {
        [monitoringType: string]: {
          invasive_plant_code: string;
        };
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        [monitoringType: string]: {
          invasive_plant_code: string;
        };
      };
    }>
  ): FormValidation => {
    const linkedActivityInvasivePlants = linkedActivity?.properties?.species_treated;

    const monitoringTypes = [
      'Monitoring_ChemicalTerrestrialAquaticPlant_Information',
      'Monitoring_MechanicalTerrestrialAquaticPlant_Information',
      'Monitoring_BiocontrolRelease_TerrestrialPlant_Information'
    ];

    const subtypeKeys = Object.keys(formData.activity_subtype_data);
    const monitoringType = monitoringTypes.filter((type) => {
      return subtypeKeys.includes(type);
    })[0];
    const invasive_plant_code = formData?.activity_subtype_data?.[monitoringType]?.invasive_plant_code;

    if (!linkedActivityInvasivePlants || !invasive_plant_code) return errors as FormValidation;

    if (errors.activity_subtype_data) {
      errors.activity_subtype_data.__errors = [];
    }
    if (!linkedActivityInvasivePlants.some((lipc) => lipc.toString() === invasive_plant_code.toString())) {
      errors.activity_subtype_data?.addError(
        'You must select a species that was previously observed in the linked activity'
      );
    }

    return errors as FormValidation;
  }) as unknown as rjsfValidator;
}

/*
  function to validate that the sum of values of all target plant phenology fields equal to 100%
 */
function getTargetPhenologySumValidator(): rjsfValidator {
  return (
    formData: InvasivesFormData & {
      activity_subtype_data: {
        Target_Plant_Phenology?: {
          phenology_details_recorded: string;
          senescent: number;
          seeds_forming: number;
          flowering: number;
          bolts: number;
          rosettes: number;
          seedlings: number;
          winter_dormant: number;
        };
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        Target_Plant_Phenology: {
          phenology_details_recorded: string;
          senescent: number;
          seeds_forming: number;
          flowering: number;
          bolts: number;
          rosettes: number;
          seedlings: number;
          winter_dormant: number;
        };
      };
    }>
  ): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.Target_Plant_Phenology ||
      !formData.activity_subtype_data.Target_Plant_Phenology.phenology_details_recorded ||
      formData.activity_subtype_data.Target_Plant_Phenology.phenology_details_recorded === 'No'
    ) {
      return errors as FormValidation;
    }

    const Target_Plant_Phenology = formData.activity_subtype_data.Target_Plant_Phenology;
    let total = 0;

    if (Target_Plant_Phenology.senescent) {
      total += Target_Plant_Phenology.senescent;
    }
    if (Target_Plant_Phenology.seeds_forming) {
      total += Target_Plant_Phenology.seeds_forming;
    }
    if (Target_Plant_Phenology.flowering) {
      total += Target_Plant_Phenology.flowering;
    }
    if (Target_Plant_Phenology.bolts) {
      total += Target_Plant_Phenology.bolts;
    }
    if (Target_Plant_Phenology.rosettes) {
      total += Target_Plant_Phenology.rosettes;
    }
    if (Target_Plant_Phenology.seedlings) {
      total += Target_Plant_Phenology.seedlings;
    }
    if (Target_Plant_Phenology.winter_dormant) {
      total += Target_Plant_Phenology.winter_dormant;
    }

    if (total !== 100) {
      errors?.activity_subtype_data?.Target_Plant_Phenology?.addError('Sum of all percentages must be equal to 100');
    }

    return errors as FormValidation;
  };
}

/*
  function to validate that the sum of all target plant phenology fields is equal to 100%
 */
function getTerrestrialAquaticPlantsValidator(): rjsfValidator {
  return ((
    formData: InvasivesFormData & {
      activity_subtype_data: {
        Monitoring_ChemicalTerrestrialAquaticPlant_Information: {
          invasive_plant_aquatic_code: string;
          invasive_plant_code: string;
        }[];
        Monitoring_MechanicalTerrestrialAquaticPlant_Information: {
          invasive_plant_aquatic_code: string;
          invasive_plant_code: string;
        }[];
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        Monitoring_ChemicalTerrestrialAquaticPlant_Information: {
          invasive_plant_aquatic_code: string;
          invasive_plant_code: string;
        }[];
        Monitoring_MechanicalTerrestrialAquaticPlant_Information: {
          invasive_plant_aquatic_code: string;
          invasive_plant_code: string;
        }[];
      };
    }>
  ): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      (!formData.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information &&
        !formData.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information)
    ) {
      return errors as FormValidation;
    }

    const isChemical =
      formData.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information === undefined;

    const informationArray = isChemical
      ? formData.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information
      : formData.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information;

    if (!informationArray || informationArray?.length < 1) {
      return errors as FormValidation;
    }

    informationArray?.forEach((object, i) => {
      if (!object.invasive_plant_aquatic_code && !object.invasive_plant_code) {
        const violation = 'Either Aquatic or Terrestrial plant has to be specified.';
        const baseError = (() =>
          isChemical
            ? errors?.activity_subtype_data?.Monitoring_ChemicalTerrestrialAquaticPlant_Information
            : errors?.activity_subtype_data?.Monitoring_MechanicalTerrestrialAquaticPlant_Information)();
        baseError?.[i]?.addError(violation);
        baseError?.addError(violation);
      } else if (object.invasive_plant_aquatic_code && object.invasive_plant_code) {
        const violation = "You can't specify both aquatic and terrestrial plants.";
        const baseError = (() =>
          isChemical
            ? errors?.activity_subtype_data?.Monitoring_ChemicalTerrestrialAquaticPlant_Information
            : errors?.activity_subtype_data?.Monitoring_MechanicalTerrestrialAquaticPlant_Information)();
        baseError?.addError(violation);
        baseError?.[i]?.invasive_plant_aquatic_code?.addError(violation);
        baseError?.[i]?.invasive_plant_code?.addError(violation);
      }
    });

    return errors as FormValidation;
  }) as unknown as rjsfValidator;
}

export { getInvasivePlantsValidator, getTerrestrialAquaticPlantsValidator, getTargetPhenologySumValidator };
