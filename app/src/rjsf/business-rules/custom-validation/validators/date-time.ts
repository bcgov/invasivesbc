import { FormValidation } from '@rjsf/utils';
import { ActivitySubtype } from 'sharedAPI';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/*
  Function to validate that the date and time is not in future
*/
function getDateAndTimeValidator(_activitySubtype: string): rjsfValidator {
  return (
    formData: InvasivesFormData,
    errors: FormValidation<{
      activity_data: { activity_date_time: string };
    }>
  ): FormValidation => {
    if (errors.activity_data?.activity_date_time) {
      errors.activity_data['activity_date_time'].__errors = [];
    }

    if (formData.activity_data.activity_date_time) {
      if (Date.now() < Date.parse(formData.activity_data?.activity_date_time as string)) {
        if (errors.activity_data?.activity_date_time) {
          errors.activity_data.activity_date_time.addError(
            `Date and time cannot be later than your current date and time`
          );
        }
      }
    }
    return errors as FormValidation;
  };
}

type FormDataBiocontrolCollection = InvasivesFormData & {
  activity_subtype_data: {
    Biocontrol_Collection_Information: {
      start_time: string;
      stop_time: string;
    }[];
  };
};

function IsFormDataBiocontrolCollection(formData: InvasivesFormData): formData is FormDataBiocontrolCollection {
  return formData.activity_subtype_data.Biocontrol_Collection_Information !== undefined;
}

type BiologicalDispersalMonitoringData = InvasivesFormData & {
  activity_subtype_data: {
    Monitoring_BiocontrolDispersal_Information: {
      start_time: string;
      stop_time: string;
    }[];
  };
};

function IsBiologicalDispersalMonitoringData(
  formData: InvasivesFormData
): formData is BiologicalDispersalMonitoringData {
  return formData.activity_subtype_data.Monitoring_BiocontrolDispersal_Information !== undefined;
}

type BiologicalTreatmentPlantData = InvasivesFormData & {
  activity_subtype_data: {
    Biocontrol_Release_Information: {
      collection_date: string;
    }[];
  };
};

function IsBiologicalTreatmentPlantData(formData: InvasivesFormData): formData is BiologicalTreatmentPlantData {
  return formData.activity_subtype_data.Biocontrol_Release_Information !== undefined;
}

type FormDataBiocontrolReleaseTerrestrialPlant = InvasivesFormData & {
  activity_subtype_data: {
    Monitoring_BiocontrolRelease_TerrestrialPlant_Information: {
      start_time: string;
      stop_time: string;
    }[];
  };
};

function IsFormDataBiocontrolReleaseTerrestrialPlant(
  formData: InvasivesFormData
): formData is FormDataBiocontrolReleaseTerrestrialPlant {
  return formData.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information !== undefined;
}

type FormDataChemicalTreatmentPlant = InvasivesFormData & {
  activity_subtype_data: {
    Treatment_ChemicalPlant_Information: {
      application_start_time: string;
    };
  };
};

function IsFormDataChemicalTreatmentPlant(formData: InvasivesFormData): formData is FormDataChemicalTreatmentPlant {
  return formData.activity_subtype_data.Treatment_ChemicalPlant_Information !== undefined;
}

