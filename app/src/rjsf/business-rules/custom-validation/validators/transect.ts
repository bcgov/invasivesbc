import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/*
  Function to validate total percent value of vegetation transect points percent cover
*/
function getVegTransectPointsPercentCoverValidator(): rjsfValidator {
  return (formData: InvasivesFormData, errors: FormValidation): FormValidation => {
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
function getTransectOffsetDistanceValidator(): rjsfValidator {
  return (formData: InvasivesFormData, errors: FormValidation): FormValidation => {
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

export { getTransectOffsetDistanceValidator, getVegTransectPointsPercentCoverValidator };
