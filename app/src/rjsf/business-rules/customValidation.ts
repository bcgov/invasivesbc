import { FormValidation } from '@rjsf/core';
import { HerbicideApplicationRates } from 'rjsf/business-rules/constants/herbicideApplicationRates';

type rjsfValidator = (formData: any, errors: FormValidation) => FormValidation;

// keep track of all business rules for custom form validation logic
export function getCustomValidator(validators: rjsfValidator[]): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    for (const validator of validators) {
      errors = validator(formData, errors);
    }

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
      !formData.activity_subtype_data.observation_plant_terrestrial_data ||
      !formData.activity_subtype_data.observation_plant_terrestrial_data.slope_code ||
      !formData.activity_subtype_data.observation_plant_terrestrial_data.aspect_code
    ) {
      return errors;
    }
    const { slope_code, aspect_code } = formData.activity_subtype_data.observation_plant_terrestrial_data;
    if (
      (slope_code.includes('FL') && !aspect_code.includes('FL')) ||
      (!slope_code.includes('FL') && aspect_code.includes('FL'))
    ) {
      errors.activity_subtype_data['observation_plant_terrestrial_data']['aspect_code'].addError(
        'If either Aspect or Slope is flat, both of them must be flat.'
      );
      errors.activity_subtype_data['observation_plant_terrestrial_data']['slope_code'].addError(
        'If either Aspect or Slope is flat, both of them must be flat.'
      );
    }
    return errors;
  };
}
/* 
  Function to validate duration of count and plant count fields of biological dispersal form
*/
export function getDurationCountAndPlantCountValidation(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (!formData || !formData.activity_subtype_data) {
      return errors;
    }
    if (formData.activity_subtype_data.count_duration && formData.activity_subtype_data.plant_count) {
      if (errors.activity_subtype_data['count_duration']) {
        errors.activity_subtype_data['count_duration'].addError(
          "Can't specify both count duration and  plant count. If one field is specified, other must be empty."
        );
      }
      if (errors.activity_subtype_data['plant_count']) {
        errors.activity_subtype_data['plant_count'].addError(
          "Can't specify both count duration and  plant count. If one field is specified, other must be empty."
        );
      }
    }
    if (!formData.activity_subtype_data.count_duration && !formData.activity_subtype_data.plant_count) {
      if (errors.activity_subtype_data['count_duration']) {
        errors.activity_subtype_data['count_duration'].addError(
          'Either count duration or  plant count must be specified.'
        );
      }
      if (errors.activity_subtype_data['plant_count']) {
        errors.activity_subtype_data['plant_count'].addError(
          'Either count duration or  plant count must be specified.'
        );
      }
    }
    return errors;
  };
}
/* 
  Function to validate total percent value of vegetation transect points percent cover
*/
export function getVegTransectPointsPercentCoverValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (!formData || !formData.activity_subtype_data || !formData.activity_subtype_data.vegetation_transect_lines) {
      return errors;
    }
    const { vegetation_transect_lines } = formData.activity_subtype_data;
    let vegTransectLineIndex = 0;
    vegetation_transect_lines.forEach((vegTransectLine: any) => {
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
            errors.activity_subtype_data['vegetation_transect_lines'][vegTransectLineIndex][
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

/*
  Function to validate that the net geo area selected does not exceed the limits
  specified by business area for various activity types
*/
export function getAreaValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    let areaLimit = Number.POSITIVE_INFINITY;
    const tenThousandAreaLimitSubtypes = [
      'Activity_Treatment_MechanicalPlant',
      'Activity_Observation_PlantTerrestrial',
      'Activity_Treatment_ChemicalPlant',
      'Activity_Observation_PlantAquatic',
      'Activity_Treatment_BiologicalPlant',
      'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
      'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
      'Activity_Monitoring_BiologicalTerrestrialPlant',
      'Activity_Dispersal_BiologicalDispersal',
      'Activity_AnimalActivity_AnimalTerrestrial',
      'Activity_AnimalActivity_AnimalAquatic',
      'Activity_Transect_FireMonitoring',
      'Activity_Transect_Vegetation',
      'Activity_Transect_BiocontrolEfficacy',
      'Activity_Collection_Biocontrol'
    ];

    if (tenThousandAreaLimitSubtypes.includes(activitySubtype)) {
      areaLimit = 50000;
    }

    // validate reported area limit
    errors.activity_data['reported_area'].__errors = [];
    if (formData.activity_data['reported_area'] > areaLimit) {
      errors.activity_data['reported_area'].addError(`Area cannot exceed ${areaLimit} m\u00B2`);
    }

    return errors;
  };
}

/*
  Function to validate duplicate invasive plant species on terrestrial plant form
*/
export function getDuplicateInvasivePlantsValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      activitySubtype !== 'Activity_Observation_PlantTerrestrial' ||
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.invasive_plants ||
      !formData.activity_subtype_data.invasive_plants.length
    ) {
      return errors;
    }

    const invasivePlants = formData.activity_subtype_data.invasive_plants;
    let plantCodeList = [];

    invasivePlants.forEach((invasivePlant: any) => {
      plantCodeList.push(invasivePlant.invasive_plant_code);
    });

    if (!errors || !errors.activity_subtype_data || !errors.activity_subtype_data['invasive_plants']) {
      return errors;
    }

    // validate duplicates of the invasive_plant_code within invasive_plants
    errors.activity_subtype_data['invasive_plants'].__errors = [];

    if (new Set(plantCodeList).size !== plantCodeList.length) {
      errors.activity_subtype_data['invasive_plants'].addError(
        `There are duplicated invasive plant species identified.
        Please remove or fix duplicated species.`
      );
    }

    return errors;
  };
}

