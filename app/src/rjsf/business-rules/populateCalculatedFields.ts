import * as diff from 'fast-array-diff';

import { HerbicideApplicationRates } from 'rjsf/business-rules/constants/herbicideApplicationRates';

export function populateHerbicideRates(oldSubtypeData: any, newSubtypeData: any): any {
  let updatedActivitySubtypeData = { ...newSubtypeData };

  // if herbicide field is not edited at all
  if (!newSubtypeData.herbicide || JSON.stringify(newSubtypeData.herbicide[0]) === '{}') {
    return newSubtypeData;
  }

  // otherwise, check to see if herbicide field has been changed (ie; code or application rate)
  const differenceInHerbicides = diff.diff(
    oldSubtypeData && oldSubtypeData.herbicide || [],
    newSubtypeData && newSubtypeData.herbicide || [],
    compareHerbicides
  );
  const updatedHerbicides = [ ...newSubtypeData.herbicide ];

  if (differenceInHerbicides.added.length > 0) {
    differenceInHerbicides.added.forEach((addedHerbicide: any) => {
      const herbicideToUpdate = { ...addedHerbicide };

      differenceInHerbicides.removed.forEach((removedHerbicide: any) => {
        if (herbicideToUpdate.liquid_herbicide_code !== removedHerbicide.liquid_herbicide_code) {
          const applicationRate = (HerbicideApplicationRates[herbicideToUpdate.liquid_herbicide_code]).toFixed(3);

          herbicideToUpdate.application_rate = parseFloat(applicationRate);
        }
      });

      upsertArrayValues(
        updatedHerbicides,
        herbicideToUpdate,
        updatedHerbicides.findIndex((h: any) => h.liquid_herbicide_code === herbicideToUpdate.liquid_herbicide_code)
      );
    });
  }

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
