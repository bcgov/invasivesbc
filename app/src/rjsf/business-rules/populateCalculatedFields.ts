import * as diff from 'fast-array-diff';

import { Herbicides } from 'constants/herbicides';

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
          herbicideToUpdate.application_rate = parseFloat((Herbicides[herbicideToUpdate.liquid_herbicide_code]).toFixed(3));
        }
      });

      upsertArrayValues(updatedHerbicides, herbicideToUpdate);
    });
  }

  updatedActivitySubtypeData = {
    ...newSubtypeData,
    herbicide: JSON.stringify(updatedHerbicides[0]) !== '{}' && updatedHerbicides || newSubtypeData.herbicide
  };

  return updatedActivitySubtypeData;
}

function compareHerbicides(herbicideA: any, herbicideB: any) {
  return (
    herbicideA.liquid_herbicide_code === herbicideB.liquid_herbicide_code &&
    herbicideA.application_rate === herbicideB.application_rate
  );
}

function upsertArrayValues(array: any, value: any): [] {
  const index = array.findIndex((h: any) => h.liquid_herbicide_code === value.liquid_herbicide_code);

  if (index === -1) {
    array.push(value);
  } else {
    array[index] = value;
  }

  return array;
}
