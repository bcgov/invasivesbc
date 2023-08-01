import { FormValidation } from '@rjsf/utils';
import { ActivitySubtype, lookupAreaLimit, MAX_TEMP, MIN_TEMP } from 'sharedAPI';

type rjsfValidator = (formData: any, errors: FormValidation) => FormValidation;

// keep track of all business rules for custom form validation logic
function combineValidators(validators: rjsfValidator[]): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    for (const validator of validators) {
      errors = validator(formData, errors);
    }

    return errors;
  };
}

export function validatorForActivity(activity, linkedActivity): rjsfValidator {
  return combineValidators([
    getAreaValidator(activity.activity_subtype),
    getDateAndTimeValidator(activity.activity_subtype),
    getDateAndTimeValidatorOther(activity.activity_subtype),
    getWindValidator(activity.activity_subtype),
    getWindValidatorBiocontrol(activity.activity_subtype),
    getSlopeAspectBothFlatValidator(),
    getPosAndNegObservationValidator(),
    getPosAndNegObservationValidatorAquatic(),
    getTreatedAreaValidator(),
    getTargetPhenologySumValidator(),
    getTerrestrialAquaticPlantsValidator(),
    getShorelineTypesPercentValidator(),
    getPestManagementPlanValidator(),
    transferErrorsFromChemDetails(),
    getTransectOffsetDistanceValidator(),
    getVegTransectPointsPercentCoverValidator(),
    getJurisdictionPercentValidator(),
    getInvasivePlantsValidator(linkedActivity),
    getPlotIdentificationTreesValidator(activity.activity_subtype),
    accessDescriptionMinChars()
  ]);
}

/*
  Function to validate that:
  users should not be able to create both a positive and negative observation of the same species
  users should not be able to make two observations of the same species within a record.
*/
export function getPosAndNegObservationValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.TerrestrialPlants ||
      formData.activity_subtype_data.TerrestrialPlants.length < 1
    ) {
      return errors;
    }

    const invPlantCodes = [];

    formData.activity_subtype_data.TerrestrialPlants.forEach((invPlant) => {
      if (invPlantCodes.includes(invPlant.invasive_plant_code)) {
        errors.activity_subtype_data['TerrestrialPlants'].addError(
          "You can't make two observations of the same species within a record."
        );
      } else {
        invPlantCodes.push(invPlant.invasive_plant_code);
      }
    });

    return errors;
  };
}

export function getPosAndNegObservationValidatorAquatic(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.AquaticPlants ||
      formData.activity_subtype_data.AquaticPlants.length < 1
    ) {
      return errors;
    }

    const invPlantCodes = [];

    formData.activity_subtype_data.AquaticPlants.forEach((invPlant) => {
      if (invPlantCodes.includes(invPlant.invasive_plant_code)) {
        errors.activity_subtype_data['AquaticPlants'].addError(
          "You can't make two observations of the same species within a record."
        );
      } else {
        invPlantCodes.push(invPlant.invasive_plant_code);
      }
    });

    return errors;
  };
}
/*
  Function to validate that in case 'slope' field has 'flat' option
  selected, 'aspect' field option has to be 'flat' as well (and vice versa)
*/
export function getSlopeAspectBothFlatValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.Observation_PlantTerrestrial_Information ||
      !formData.activity_subtype_data.Observation_PlantTerrestrial_Information.slope_code ||
      !formData.activity_subtype_data.Observation_PlantTerrestrial_Information.aspect_code
    ) {
      return errors;
    }
    const { slope_code, aspect_code } = formData.activity_subtype_data.Observation_PlantTerrestrial_Information;
    if (
      (slope_code.includes('FL') && !aspect_code.includes('FL')) ||
      (!slope_code.includes('FL') && aspect_code.includes('FL'))
    ) {
      errors.activity_subtype_data['Observation_PlantTerrestrial_Information']['aspect_code'].addError(
        'If either Aspect or Slope is flat, both of them must be flat.'
      );
      errors.activity_subtype_data['Observation_PlantTerrestrial_Information']['slope_code'].addError(
        'If either Aspect or Slope is flat, both of them must be flat.'
      );
    }
    return errors;
  };
}

