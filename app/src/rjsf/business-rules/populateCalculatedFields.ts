import * as diff from 'fast-array-diff';

import { HerbicideApplicationRates } from 'rjsf/business-rules/constants/herbicideApplicationRates';

/*
  Function that sets a default application rate for a given herbicide
  Only triggers if the liquid_herbicide_code field changes, not if the user manually edits the rate or any other form field
*/
export function populateHerbicideRates(oldSubtypeData: any, newSubtypeData: any): any {
  let updatedActivitySubtypeData = { ...newSubtypeData };

  // If herbicide field is not edited at all just return existing activity subtype data
  if (!newSubtypeData.herbicide || JSON.stringify(newSubtypeData.herbicide[0]) === '{}') {
    return newSubtypeData;
  }

  /*
    Otherwise, check to see if herbicide field has been changed (ie; code or application rate)
    Get the difference in old and new subtype data and analyze the added and removed herbicide fields
  */
  const differenceInHerbicides = diff.diff(
    oldSubtypeData && oldSubtypeData.herbicide || [],
    newSubtypeData && newSubtypeData.herbicide || [],
    compareHerbicides
  );
  const updatedHerbicides = [ ...newSubtypeData.herbicide ];

  /*
    If new herbicide has been added, go through the added herbicide fields and
    for each removed herbicide field, if they are not the same (meaning that the actual liquid herbicide code changed)
    set the preset default value. If they are the same, this means that the rate is being manually edited so don't override
  */
  if (differenceInHerbicides.added.length > 0) {
    differenceInHerbicides.added.forEach((addedHerbicide: any) => {
      const herbicideToUpdate = { ...addedHerbicide };

      differenceInHerbicides.removed.forEach((removedHerbicide: any) => {
        if (herbicideToUpdate.liquid_herbicide_code !== removedHerbicide.liquid_herbicide_code) {
          const applicationRate = (HerbicideApplicationRates[herbicideToUpdate.liquid_herbicide_code]).toFixed(3);

          herbicideToUpdate.application_rate = parseFloat(applicationRate);
        }
      });

      /*
        If the herbicide we are updating already exists in the subtype data, update it
        If it is a new herbicide being added, insert it
      */
      upsertArrayValues(
        updatedHerbicides,
        herbicideToUpdate,
        updatedHerbicides.findIndex((h: any) => h.liquid_herbicide_code === herbicideToUpdate.liquid_herbicide_code)
      );
    });
  }

  /*
    Update the activity subtype data with the new herbicides
  */
  updatedActivitySubtypeData = {
    ...newSubtypeData,
    herbicide: JSON.stringify(updatedHerbicides[0]) !== '{}' && updatedHerbicides || newSubtypeData.herbicide
  };

  return updatedActivitySubtypeData;
}

function compareHerbicides(herbicideA: any, herbicideB: any): boolean {
  return (
    herbicideA.liquid_herbicide_code === herbicideB.liquid_herbicide_code &&
    herbicideA.application_rate === herbicideB.application_rate
  );
}

function upsertArrayValues(array: any, value: any, index: number): void {
  if (index === -1) {
    array.push(value);
  } else {
    array[index] = value;
  }
}
