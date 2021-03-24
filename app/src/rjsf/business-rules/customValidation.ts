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
  Function to validate that the net geo area selected does not exceed the limits
  specified by business area for various activity types
*/
export function getAreaValidator(activitySubtype: string): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    let areaLimit = Number.POSITIVE_INFINITY;
    const tenThousandAreaLimitSubtypes = [
      'Activity_Treatment_MechanicalPlant',
      'Activity_Observation_PlantTerrestrial',
      'Activity_Treatment_ChemicalPlant'
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
    errors.activity_subtype_data['temperature'].__errors = [];
    const { temperature } = formData.activity_subtype_data;

    if (temperature < 10 || temperature > 30) {
      errors.activity_subtype_data['temperature'].addError('Temperature should ideally be between 15 and 22 degrees');
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
    errors.activity_subtype_data['wind_direction_code'].__errors = [];
    const { wind_speed, wind_direction_code } = formData.activity_subtype_data;

    if (wind_speed > 0 && wind_direction_code === 'No Wind') {
      errors.activity_subtype_data['wind_direction_code'].addError(
        'Must specify a wind direction when wind speed is > 0'
      );
    }

    if (wind_speed === 0 && wind_direction_code !== 'No Wind') {
      errors.activity_subtype_data['wind_direction_code'].addError(
        'Cannot specify a wind direction when wind speed is 0'
      );
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
    if (
      !formData ||
      !linkedActivity ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.invasive_plant_code
    ) {
      return errors;
    }

    const linkedActivityInvasivePlants = linkedActivity.formData.activity_subtype_data.invasive_plants;
    const { invasive_plant_code } = formData.activity_subtype_data;

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
  Function to validate that the application rate specified for a given herbicide
  does not exceed the limit based on guideline values
*/
export function getHerbicideApplicationRateValidator(): rjsfValidator {
  return (formData: any, errors: FormValidation): FormValidation => {
    if (
      !formData ||
      !formData.activity_subtype_data ||
      !formData.activity_subtype_data.herbicide ||
      !formData.activity_subtype_data.herbicide.length
    ) {
      return errors;
    }

    const herbicides = formData.activity_subtype_data.herbicide;

    herbicides.forEach((herbicide: any, index: number) => {
      if (
        !errors ||
        !errors.activity_subtype_data ||
        !errors.activity_subtype_data['herbicide'] ||
        !errors.activity_subtype_data['herbicide'][index] ||
        !errors.activity_subtype_data['herbicide'][index]['application_rate']
      ) {
        return errors;
      }

      // validate herbicide application rate maximums
      errors.activity_subtype_data['herbicide'][index]['application_rate'].__errors = [];

      if (
        herbicide.application_rate &&
        herbicide.application_rate > HerbicideApplicationRates[herbicide.liquid_herbicide_code]
      ) {
        errors.activity_subtype_data['herbicide'][index]['application_rate'].addError(
          `Application rate exceeds maximum applicable rate of ${
            HerbicideApplicationRates[herbicide.liquid_herbicide_code]
          } L/ha for this herbicide`
        );
      }
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
    if (!formData || !formData.activity_subtype_data) {
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