/*
  Function to validate total percent value of vegetation transect points percent cover
*/
export function getVegTransectPointsPercentCoverValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (!formData || !formData.activity_subtype_data || !formData.activity_subtype_data.VegetationTransectLines) {
      return errors;
    }
    const { VegetationTransectLines } = formData.activity_subtype_data;
    let vegTransectLineIndex = 0;
    VegetationTransectLines.forEach((vegTransectLine: any) => {
      let vegTransectPointIndex = 0;
      if (vegTransectLine['vegetation_transect_points_percent_cover']) {
        vegTransectLine['vegetation_transect_points_percent_cover'].forEach((vegTransectPoint) => {
          let totalPercent = 0;
          //if there are invasive plants
          if (vegTransectPoint.vegetation_transect_species.invasive_plants) {
            vegTransectPoint.vegetation_transect_species.invasive_plants.forEach((invasivePlant: any) => {
              if (invasivePlant.percent_covered) {
                totalPercent += invasivePlant.percent_covered;
              }
            });
          }
          //if there are lumped_species
          if (vegTransectPoint.vegetation_transect_species.lumped_species) {
            vegTransectPoint.vegetation_transect_species.lumped_species.forEach((lumpedSpecie: any) => {
              if (lumpedSpecie.percent_covered) {
                totalPercent += lumpedSpecie.percent_covered;
              }
            });
          }
          //if there are custom_species
          if (vegTransectPoint.vegetation_transect_species.custom_species) {
            vegTransectPoint.vegetation_transect_species.custom_species.forEach((customSpecie: any) => {
              if (customSpecie.percent_covered) {
                totalPercent += customSpecie.percent_covered;
              }
            });
          }
          if (totalPercent !== 100) {
            errors.activity_subtype_data['VegetationTransectLines'][vegTransectLineIndex][
              'vegetation_transect_points_percent_cover'
            ][vegTransectPointIndex].addError('The total percentage must be equal to 100');
          }
          vegTransectPointIndex++;
        });
      }
      vegTransectLineIndex++;
    });
    return errors;
  };
}

/*
  Function to validate that the total percent value of all shoreline types combined = 100
*/
export function getShorelineTypesPercentValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.ShorelineTypes ||
      formData.activity_subtype_data.ShorelineTypes.length < 1
    ) {
      return errors;
    }

    const { ShorelineTypes } = formData.activity_subtype_data;

    let totalPercent = 0;

    ShorelineTypes.forEach((shoreline_type: any) => {
      totalPercent += shoreline_type.percent_covered;
    });

    errors.activity_subtype_data['ShorelineTypes'].__errors = [];
    if (totalPercent !== 100) {
      errors.activity_subtype_data['ShorelineTypes'].addError(
        'Total percentage of area covered by shoreline types must be equal 100%'
      );
    }

    return errors;
  };
}

/*
  Function to validate that the total percent value of all jurisdictions combined = 100
*/
export function getJurisdictionPercentValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (!formData || !formData.activity_data || !formData.activity_data.jurisdictions) {
      return errors;
    }
    const { jurisdictions } = formData.activity_data;
    let totalPercent = 0;

    jurisdictions.forEach((jurisdiction: any) => {
      totalPercent += jurisdiction.percent_covered;
    });

    errors.activity_data['jurisdictions'].__errors = [];
    if (totalPercent !== 100) {
      errors.activity_data['jurisdictions'].addError(
        'Total percentage of area covered by jurisdictions must equal 100%'
      );
    }

    const jurCodes = [];

    formData.activity_data.jurisdictions.forEach((jurCode) => {
      if (jurCodes.includes(jurCode.jurisdiction_code)) {
        errors.activity_data['jurisdictions'].addError('You cannot have two of the same jurisdiction.');
      } else {
        jurCodes.push(jurCode.jurisdiction_code);
      }
    });

    return errors;
  };
}

/*
  Function to validate that the date and time is not in future
*/
export function getDateAndTimeValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    errors.activity_data['activity_date_time'].__errors = [];

    if (formData.activity_data['activity_date_time']) {
      if (Date.now() < Date.parse(formData.activity_data['activity_date_time'])) {
        errors.activity_data['activity_date_time'].addError(
          `Date and time cannot be later than your current date and time`
        );
      }
    }
    return errors;
  };
}

