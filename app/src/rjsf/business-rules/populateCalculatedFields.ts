/*
  NOTE:

  Need to spread and create new objects anywhere while accessing fields within objects because
  if the object is mutated then the form field autopopulation will not happen as expected
*/

export const autoFillNameByPAC = (formData, appUsers) => {
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
      // If we have name, but no pac, and pacNumber is provided, autofill pac
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

      // If we have pac, but no name, and userName is provided, autofill name
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

  return {
    ...formData,
    activity_subtype_data: {
      ...formData.activity_subtype_data,
      Biocontrol_Release_Information: {
        ...formData.activity_subtype_data.Biocontrol_Release_Information,
        total_release_quantity: total
      }
    }
  };
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

  let newFormData = {};
  const totalEstimated = new Array(currentForm.length).fill(0);
  const totalActual = new Array(currentForm.length).fill(0);

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

  newFormData = {
    ...formData,
    activity_subtype_data: {
      ...formData.activity_subtype_data,
      [formLabel]: newFormPlantArray
    }
  };

  return newFormData;
};
