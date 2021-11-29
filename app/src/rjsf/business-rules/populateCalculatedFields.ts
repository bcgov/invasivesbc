/*
  NOTE:

  Need to spread and create new objects anywhere while accessing fields within objects because
  if the object is mutated then the form field autopopulation will not happen as expected
*/

/*
  Function that calculates the herbicide dilution rate and specific treatment area
*/
export function populateHerbicideCalculatedFields(newSubtypeData: any): any {
  const subTypeData = { ...newSubtypeData };
  return subTypeData;
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

export const autoFillTotalCollectionTime = (formData: any) => {
  if (!formData.activity_subtype_data.collections) {
    return formData;
  }
  const newCollections = [];

  formData.activity_subtype_data.collections.forEach((collection) => {
    const newCollection = collection;
    if (collection.start_time && collection.stop_time) {
      const diff = Math.abs((new Date(collection.stop_time) as any) - (new Date(collection.start_time) as any));
      const total_minutes = Math.floor(diff / 1000 / 60);
      newCollection.total_time = total_minutes;
    } else {
      newCollection.total_time = undefined;
    }
    newCollections.push(newCollection);
  });

  formData.activity_subtype_data.collections = [...newCollections];
  return formData;
};

export const autoFillSlopeAspect = (formData: any, lastField: string) => {
  if (!lastField) {
    return formData;
  }
  const fieldId = lastField[0];
  if (
    fieldId.includes('slope_code') &&
    formData.activity_subtype_data.observation_plant_terrestrial_data.slope_code === 'FL'
  ) {
    formData.activity_subtype_data.observation_plant_terrestrial_data.aspect_code = 'FL';
  }
  if (
    fieldId.includes('aspect_code') &&
    formData.activity_subtype_data.observation_plant_terrestrial_data.aspect_code === 'FL'
  ) {
    formData.activity_subtype_data.observation_plant_terrestrial_data.slope_code = 'FL';
  }

  return formData;
};

export const autoFillTreeNumbers = (activitySubtypeData: any) => {
  if (activitySubtypeData.form_b) {
    activitySubtypeData.form_b.forEach((FormB: any) => {
      if (FormB.form_a) {
        FormB.form_a.forEach((FormA: any) => {
          if (FormA.stand_table) {
            for (let tree_index = 0; tree_index < FormA.stand_table.length; tree_index++) {
              FormA.stand_table[tree_index].tree_num = tree_index + 1;
            }
          }
          if (FormA.plot_information && FormA.plot_information.log) {
            for (let log_index = 0; log_index < FormA.plot_information.log.length; log_index++) {
              FormA.plot_information.log[log_index].log_num = log_index + 1;
            }
          }
        });
      }
    });
  }

  return activitySubtypeData;
};

export const autoFillTotalReleaseQuantity = (formData: any) => {
  if (
    !formData.activity_subtype_data.biological_agent_stages ||
    formData.activity_subtype_data.biological_agent_stages.length < 1
  ) {
    return formData;
  }

  let total = null;

  const bioAgentStagesArr = formData.activity_subtype_data.biological_agent_stages;

  bioAgentStagesArr.forEach((el) => {
    if (!el.release_quantity || !el.biological_agent_stage_code) {
      return formData;
    } else {
      total += el.release_quantity;
    }
  });

  const newFormData = {
    ...formData,
    activity_subtype_data: {
      ...formData.activity_subtype_data,
      total_release_quantity: total
    }
  };

  return newFormData;
};

export const autoFillTotalBioAgentQuantity = (formData: any) => {
  if (
    !formData.activity_subtype_data.biological_agent_stages ||
    formData.activity_subtype_data.biological_agent_stages.length < 1
  ) {
    return formData;
  }
  let total = null;

  const bioAgentStagesArr = formData.activity_subtype_data.biological_agent_stages;

  bioAgentStagesArr.forEach((el) => {
    if (!el.release_quantity || !el.biological_agent_stage_code) {
      return formData;
    } else {
      total += el.release_quantity;
    }
  });

  const newFormData = {
    ...formData,
    activity_subtype_data: {
      ...formData.activity_subtype_data,
      total_bio_agent_quantity: total
    }
  };

  return newFormData;
};