export function getDateAndTimeValidatorOther(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    const subtypeData = formData?.activity_subtype_data;

    switch (activitySubtype) {
      case ActivitySubtype.Collection_Biocontrol:
        const bioCollectionLength = subtypeData.Biocontrol_Collection_Information.length;
        const bioCollectionErrorArray = errors.activity_subtype_data.Biocontrol_Collection_Information;
        for (let i = 0; i < bioCollectionLength; i++) {
          const bioCollectionErrors = bioCollectionErrorArray[i];
          const dispersalPlantData = subtypeData.Biocontrol_Collection_Information[i];
          bioCollectionErrors['start_time'].__errors = [];
          bioCollectionErrors['stop_time'].__errors = [];
          if (Date.now() < Date.parse(dispersalPlantData['start_time'])) {
            bioCollectionErrors['start_time'].addError(`Date and time cannot be later than your current date and time`);
          }
          if (Date.now() < Date.parse(dispersalPlantData['stop_time'])) {
            bioCollectionErrors['stop_time'].addError(`Date and time cannot be later than your current date and time`);
          }
        }
        break;
      case ActivitySubtype.Monitoring_BiologicalDispersal:
        const dispersaLength = subtypeData.Monitoring_BiocontrolDispersal_Information.length;
        const dispersalErrorArray = errors.activity_subtype_data.Monitoring_BiocontrolDispersal_Information;
        for (let i = 0; i < dispersaLength; i++) {
          const dispersalError = dispersalErrorArray[i];
          const dispersalPlantData = subtypeData.Monitoring_BiocontrolDispersal_Information[i];
          dispersalError['start_time'].__errors = [];
          dispersalError['stop_time'].__errors = [];
          if (Date.now() < Date.parse(dispersalPlantData['start_time'])) {
            dispersalError['start_time'].addError(`Date and time cannot be later than your current date and time`);
          }
          if (Date.now() < Date.parse(dispersalPlantData['stop_time'])) {
            dispersalError['stop_time'].addError(`Date and time cannot be later than your current date and time`);
          }
        }
        break;
      case ActivitySubtype.Treatment_BiologicalPlant:
        const bioTreatmentLength = subtypeData.Biocontrol_Release_Information.length;
        const bioTreatmentErrorArray = errors.activity_subtype_data.Biocontrol_Release_Information;
        for (let i = 0; i < bioTreatmentLength; i++) {
          const bioTreatmentError = bioTreatmentErrorArray[i];
          const bioTreatmentPlantData = subtypeData.Biocontrol_Release_Information[i];

          bioTreatmentError['collection_date'].__errors = [];
          if (Date.now() < Date.parse(bioTreatmentPlantData['collection_date'])) {
            bioTreatmentError['collection_date'].addError(
              `Date and time cannot be later than your current date and time`
            );
          }
        }
        break;
      case ActivitySubtype.Monitoring_BiologicalTerrestrialPlant:
        const bioLength = subtypeData.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.length;
        const bioErrorArray = errors.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information;
        for (let i = 0; i < bioLength; i++) {
          const thisError = bioErrorArray[i];
          const thisData = subtypeData.Monitoring_BiocontrolRelease_TerrestrialPlant_Information[i];
          thisError['start_time'].__errors = [];
          thisError['stop_time'].__errors = [];
          if (Date.now() < Date.parse(thisData['start_time'])) {
            thisError['start_time'].addError(`Date and time cannot be later than your current date and time`);
          }
          if (Date.now() < Date.parse(thisData['stop_time'])) {
            thisError['stop_time'].addError(`Date and time cannot be later than your current date and time`);
          }
        }
        break;
      case ActivitySubtype.Treatment_ChemicalPlant:
        errors.activity_subtype_data.Treatment_ChemicalPlant_Information['application_start_time'].__errors = [];

        if (Date.now() < Date.parse(subtypeData.Treatment_ChemicalPlant_Information['application_start_time'])) {
          errors.activity_subtype_data.Treatment_ChemicalPlant_Information['application_start_time'].addError(
            `Date and time cannot be later than your current date and time`
          );
        }
        break;
      case ActivitySubtype.Treatment_ChemicalPlantAquatic:
        errors.activity_subtype_data.Treatment_ChemicalPlant_Information['application_start_time'].__errors = [];

        if (Date.now() < Date.parse(subtypeData.Treatment_ChemicalPlant_Information['application_start_time'])) {
          errors.activity_subtype_data.Treatment_ChemicalPlant_Information['application_start_time'].addError(
            `Date and time cannot be later than your current date and time`
          );
        }
        break;
      case ActivitySubtype.Observation_PlantTerrestrial:
        if (
          !formData ||
          !formData.activity_subtype_data ||
          !formData?.activity_subtype_data?.TerrestrialPlants?.[0]?.['voucher_specimen_collection_information']
        ) {
          return errors;
        }

        if (
          Date.now() <
          Date.parse(
            subtypeData.TerrestrialPlants[0]['voucher_specimen_collection_information']['date_voucher_collected']
          )
        ) {
          errors['activity_subtype_data']['TerrestrialPlants'][0]['voucher_specimen_collection_information'][
            'date_voucher_collected'
          ].addError(`Date and time cannot be later than your current date and time`);
        }

        if (
          Date.now() <
          Date.parse(
            subtypeData.TerrestrialPlants[0]['voucher_specimen_collection_information']['date_voucher_verified']
          )
        ) {
          errors['activity_subtype_data']['TerrestrialPlants'][0]['voucher_specimen_collection_information'][
            'date_voucher_verified'
          ].addError(`Date and time cannot be later than your current date and time`);
        }
        break;
      case ActivitySubtype.Observation_PlantAquatic:
        if (
          !formData ||
          !formData.activity_subtype_data ||
          !formData?.activity_subtype_data?.AquaticPlants?.[0]?.['voucher_specimen_collection_information']
        ) {
          return errors;
        }

        if (
          Date.now() <
          Date.parse(subtypeData.AquaticPlants[0]['voucher_specimen_collection_information']['date_voucher_collected'])
        ) {
          errors['activity_subtype_data']['AquaticPlants'][0]['voucher_specimen_collection_information'][
            'date_voucher_collected'
          ].addError(`Date and time cannot be later than your current date and time`);
        }

        if (
          Date.now() <
          Date.parse(subtypeData.AquaticPlants[0]['voucher_specimen_collection_information']['date_voucher_verified'])
        ) {
          errors['activity_subtype_data']['AquaticPlants'][0]['voucher_specimen_collection_information'][
            'date_voucher_verified'
          ].addError(`Date and time cannot be later than your current date and time`);
        }
        break;
      default:
        break;
    }
    return errors;
  };
}

