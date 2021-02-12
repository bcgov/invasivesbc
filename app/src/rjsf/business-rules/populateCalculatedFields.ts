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

export function populateTransectLinesLengthAndBearing(newSubtypeData: any): any {
  let updatedActivitySubtypeData = { ...newSubtypeData };

  const transectLinesMatchingKeys = Object.keys(updatedActivitySubtypeData).filter((key) =>
    key.includes('transect_lines')
  );

  // If transect lines field is not edited at all just return existing activity subtype data
  if (!transectLinesMatchingKeys.length) {
    return newSubtypeData;
  }

  /*
    Otherwise, check to see if transect lines fields have been populated
    If yes, calculate the bearing and length of each transect line
  */
  const transectLinesList = [...newSubtypeData[transectLinesMatchingKeys[0]]];
  const updatedTransectLinesList = [];

  transectLinesList.forEach((transectLineObj: any) => {
    const transectLineObjToUpdate = { ...transectLineObj };
    const transectLine = { ...transectLineObjToUpdate.transect_line };
    const { start_x_utm, end_x_utm, start_y_utm, end_y_utm } = transectLine;

    if (start_x_utm && end_x_utm && start_y_utm && end_y_utm) {
      let angle = Math.atan((end_x_utm - start_x_utm) / (end_y_utm - start_y_utm)) * (180 / Math.PI);

      /*
        Because we want the angle relative from the North direction
      */
      if (end_x_utm - start_x_utm > 0 && end_y_utm - start_y_utm < 0) {
        angle = angle + 180;
      } else if (end_x_utm - start_x_utm < 0 && end_y_utm - start_y_utm < 0) {
        angle = angle - 180;
      }

      transectLine.transect_bearing = angle.toFixed(1);
      transectLine.transect_length = Math.hypot(end_x_utm - start_x_utm, end_y_utm - start_y_utm).toFixed(1);
    }

    updatedTransectLinesList.push({ ...transectLineObjToUpdate, transect_line: transectLine });
  });

  /*
    Update the activity subtype data with the new transect line values
  */
  updatedActivitySubtypeData = {
    ...newSubtypeData,
    [transectLinesMatchingKeys[0]]: updatedTransectLinesList.length && updatedTransectLinesList
  };

  return updatedActivitySubtypeData;
}
