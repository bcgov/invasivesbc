/*
  NOTE:

  Need to spread and create new objects anywhere while accessing fields within objects because
  if the object is mutated then the form field autopopulation will not happen as expected
*/

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

export const autoFillNameByPAC = (formData: any, appUsers: any) => {
  let newFormData = formData;
  if (
    formData &&
    formData.activity_type_data &&
    formData.activity_type_data.activity_persons &&
    formData.activity_type_data.activity_persons.length > 0
  ) {
    // We have activity persons
    let index = 0;
    for (const person of formData.activity_type_data.activity_persons) {
      const name = person.person_name;
      const pac = person.applicator_license;
      // If we have name, but no pac, and pacNumber is provided, auto fill pac
      if (name && (!pac || pac === '')) {
        // Check if name exists in appUsers
        const appUser = appUsers.find((user) => user.first_name + ' ' + user.last_name === name);
        if (appUser) {
          newFormData = {
            ...newFormData,
            activity_type_data: {
              ...newFormData.activity_type_data,
              activity_persons: [
                ...newFormData.activity_type_data.activity_persons.slice(0, index),
                {
                  ...newFormData.activity_type_data.activity_persons[index],
                  applicator_license: appUser.pac_number
                },
                ...newFormData.activity_type_data.activity_persons.slice(index + 1)
              ]
            }
          };
        }
      }

      // If we have pac, but no name, and userName is provided, auto fill name
      if (pac && (!name || name === '')) {
        // Check if pac exists in appUsers
        const appUser = appUsers.find((user) => user.pac_number === pac);
        if (appUser) {
          newFormData = {
            ...newFormData,
            activity_type_data: {
              ...newFormData.activity_type_data,
              activity_persons: [
                ...newFormData.activity_type_data.activity_persons.slice(0, index),
                {
                  ...newFormData.activity_type_data.activity_persons[index],
                  person_name: appUser.first_name + ' ' + appUser.last_name
                },
                ...newFormData.activity_type_data.activity_persons.slice(index + 1)
              ]
            }
          };
        }
      }
      index++;
    }
  }
  return newFormData;
};

export const autoFillSlopeAspect = (formData: any, lastField: string) => {
  if (!lastField) {
    return formData;
  }
  const fieldId = lastField[0];

  let newFormData = formData;

  if (
    fieldId.includes('slope_code') &&
    formData.activity_subtype_data.Observation_PlantTerrestrial_Information.slope_code === 'FL'
  ) {
    newFormData = {
      ...formData,
      activity_subtype_data: {
        ...formData.activity_subtype_data,
        Observation_PlantTerrestrial_Information: {
          ...formData.activity_subtype_data.Observation_PlantTerrestrial_Information,
          aspect_code: 'FL'
        }
      }
    };
  }
  if (
    fieldId.includes('aspect_code') &&
    formData.activity_subtype_data.Observation_PlantTerrestrial_Information.aspect_code === 'FL'
  ) {
    newFormData = {
      ...formData,
      activity_subtype_data: {
        ...formData.activity_subtype_data,
        Observation_PlantTerrestrial_Information: {
          ...formData.activity_subtype_data.Observation_PlantTerrestrial_Information,
          slope_code: 'FL'
        }
      }
    };
  }
  return newFormData;
};

//not sure about this one. should be working, don't know how to test
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

//Biocontrol Release
export const autoFillTotalReleaseQuantity = (formData: any) => {
  if (
    !formData.activity_subtype_data.Biocontrol_Release_Information ||
    !formData.activity_subtype_data.Biocontrol_Release_Information.biological_agent_stages ||
    formData.activity_subtype_data.Biocontrol_Release_Information.biological_agent_stages.length < 1
  ) {
    return formData;
  }

  let total = null;

  const bioAgentStagesArr = formData.activity_subtype_data.Biocontrol_Release_Information.biological_agent_stages;

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
      Biocontrol_Release_Information: {
        ...formData.activity_subtype_data.Biocontrol_Release_Information,
        total_release_quantity: total
      }
    }
  };
  return newFormData;
};