/*
  Function to validate that the net geo area selected does not exceed the limits
  specified by business area for various activity types
*/
export function getAreaValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    const areaLimit = lookupAreaLimit(activitySubtype);

    // validate reported area limit
    if (errors.activity_data['reported_area']) {
      errors.activity_data['reported_area'].__errors = [];
      if (formData.activity_data['reported_area'] > areaLimit) {
        errors.activity_data['reported_area'].addError(`Area cannot exceed ${areaLimit} m\u00B2`);
      }
    }

    return errors;
  };
}

/*
  Function to validate temperature field on chemical treatment form
*/
export function getTemperatureValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (activitySubtype !== 'Activity_Treatment_ChemicalPlantTerrestrial') {
      return errors;
    }
    // validate temperature

    errors.activity_subtype_data['Treatment_ChemicalPlant_Information']['temperature'].__errors = [];
    const { temperature } = formData.activity_subtype_data['Treatment_ChemicalPlant_Information'];

    //if temperature is out of normal range, display an error
    if (temperature < MIN_TEMP || temperature > MAX_TEMP) {
      errors.activity_subtype_data['Treatment_ChemicalPlant_Information']['temperature'].addError(
        `Temperature should ideally be between ${MIN_TEMP} and ${MAX_TEMP} degrees`
      );
    }
    //if user clicked proceed in the warning dialog, remove the error
    if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes('temperature')) {
      errors.activity_subtype_data['Treatment_ChemicalPlant_Information']['temperature'].__errors.pop();
      return errors;
    }
    return errors;
  };
}