/*
  Function to validate temperature field on chemical treatment form
*/
export function getTemperatureValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (activitySubtype !== 'Activity_Treatment_ChemicalPlant') {
      return errors;
    }
    // validate temperature

    errors.activity_subtype_data['treatment_chemicalplant_information']['temperature'].__errors = [];
    const { temperature } = formData.activity_subtype_data['treatment_chemicalplant_information'];

    //if themperature is out of normal range, display an error
    if (temperature < 15 || temperature > 22) {
      errors.activity_subtype_data['treatment_chemicalplant_information']['temperature'].addError(
        'Temperature should ideally be between 15 and 22 degrees'
      );
    }
    //if user clicked proceed in the warning dialog, remove the erro
    if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes('temperature')) {
      errors.activity_subtype_data['treatment_chemicalplant_information']['temperature'].__errors.pop();
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
    if (activitySubtype !== 'Activity_Treatment_ChemicalPlant') {
      return errors;
    }

    // validate wind speed with wind direction
    errors.activity_subtype_data['treatment_chemicalplant_information']['wind_direction_code'].__errors = [];
    const { wind_speed, wind_direction_code } = formData.activity_subtype_data['treatment_chemicalplant_information'];

    if (wind_speed > 0 && wind_direction_code === 'No Wind') {
      errors.activity_subtype_data['treatment_chemicalplant_information']['wind_direction_code'].addError(
        'Must specify a wind direction when wind speed is > 0'
      );
    }

    if (wind_speed === 0 && wind_direction_code !== 'No Wind') {
      errors.activity_subtype_data['treatment_chemicalplant_information']['wind_direction_code'].addError(
        'Cannot specify a wind direction when wind speed is 0'
      );
    }

    //if wind is more than 50km/h, display an error
    if (wind_speed > 50) {
      errors.activity_subtype_data['treatment_chemicalplant_information']['wind_speed'].addError(
        'Wind should ideally be less or equal to 50km/h'
      );
    }
    //if user clicked proceed in the warning dialog, remove the error
    if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes('wind_speed')) {
      errors.activity_subtype_data['treatment_chemicalplant_information']['wind_speed'].__errors.pop();
      return errors;
    }

    return errors;
  };
}