//Monitoring Biocontrol Dispersal
export const autoFillTotalBioAgentQuantity = (formData: any) => {
  if (!formData.activity_subtype_data) {
    return formData;
  }

  const currentForm =
    formData.activity_subtype_data.Monitoring_BiocontrolDispersal_Information ||
    formData.activity_subtype_data.Biocontrol_Release_Information ||
    formData.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information ||
    formData.activity_subtype_data.Biocontrol_Collection_Information ||
    undefined;

  let formLabel = '';

  if (formData.activity_subtype_data.Monitoring_BiocontrolDispersal_Information) {
    formLabel = 'Monitoring_BiocontrolDispersal_Information';
  } else if (formData.activity_subtype_data.Biocontrol_Release_Information) {
    formLabel = 'Biocontrol_Release_Information';
  } else if (formData.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information) {
    formLabel = 'Monitoring_BiocontrolRelease_TerrestrialPlant_Information';
  } else if (formData.activity_subtype_data.Biocontrol_Collection_Information) {
    formLabel = 'Biocontrol_Collection_Information';
  } else {
    return formData;
  }
  if (!currentForm) {
    return formData;
  }

  let totalEstimated = new Array(currentForm.length).fill(0);
  let totalActual = new Array(currentForm.length).fill(0);

  currentForm.forEach((form, index) => {
    const { actual_biological_agents, estimated_biological_agents } = form;

    if (estimated_biological_agents) {
      estimated_biological_agents.forEach((el) => {
        if (!el.release_quantity || !el.biological_agent_stage_code) {
          return formData;
        } else {
          totalEstimated[index] += el.release_quantity;
        }
      });
    }
    if (actual_biological_agents) {
      actual_biological_agents.forEach((el) => {
        if (!el.release_quantity || !el.biological_agent_stage_code) {
          return formData;
        } else {
          totalActual[index] += el.release_quantity;
        }
      });
    }
  });

  const newFormPlantArray = formData.activity_subtype_data[formLabel].map((plantData, index) => {
    return {
      ...plantData,
      total_bio_agent_quantity_actual: totalActual[index],
      total_bio_agent_quantity_estimated: totalEstimated[index]
    };
  });

  const newFormData = {
    ...formData,
    activity_subtype_data: {
      ...formData.activity_subtype_data,
      [formLabel]: newFormPlantArray
    }
  };
  return newFormData;
};

export const autofillBiocontrolCollectionTotalQuantity = (formData: any) => {
  if (!formData.activity_subtype_data) {
    return formData;
  } else {
    const currentForm = formData.activity_subtype_data.Biocontrol_Collection_Information || undefined;
    if (!currentForm) {
      return formData;
    } else {
      const newArray = [];
      currentForm.forEach((bioCollection) => {
        let totalActual = 0;
        let totalEstimated = 0;
        if (bioCollection.actual_quantity_and_life_stage_of_agent_collected) {
          bioCollection.actual_quantity_and_life_stage_of_agent_collected.forEach((el) => {
            if (el.biological_agent_number) {
              totalActual += el.biological_agent_number;
            }
          });
        }
        if (bioCollection.estimated_quantity_and_life_stage_of_agent_collected) {
          bioCollection.estimated_quantity_and_life_stage_of_agent_collected.forEach((el) => {
            if (el.biological_agent_number) {
              totalEstimated += el.biological_agent_number;
            }
          });
        }
        newArray.push({
          ...bioCollection,
          total_bio_agent_quantity_actual: totalActual,
          total_bio_agent_quantity_estimated: totalEstimated
        });
      });
      const newFormData = {
        ...formData,
        activity_subtype_data: {
          ...formData.activity_subtype_data,
          Biocontrol_Collection_Information: newArray
        }
      };
      return newFormData;
    }
  }
};

export const autoFillBiocontrolPresent = (formData: any) => {
  if (
    !formData.activity_subtype_data.Monitoring_BiocontrolDispersal_Information &&
    !formData.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information
  ) {
    return formData;
  }

  const releaseMonitoring = formData.activity_subtype_data.Monitoring_BiocontrolDispersal_Information === undefined;

  const biological_agent_presence_code =
    releaseMonitoring === true
      ? formData.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information
          .biological_agent_presence_code
      : formData.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.biological_agent_presence_code;

  let biocontrol_present;

  if (biological_agent_presence_code === undefined) {
    biocontrol_present = false;
  } else {
    biocontrol_present = true;
  }

  const newFormData =
    releaseMonitoring === true
      ? {
          ...formData,
          activity_subtype_data: {
            ...formData.activity_subtype_data,
            Monitoring_BiocontrolRelease_TerrestrialPlant_Information: {
              ...formData.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information,
              biocontrol_present: biocontrol_present
            }
          }
        }
      : {
          ...formData,
          activity_subtype_data: {
            ...formData.activity_subtype_data,
            Monitoring_BiocontrolDispersal_Information: {
              ...formData.activity_subtype_data.Monitoring_BiocontrolDispersal_Information,
              biocontrol_present: biocontrol_present
            }
          }
        };
  return newFormData;
};