/*
  Function to validate wind fields on chemical treatment forms

  If no wind there should be no wind direction
  If wind, there must be a wind direction
*/
export function getWindValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !['Activity_Treatment_ChemicalPlantTerrestrial', 'Activity_Treatment_ChemicalPlantAquatic'].includes(
        activitySubtype
      )
    ) {
      return errors;
    }

    // validate wind speed with wind direction
    errors.activity_subtype_data['Treatment_ChemicalPlant_Information']['wind_direction_code'].__errors = [];
    const { wind_speed, wind_direction_code } = formData.activity_subtype_data['Treatment_ChemicalPlant_Information'];

    if (wind_speed > 0 && wind_direction_code === 'No Wind') {
      errors.activity_subtype_data['Treatment_ChemicalPlant_Information']['wind_direction_code'].addError(
        'Must specify a wind direction when wind speed is > 0'
      );
    }

    if (wind_speed === 0 && wind_direction_code !== 'No Wind') {
      errors.activity_subtype_data['Treatment_ChemicalPlant_Information']['wind_direction_code'].addError(
        'Cannot specify a wind direction when wind speed is 0'
      );
    }

    //if user clicked proceed in the warning dialog, remove the error
    if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes('wind_speed')) {
      errors.activity_subtype_data['Treatment_ChemicalPlant_Information']['wind_speed'].__errors.pop();
      return errors;
    }

    return errors;
  };
}

export function getWindValidatorBiocontrol(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      ![
        'Activity_Biocontrol_Release',
        'Activity_Biocontrol_Collection',
        'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant',
        'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'
      ].includes(activitySubtype)
    ) {
      return errors;
    }

    // validate wind speed with wind direction
    errors.activity_subtype_data['Weather_Conditions']['wind_direction_code'].__errors = [];
    const { wind_speed, wind_direction_code } = formData.activity_subtype_data['Weather_Conditions'];

    if (wind_speed > 0 && wind_direction_code === 'No Wind') {
      errors.activity_subtype_data['Weather_Conditions']['wind_direction_code'].addError(
        'Must specify a wind direction when wind speed is > 0'
      );
    }

    if (wind_speed === 0 && wind_direction_code !== 'No Wind') {
      errors.activity_subtype_data['Weather_Conditions']['wind_direction_code'].addError(
        'Cannot specify a wind direction when wind speed is 0'
      );
    }

    //if user clicked proceed in the warning dialog, remove the error
    if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes('wind_speed')) {
      errors.activity_subtype_data['Weather_Conditions']['wind_speed'].__errors.pop();
      return errors;
    }

    return errors;
  };
}

/*
  Function to validate that the value selected for invasive plant in dropdown
  is one of the plants from the linked record

  Ex: cannot create a treatment for a plant that was not observed in linked observation

  THIS IS MODIFIED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  THIS IS MODIFIED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  THIS IS MODIFIED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
export function getInvasivePlantsValidator(linkedActivity: any): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    const linkedActivityInvasivePlants = linkedActivity?.properties?.species_treated;

    const monitoringTypes = [
      'Monitoring_ChemicalTerrestrialAquaticPlant_Information',
      'Monitoring_MechanicalTerrestrialAquaticPlant_Information',
      'Monitoring_BiocontrolRelease_TerrestrialPlant_Information'
    ];
    const subtypeKeys = Object.keys(formData?.activity_subtype_data);
    const monitoringType = monitoringTypes.filter((type) => {
      return subtypeKeys.includes(type);
    })[0];
    const invasive_plant_code = formData?.activity_subtype_data?.[monitoringType]?.invasive_plant_code;

    if (!linkedActivityInvasivePlants || !invasive_plant_code) return errors;

    errors.activity_subtype_data.__errors = [];
    if (!linkedActivityInvasivePlants.some((lipc: any) => lipc.toString() === invasive_plant_code.toString())) {
      errors.activity_subtype_data.addError(
        'You must select a species that was previously observed in the linked activity'
      );
    }

    return errors;
  };
}

/*
  Function used by offset distance validation function to identify and set error
  on specific field of nested object structure based on transect type
*/
const determineErrorStateOnTransectPoint = (
  isVegetationTransect: boolean,
  transectPoint: any,
  transectLineLength: number,
  errorState: any
) => {
  if (isVegetationTransect) {
    // If offset distance field has not been entered, no need to validate anything
    if (!transectPoint.vegetation_transect_points.offset_distance) {
      return null;
    }
    // Clear all existing errors to validate properly at start
    errorState.vegetation_transect_points['offset_distance'].__errors = [];
  } else {
    // If offset distance field has not been entered, no need to validate anything
    if (!transectPoint.offset_distance) {
      return null;
    }
    // Clear all existing errors to validate properly at start
    errorState['offset_distance'].__errors = [];
  }

  const transectPointOffsetDistance = isVegetationTransect
    ? transectPoint.vegetation_transect_points.offset_distance
    : transectPoint.offset_distance;

  if (transectPointOffsetDistance > transectLineLength) {
    const errorMessage =
      'Offset distance for a transect point cannot exceed the length of the associated transect line';

    if (isVegetationTransect) {
      errorState.vegetation_transect_points['offset_distance'].addError(errorMessage);
    } else {
      errorState['offset_distance'].addError(errorMessage);
    }
  }

  return errorState;
};