/*
  Function to validate that the value selected for invasive plant in dropdown
  is one of the plants from the linked record

  Ex: cannot create a treatment for a plant that was not observed in linked observation
*/
export function getInvasivePlantsValidator(linkedActivity: any): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    const linkedActivityInvasivePlants = linkedActivity?.formData?.activity_subtype_data?.invasive_plants;
    const { invasive_plant_code } = formData?.activity_subtype_data;
    if (!linkedActivityInvasivePlants || !invasive_plant_code) return errors;

    errors.activity_subtype_data['invasive_plant_code'].__errors = [];
    if (!linkedActivityInvasivePlants.some((lip: any) => lip.invasive_plant_code === invasive_plant_code)) {
      errors.activity_subtype_data['invasive_plant_code'].addError(
        'You must select a species that was previously observed in the linked activity'
      );
    }

    return errors;
  };
}
/*
  Function to validate that the person field does not contain any numbers
*/
export function getPersonNameNoNumbersValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (!formData || !formData.activity_type_data) {
      return errors;
    }
    if (formData.activity_type_data.observation_persons && formData.activity_type_data.observation_persons.length > 0) {
      let index = 0;
      formData.activity_type_data.observation_persons.forEach((person) => {
        if (person?.person_name)
          if (person.person_name.match(/\d+/g) != null) {
            errors['activity_type_data']['observation_persons'][index]['person_name'].addError(
              'Name field must not contain any numbers'
            );
          }
        index++;
      });
    } else if (
      formData.activity_type_data.treatment_persons &&
      formData.activity_type_data.treatment_persons.length > 0
    ) {
      let index = 0;
      formData.activity_type_data.treatment_persons.forEach((person) => {
        if (person?.person_name)
          if (person.person_name.match(/\d+/g) != null) {
            errors['activity_type_data']['treatment_persons'][index]['person_name'].addError(
              'Name field must not contain any numbers'
            );
          }
        index++;
      });
    }
    return errors;
  };
}
/*
  Function to validate that if the herbicide mix is set to true,
  there must be 2 or more herbicides chosen
*/
export function getHerbicideMixValidation(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.treatment_information ||
      !formData.activity_subtype_data.treatment_information.invasive_plants_information ||
      formData.activity_subtype_data.treatment_information.invasive_plants_information.length < 1
    ) {
      return errors;
    }
    let index = 0;
    formData.activity_subtype_data.treatment_information.invasive_plants_information.forEach((treatment_info_item) => {
      if (treatment_info_item.herbicide) {
        if (treatment_info_item.tank_mix && treatment_info_item.herbicide.length < 2) {
          errors.activity_subtype_data['treatment_information']['invasive_plants_information'][index].addError(
            'There must be 2 or more herbicides added if the tank mix field is checked'
          );
        }
      }
      index++;
    });

    return errors;
  };
}

/*
  Function to validate that the application rate specified for a given herbicide
  does not exceed the limit based on guideline values
*/
export function getHerbicideApplicationRateValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.treatment_information ||
      !formData.activity_subtype_data.treatment_information.invasive_plants_information ||
      formData.activity_subtype_data.treatment_information.invasive_plants_information.length < 1
    ) {
      return errors;
    }
    let invPlantIndex = 0;
    formData.activity_subtype_data.treatment_information.invasive_plants_information.forEach((invPlant: any) => {
      let herbicideIndex = 0;
      invPlant.herbicide?.forEach((herbicide: any) => {
        if (!herbicide.herbicide_information?.application_rate || !herbicide.herbicide_code) {
          console.log('no herbicide information found');
        } else if (
          herbicide.herbicide_information.application_rate &&
          herbicide.herbicide_information.application_rate > HerbicideApplicationRates[herbicide.herbicide_code]
        ) {
          errors.activity_subtype_data['treatment_information']['invasive_plants_information'][invPlantIndex][
            'herbicide'
          ][herbicideIndex]['herbicide_information']['application_rate'].addError(
            `Application rate exceeds maximum applicable rate of ${
              HerbicideApplicationRates[herbicide.herbicide_code]
            } L/ha for this herbicide`
          );
        }
        //if user clicked proceed in the warning dialog, remove the error
        if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes('application_rate')) {
          errors.activity_subtype_data['treatment_information']['invasive_plants_information'][invPlantIndex][
            'herbicide'
          ][herbicideIndex]['herbicide_information']['application_rate'].__errors.pop();
        }

        herbicideIndex++;
      });
      invPlantIndex++;
    });

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