function getDateAndTimeValidatorOther(activitySubtype: string): rjsfValidator {
  return (
    formData: InvasivesFormData,
    errors: FormValidation<{
      activity_subtype_data: {
        Biocontrol_Collection_Information: {
          start_time: string;
          stop_time: string;
        }[];
        Biocontrol_Release_Information: {
          collection_date: string;
        }[];
        Monitoring_BiocontrolDispersal_Information: {
          start_time: string;
          stop_time: string;
        };
        Monitoring_BiocontrolRelease_TerrestrialPlant_Information: {
          start_time: string;
          stop_time: string;
        }[];
        AquaticPlants: {
          voucher_specimen_collection_information: {
            date_voucher_collected: string;
            date_voucher_verified: string;
          };
        }[];
        Treatment_ChemicalPlant_Information: {
          application_start_time: string;
        };
        TerrestrialPlants: {
          voucher_specimen_collection_information: {
            date_voucher_collected: string;
            date_voucher_verified: string;
          };
        }[];
      };
    }>
  ): FormValidation => {
    const FUTURE_DATED = `Date and time cannot be later than your current date and time`;
    switch (activitySubtype) {
      case ActivitySubtype.Collection_Biocontrol: {
        if (!IsFormDataBiocontrolCollection(formData)) {
          return errors as FormValidation;
        }
        const bioCollectionLength = formData.activity_subtype_data.Biocontrol_Collection_Information.length;
        const bioCollectionErrorArray = errors.activity_subtype_data?.Biocontrol_Collection_Information;
        for (let i = 0; i < bioCollectionLength; i++) {
          if (bioCollectionErrorArray) {
            const bioCollectionErrors = bioCollectionErrorArray[i];
            const dispersalPlantData = formData.activity_subtype_data.Biocontrol_Collection_Information[i];
            if (bioCollectionErrors) {
              if (bioCollectionErrors?.start_time?.__errors) {
                bioCollectionErrors.start_time.__errors = [];
              }
              if (bioCollectionErrors?.stop_time?.__errors) {
                bioCollectionErrors.stop_time.__errors = [];
              }
              if (Date.now() < Date.parse(dispersalPlantData.start_time)) {
                bioCollectionErrors?.start_time?.addError(FUTURE_DATED);
              }
              if (Date.now() < Date.parse(dispersalPlantData.stop_time)) {
                bioCollectionErrors?.stop_time?.addError(FUTURE_DATED);
              }
              if (Date.parse(dispersalPlantData.start_time) > Date.parse(dispersalPlantData.stop_time)) {
                bioCollectionErrors?.start_time?.addError('Start time must be before stop time');
                bioCollectionErrors?.stop_time?.addError('Stop time must be after start time');
              }
            }
          }
        }
        break;
      }
      case ActivitySubtype.Monitoring_BiologicalDispersal: {
        if (!IsBiologicalDispersalMonitoringData(formData)) {
          return errors as FormValidation;
        }
        const dispersalLength = formData.activity_subtype_data?.Monitoring_BiocontrolDispersal_Information?.length;
        const dispersalErrorArray = errors.activity_subtype_data?.Monitoring_BiocontrolDispersal_Information;
        for (let i = 0; i < dispersalLength; i++) {
          if (dispersalErrorArray) {
            const dispersalError = dispersalErrorArray[i];
            const dispersalPlantData = formData.activity_subtype_data?.Monitoring_BiocontrolDispersal_Information[i];
            if (dispersalError.start_time !== undefined) {
              dispersalError.start_time.__errors = [];
            }
            if (dispersalError.stop_time !== undefined) {
              dispersalError.stop_time.__errors = [];
            }
            if (Date.now() < Date.parse(dispersalPlantData.start_time)) {
              dispersalError?.start_time?.addError(FUTURE_DATED);
            }
            if (Date.now() < Date.parse(dispersalPlantData.stop_time)) {
              dispersalError?.stop_time?.addError(FUTURE_DATED);
            }
            if (Date.parse(dispersalPlantData.start_time) > Date.parse(dispersalPlantData.stop_time)) {
              dispersalError?.start_time?.addError('Start time must be before stop time');
              dispersalError?.stop_time?.addError('Stop time must be after start time');
            }
          }
        }
        break;
      }
      case ActivitySubtype.Treatment_BiologicalPlant: {
        if (!IsBiologicalTreatmentPlantData(formData)) {
          return errors as FormValidation;
        }
        const bioTreatmentLength = formData.activity_subtype_data.Biocontrol_Release_Information.length;
        const bioTreatmentErrorArray = errors.activity_subtype_data?.Biocontrol_Release_Information;
        for (let i = 0; i < bioTreatmentLength; i++) {
          if (bioTreatmentErrorArray) {
            const bioTreatmentError = bioTreatmentErrorArray[i];
            const bioTreatmentPlantData = formData.activity_subtype_data.Biocontrol_Release_Information[i];

            if (bioTreatmentError?.collection_date) {
              bioTreatmentError.collection_date.__errors = [];
            }
            if (Date.now() < Date.parse(bioTreatmentPlantData.collection_date)) {
              bioTreatmentError?.collection_date?.addError(FUTURE_DATED);
            }
          }
        }
        break;
      }
      case ActivitySubtype.Monitoring_BiologicalTerrestrialPlant: {
        if (!IsFormDataBiocontrolReleaseTerrestrialPlant(formData)) {
          return errors as FormValidation;
        }
        const bioLength =
          formData.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.length;

        const bioErrorArray = errors.activity_subtype_data?.Monitoring_BiocontrolRelease_TerrestrialPlant_Information;
        for (let i = 0; i < bioLength; i++) {
          if (bioErrorArray) {
            const thisError = bioErrorArray[i];
            const thisData =
              formData.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information[i];
            if (thisError?.start_time) {
              thisError.start_time.__errors = [];
            }
            if (thisError?.stop_time) {
              thisError.stop_time.__errors = [];
            }

            if (Date.now() < Date.parse(thisData.start_time)) {
              thisError?.start_time?.addError(FUTURE_DATED);
            }
            if (Date.now() < Date.parse(thisData.stop_time)) {
              thisError?.stop_time?.addError(FUTURE_DATED);
            }
            if (thisError?.start_time && thisError?.stop_time) {
              if (Date.parse(thisData.start_time) > Date.parse(thisData.stop_time)) {
                thisError?.start_time?.addError('Start time must be before stop time');
                thisError?.stop_time?.addError('Stop time must be after start time');
              }
            }
          }
        }
        break;
      }
      case ActivitySubtype.Treatment_ChemicalPlant: {
        if (!IsFormDataChemicalTreatmentPlant(formData)) {
          return errors as FormValidation;
        }

        if (errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.application_start_time) {
          errors.activity_subtype_data.Treatment_ChemicalPlant_Information.application_start_time.__errors = [];
        }
        if (
          Date.now() <
          Date.parse(formData.activity_subtype_data.Treatment_ChemicalPlant_Information.application_start_time)
        ) {
          errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.application_start_time?.addError(
            FUTURE_DATED
          );
        }
        break;
      }
      case ActivitySubtype.Treatment_ChemicalPlantAquatic: {
        if (!IsFormDataChemicalTreatmentPlant(formData)) {
          return errors as FormValidation;
        }

        if (errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.application_start_time) {
          errors.activity_subtype_data.Treatment_ChemicalPlant_Information.application_start_time.__errors = [];
        }
        if (
          Date.now() <
          Date.parse(formData.activity_subtype_data.Treatment_ChemicalPlant_Information.application_start_time)
        ) {
          errors.activity_subtype_data?.Treatment_ChemicalPlant_Information?.application_start_time?.addError(
            FUTURE_DATED
          );
        }
        break;
      }
      case ActivitySubtype.Observation_PlantTerrestrial: {
        if (!formData?.activity_subtype_data?.TerrestrialPlants?.[0]?.voucher_specimen_collection_information) {
          return errors as FormValidation;
        }

        if (
          Date.now() <
          Date.parse(
            formData.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information
              .date_voucher_collected
          )
        ) {
          if (errors.activity_subtype_data?.TerrestrialPlants) {
            errors.activity_subtype_data.TerrestrialPlants[0]?.voucher_specimen_collection_information?.date_voucher_collected?.addError(
              FUTURE_DATED
            );
          }
        }

        if (
          Date.now() <
          Date.parse(
            formData.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information
              .date_voucher_verified
          )
        ) {
          if (errors.activity_subtype_data?.TerrestrialPlants) {
            errors.activity_subtype_data.TerrestrialPlants[0]?.voucher_specimen_collection_information?.date_voucher_verified?.addError(
              FUTURE_DATED
            );
          }
        }
        break;
      }
      case ActivitySubtype.Observation_PlantAquatic: {
        if (!formData?.activity_subtype_data?.AquaticPlants?.[0]?.voucher_specimen_collection_information) {
          return errors as FormValidation;
        }

        if (
          Date.now() <
          Date.parse(
            formData.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information
              .date_voucher_collected
          )
        ) {
          if (errors.activity_subtype_data?.AquaticPlants) {
            errors.activity_subtype_data.AquaticPlants[0]?.voucher_specimen_collection_information?.date_voucher_collected?.addError(
              FUTURE_DATED
            );
          }
        }

        if (
          Date.now() <
          Date.parse(
            formData.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information
              .date_voucher_verified
          )
        ) {
          if (errors.activity_subtype_data?.AquaticPlants) {
            errors.activity_subtype_data.AquaticPlants[0]?.voucher_specimen_collection_information?.date_voucher_verified?.addError(
              FUTURE_DATED
            );
          }
        }
        break;
      }
      default:
        break;
    }
    return errors as FormValidation;
  };
}

export { getDateAndTimeValidator, getDateAndTimeValidatorOther };