/*
  Function to validate that the offset distance for a point on a transect line
  does not exceed the length of the associated transect line
*/
export function getTransectOffsetDistanceValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (!formData || !formData.activity_subtype_data?.length) {
      return errors;
    }

    const transectLinesMatchingKeys = Object.keys(formData.activity_subtype_data).filter((key) =>
      key.includes('transect_lines')
    );

    // If transect lines field is not present at all
    if (!transectLinesMatchingKeys.length) {
      return errors;
    }
    const isVegetationTransect = transectLinesMatchingKeys[0] === 'vegetation_transect_lines';
    if (!formData.activity_subtype_data[transectLinesMatchingKeys[0]]) {
      return errors;
    }
    const transectLinesList = [...formData.activity_subtype_data[transectLinesMatchingKeys[0]]];

    transectLinesList.forEach((transectLineObj: any, lineIndex: number) => {
      const transectLineLength = transectLineObj?.transect_line?.transect_length;
      const transectPointsMatchingKeys = Object.keys(transectLineObj).filter((key) => key.includes('transect_points'));

      // If transect points field is not present at all
      if (!transectPointsMatchingKeys.length) {
        return errors;
      }

      const transectPointsList = transectLineObj[transectPointsMatchingKeys[0]];

      transectPointsList.forEach((transectPoint: any, pointIndex: any) => {
        let errorState =
          errors.activity_subtype_data[transectLinesMatchingKeys[0]][lineIndex][transectPointsMatchingKeys[0]][
            pointIndex
          ];

        errorState = determineErrorStateOnTransectPoint(
          isVegetationTransect,
          transectPoint,
          transectLineLength,
          errorState
        );

        if (!errorState) {
          return errors;
        }
      });
    });

    return errors;
  };
}

/*
  function to validate frep form a BAF, fixed_area and full_count_area fields
 */
export function getPlotIdentificationTreesValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (!formData || !formData.activity_subtype_data) {
      return errors;
    }
    let form_b_index = 0;
    // For each form b
    if (formData.activity_subtype_data.form_b) {
      formData.activity_subtype_data.form_b.forEach((formB: any) => {
        // For each form a
        let form_a_index = 0;
        if (formB.form_a) {
          formB.form_a.forEach((formA: any) => {
            // Check if plot identification trees section is valid
            if (formA.plot_identification_trees) {
              let form = formA.plot_identification_trees;
              errors.activity_subtype_data['form_b'][form_b_index].form_a[
                form_a_index
              ].plot_identification_trees.__errors = [];
              if (form.trees_exist === 'Yes' && !form.baf && !form.fixed_area && !form.full_count_area) {
                errors.activity_subtype_data['form_b'][form_b_index].form_a[
                  form_a_index
                ].plot_identification_trees.addError(
                  'Please fill out at least one of BAF, Fixed Area Radius (m) or Full Count Area (ha).'
                );
              }
            }
            form_a_index++;
          });
        }
        form_b_index++;
      });
    }
    return errors;
  };
}

/*
  function to validate that the sum of values of all target plant phenology fields equal to 100%
 */
export function getTargetPhenologySumValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.Target_Plant_Phenology ||
      !formData.activity_subtype_data.Target_Plant_Phenology.phenology_details_recorded ||
      formData.activity_subtype_data.Target_Plant_Phenology.phenology_details_recorded === 'No'
    ) {
      return errors;
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
      errors['activity_subtype_data']['Target_Plant_Phenology'].addError('Sum of all percentages must be equal to 100');
    }

    return errors;
  };
}

