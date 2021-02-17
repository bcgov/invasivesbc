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

    if (totalPercent > 100 || totalPercent < 100) {
      errors.activity_data['jurisdictions'].addError(
        'Total percentage of area covered by jurisdictions must equal 100%'
      );
    }

    return errors;
  };
}

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

    const transectLinesList = [...formData.activity_subtype_data[transectLinesMatchingKeys[0]]];

    transectLinesList.forEach((transectLineObj: any, lineIndex: number) => {
      const transectLineLength = transectLineObj?.transect_line?.transect_length;
      const transectPointsMatchingKeys = Object.keys(transectLineObj).filter((key) => key.includes('transect_points'));

      if (!transectPointsMatchingKeys.length) {
        return errors;
      }

      const transectPointsList = transectLineObj[transectPointsMatchingKeys[0]];

      transectPointsList.forEach((transectPoint: any, pointIndex: any) => {
        errors.activity_subtype_data[transectLinesMatchingKeys[0]][lineIndex][transectPointsMatchingKeys[0]][
          pointIndex
        ]['offset_distance'].__errors = [];

        if (transectPoint.offset_distance > transectLineLength) {
          errors.activity_subtype_data[transectLinesMatchingKeys[0]][lineIndex][transectPointsMatchingKeys[0]][
            pointIndex
          ]['offset_distance'].addError(
            'Offset distance for a transect point cannot exceed the length of the associated transect line'
          );
        }
      });
    });

    return errors;
  };
}
