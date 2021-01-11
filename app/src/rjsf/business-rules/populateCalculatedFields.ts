/*
  Function that calculates the herbicide dilution rate and specific treatment area
*/
export function populateHerbicideDilutionAndArea(newSubtypeData: any): any {
  let updatedActivitySubtypeData = { ...newSubtypeData };

  // If herbicide field is not edited at all just return existing activity subtype data
  if (!newSubtypeData.herbicide || JSON.stringify(newSubtypeData.herbicide[0]) === '{}') {
    return newSubtypeData;
  }

  /*
    Otherwise, check to see if herbicide fields have been populated
    If yes, calculate the overall specific treatment area and dilution rate
  */
  const herbicides = [...newSubtypeData.herbicide];
  const updatedHerbicides = [];

  herbicides.forEach((herbicide: any) => {
    const herbicideToUpdate = { ...herbicide };

    if (
      herbicideToUpdate.application_rate &&
      herbicideToUpdate.herbicide_amount &&
      herbicideToUpdate.liquid_herbicide_code &&
      herbicideToUpdate.mix_delivery_rate
    ) {
      herbicideToUpdate.specific_treatment_area = parseFloat(
        (herbicideToUpdate.herbicide_amount / herbicideToUpdate.mix_delivery_rate).toFixed(4)
      );
      herbicideToUpdate.dilution = parseFloat(
        ((herbicideToUpdate.application_rate * 100) / herbicideToUpdate.mix_delivery_rate).toFixed(4)
      );
      herbicideToUpdate.tank_volume = parseFloat(
        ((herbicideToUpdate.herbicide_amount * 100) / herbicideToUpdate.dilution).toFixed(4)
      );
    }

    updatedHerbicides.push(herbicideToUpdate);
  });

  /*
    Update the activity subtype data with the new herbicide values
  */
  updatedActivitySubtypeData = {
    ...newSubtypeData,
    herbicide: (JSON.stringify(updatedHerbicides[0]) !== '{}' && updatedHerbicides) || newSubtypeData.herbicide
  };

  return updatedActivitySubtypeData;
}