/*
  function to validate that the sum of values of all target plant phenology fields equal to 100%
 */
export function getTerrestrialAquaticPlantsValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      (!formData.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information &&
        !formData.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information)
    ) {
      return errors;
    }

    const isChemical =
      formData.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information === undefined;

    // let informationObject = isChemical
    // ? formData.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information
    // : formData.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information;

    let informationArray = isChemical
      ? formData.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information
      : formData.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information;

    for (let object of informationArray) {
      if (!object.invasive_plant_aquatic_code && !object.invasive_plant_code) {
        errors['activity_subtype_data'][
          isChemical
            ? 'Monitoring_ChemicalTerrestrialAquaticPlant_Information'
            : 'Monitoring_MechanicalTerrestrialAquaticPlant_Information'
        ].addError('Either Aquatic or Terrestrial plant has to be specified.');
      }

      if (object.invasive_plant_aquatic_code && object.invasive_plant_code) {
        errors['activity_subtype_data'][
          isChemical
            ? 'Monitoring_ChemicalTerrestrialAquaticPlant_Information'
            : 'Monitoring_MechanicalTerrestrialAquaticPlant_Information'
        ].addError("You can't specify both aquatic and terrestrial plants.");
      }
    }

    return errors;
  };
}

export function getPestManagementPlanValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.Treatment_ChemicalPlant_Information
    ) {
      return errors;
    }

    const { pest_management_plan, pmp_not_in_dropdown } =
      formData.activity_subtype_data.Treatment_ChemicalPlant_Information;

    if (!pest_management_plan && !pmp_not_in_dropdown) {
      errors['activity_subtype_data']['Treatment_ChemicalPlant_Information']['pest_management_plan'].addError(
        'Either Pest Management Plan or Unlisted Drop Down field has to be filled.'
      );
      errors['activity_subtype_data']['Treatment_ChemicalPlant_Information']['pmp_not_in_dropdown'].addError(
        'Either Pest Management Plan or Unlisted Drop Down field has to be filled.'
      );
    }

    if (pest_management_plan && pmp_not_in_dropdown) {
      errors['activity_subtype_data']['Treatment_ChemicalPlant_Information']['pest_management_plan'].addError(
        'You must only fill either Pest Management Plan or Unlisted Drop Down field.'
      );
      errors['activity_subtype_data']['Treatment_ChemicalPlant_Information']['pmp_not_in_dropdown'].addError(
        'You must only fill either Pest Management Plan or Unlisted Drop Down field.'
      );
    }

    return errors;
  };
}

/*
  function to transfer error state from chemical details form to main rjsf form
 */
export function transferErrorsFromChemDetails(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (!formData || !formData.activity_subtype_data || !formData.activity_subtype_data.chemical_treatment_details) {
      return errors;
    }
    if (!formData.activity_subtype_data.chemical_treatment_details.errors !== true) {
      errors.activity_subtype_data.addError('Chemical Treatment details form has errors');
    } else {
      errors.activity_subtype_data.__errors.pop();
    }
    return errors;
  };
}

/*
  Function to validate that treated_area field is not larger than the area field that autofills after you draw geometry
*/
export function getTreatedAreaValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.Treatment_MechanicalPlant_Information ||
      !formData.activity_data.reported_area ||
      formData.activity_subtype_data.Treatment_MechanicalPlant_Information.length < 1
    ) {
      return errors;
    }

    const reported_area = formData.activity_data.reported_area;

    formData.activity_subtype_data.Treatment_MechanicalPlant_Information.forEach((invPlant, index) => {
      if (invPlant.treated_area && invPlant.treated_area > reported_area) {
        errors.activity_subtype_data['Treatment_MechanicalPlant_Information'][index]['treated_area'].addError(
          "Can't be bigger than reported area"
        );
      }
    });

    return errors;
  };
}

// Validate access description length
export function accessDescriptionMinChars(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (!formData || !formData.activity_data || !formData.activity_data.access_description) {
      return errors;
    }
    if (formData && formData.activity_data.access_description && formData.activity_data.access_description.length < 5) {
      errors.activity_data.access_description.addError(
        'If there is an access description it must be 5 or more characters long.'
      );
    }
    return errors;
  };
}
