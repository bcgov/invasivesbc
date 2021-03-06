/*
  NOTE:

  Need to spread and create new objects anywhere while accessing fields within objects because
  if the object is mutated then the form field autopopulation will not happen as expected
*/

/*
  Function that calculates the herbicide dilution rate and specific treatment area
*/
export function populateHerbicideDilutionAndArea(newSubtypeData: any): any {
  let updatedActivitySubtypeData = { ...newSubtypeData };

  // If herbicide field is not edited at all just return existing activity subtype data
  if (!newSubtypeData || !newSubtypeData.herbicide || JSON.stringify(newSubtypeData.herbicide[0]) === '{}') {
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
    } else {
      delete herbicideToUpdate.specific_treatment_area;
      delete herbicideToUpdate.dilution;
      delete herbicideToUpdate.tank_volume;
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

/*
  Function that calculates the transect line and point data

  Specifically the transect line length and bearing and
  the transect point utm x/y values based on offset distance

  If biocontrol efficacy transect, also calculates the phen total percentage
*/
export function populateTransectLineAndPointData(newSubtypeData: any): any {
  let updatedActivitySubtypeData = { ...newSubtypeData };

  // Can be different keys for the object depending on the transect type, so extract it here
  const transectLinesMatchingKeys = Object.keys(updatedActivitySubtypeData).filter((key) =>
    key.includes('transect_lines')
  );

  // If transect lines field is not edited at all just return existing activity subtype data
  if (!transectLinesMatchingKeys.length) {
    return newSubtypeData;
  }

  /*
    Determine if we are dealing with a biocontrol efficacy/vegetation transect/biological dispersal because those cases
    need to be handled slightly differently
  */
  const isBiocontrolEfficacyTransect = transectLinesMatchingKeys[0] === 'biocontrol_efficacy_transect_lines';
  const isBiocontrolDispersal = transectLinesMatchingKeys[0] === 'biological_dispersals';
  const isVegetationTransect = transectLinesMatchingKeys[0] === 'vegetation_transect_lines';

  /*
    Otherwise, check to see if transect lines fields have been populated
    If yes, calculate the bearing and length of each transect line
  */
  const transectLinesList = [...newSubtypeData[transectLinesMatchingKeys[0]]];
  const updatedTransectLinesList = [];

  transectLinesList.forEach((transectLineObj: any) => {
    const transectLineObjToUpdate = { ...transectLineObj };

    // Can be different keys for the object depending on the transect type, so extract it here
    const transectPointsMatchingKeys = Object.keys(transectLineObjToUpdate).filter((key) =>
      key.includes('transect_points')
    );

    const transectLine = { ...transectLineObjToUpdate.transect_line };
    const { start_x_utm, end_x_utm, start_y_utm, end_y_utm } = transectLine;
    const deltaX = end_x_utm - start_x_utm;
    const deltaY = end_y_utm - start_y_utm;

    if (start_x_utm && end_x_utm && start_y_utm && end_y_utm) {
      let angle = Math.atan(deltaX / deltaY) * (180 / Math.PI);

      /*
        Because we want the angle relative from the North direction, depending on quadrant
        we have to modify the calculated angle to get the northing version
      */
      if (deltaX > 0 && deltaY < 0) {
        angle = angle + 180;
      } else if (deltaX < 0 && deltaY < 0) {
        angle = angle - 180;
      }

      transectLine.transect_bearing = parseFloat(angle.toFixed(1));
      transectLine.transect_length = parseFloat(Math.hypot(deltaX, deltaY).toFixed(1));
    } else {
      delete transectLine.transect_bearing;
      delete transectLine.transect_length;
    }

    // If transect points field is not edited at all no need to calculate point UTM values
    if (!transectPointsMatchingKeys.length) {
      updatedTransectLinesList.push({ ...transectLineObjToUpdate, transect_line: transectLine });
    } else {
      // If yes, calculate the UTM X and Y values of each transect point
      const transectPointsList = [...transectLineObjToUpdate[transectPointsMatchingKeys[0]]];
      const updatedTransectPointsList = [];

      transectPointsList.forEach((transectPointObj: any) => {
        const transectPointToUpdate = { ...transectPointObj };
        const vegetationTransectPoints = { ...transectPointToUpdate.vegetation_transect_points };
        const { offset_distance } = vegetationTransectPoints || transectPointToUpdate;

        if (offset_distance && offset_distance <= transectLine.transect_length) {
          const ratio = offset_distance / transectLine.transect_length;
          const utmX = parseFloat((start_x_utm + ratio * deltaX).toFixed(1));
          const utmY = parseFloat((start_y_utm + ratio * deltaY).toFixed(1));

          /*
            The utm x and y values are located in a different section of the object if it is
            a vegetation transect, so access it as required and update the values
          */
          if (isVegetationTransect) {
            vegetationTransectPoints.utm_x = utmX;
            vegetationTransectPoints.utm_y = utmY;
            transectPointToUpdate.vegetation_transect_points = vegetationTransectPoints;
          } else {
            transectPointToUpdate.utm_x = utmX;
            transectPointToUpdate.utm_y = utmY;
          }
        } else {
          /*
            If one of the fields is no longer filled in, remove autopopulated fields
          */
          if (isVegetationTransect) {
            delete vegetationTransectPoints.utm_x;
            delete vegetationTransectPoints.utm_y;
            transectPointToUpdate.vegetation_transect_points = vegetationTransectPoints;
          } else {
            delete transectPointToUpdate.utm_x;
            delete transectPointToUpdate.utm_y;
          }
        }

        /*
          If biocontrol efficacy transect, need to calculate sum of all veg levels for total %
        */
        if (isBiocontrolEfficacyTransect) {
          const {
            veg_transect_native_forbs,
            veg_transect_grasses,
            veg_transect_bare_ground,
            veg_transect_shrubs,
            veg_transect_bryophytes,
            veg_transect_litter
          } = transectPointToUpdate;

          if (
            veg_transect_native_forbs &&
            veg_transect_grasses &&
            veg_transect_bare_ground &&
            veg_transect_shrubs &&
            veg_transect_bryophytes &&
            veg_transect_litter
          ) {
            transectPointToUpdate.veg_total_percentage =
              veg_transect_native_forbs +
              veg_transect_grasses +
              veg_transect_bare_ground +
              veg_transect_shrubs +
              veg_transect_bryophytes +
              veg_transect_litter;
          } else {
            delete transectPointToUpdate.veg_total_percentage;
          }
        }

        /*
          If biocontrol dispersal, need to calculate sum of all phen levels for total %
        */
        if (isBiocontrolDispersal) {
          const { phen_level_se, phen_level_ro, phen_level_bo, phen_level_fl, phen_level_sf, phen_level_sc } =
            transectPointToUpdate;

          if (phen_level_se && phen_level_ro && phen_level_bo && phen_level_fl && phen_level_sf && phen_level_sc) {
            transectPointToUpdate.phen_total_percentage =
              phen_level_se + phen_level_ro + phen_level_bo + phen_level_fl + phen_level_sf + phen_level_sc;
          } else {
            delete transectPointToUpdate.phen_total_percentage;
          }
        }

        updatedTransectPointsList.push(transectPointToUpdate);
      });

      updatedTransectLinesList.push({
        ...transectLineObjToUpdate,
        transect_line: transectLine,
        [transectPointsMatchingKeys[0]]: updatedTransectPointsList
      });
    }
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
