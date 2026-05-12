import moment from 'moment';
import { Feature } from 'geojson';
import { ActivityLetter, ActivityStatus, ActivitySubtype, ActivitySyncStatus, ActivityType } from './constants';
import { performCalculation } from './validation/herbicideCalculator';
import { mapFormDataToLegacy } from './validation/chemTreatmentValidation';

import { api_doc } from './openapi/api-doc/api-doc';
import BC_AREA from './misc/BC_AREA.json';

export * from './validation/constants';
export * from './validation/herbicideCalculator';
export * from './validation/chemTreatmentValidation';
export * from './validation/herbicideApplicationRates';
export * from './validation/areaLimitValidation';
export * from './constants';

export { api_doc };
export { BC_AREA };

//export const autofillChemFields = (activity, codesForFiled) => {
export const autofillChemFields = (activity, chemicalMethodSprayCodes, _UNUSED_chemicalMethodCodes) => {
  try {
    const newActivity = JSON.parse(JSON.stringify(activity));
    const area = newActivity?.form_data?.activity_data?.reported_area ?? 0;
    const chemicalApplicationMethod =
      activity.form_data.activity_subtype_data.chemical_treatment_details.chemical_application_method;
    newActivity.form_data.activity_subtype_data.chemical_treatment_details.chemical_application_method_type =
      chemicalMethodSprayCodes?.includes(chemicalApplicationMethod) ? 'spray' : 'direct';

    const tank_mix = activity.form_data.activity_subtype_data.chemical_treatment_details.tank_mix;
    const invasive_plants = activity.form_data.activity_subtype_data.chemical_treatment_details?.invasive_plants ?? [];
    const herbicides = activity.form_data.activity_subtype_data.chemical_treatment_details?.herbicides ?? [];

    if (invasive_plants.length > 0) {
      const invasivePlantIndex = invasive_plants.map((plant, index) => {
        return { ...plant, index };
      });

      newActivity.form_data.activity_subtype_data.chemical_treatment_details.invasive_plants = invasivePlantIndex;
    }

    for (let i = 0; i < herbicides.length; i++) {
      const herbicide = herbicides[i];

      if (herbicide?.herbicide_type_code === 'G') {
        const product_application_rate =
          newActivity.form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.herbicides[i]
            ?.product_application_rate;
        if (newActivity.form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.herbicides[i]) {
          newActivity.form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.herbicides[
            i
          ].product_application_rate_calculated = product_application_rate / 1000;
        }
      }
    }

    if (tank_mix) {
      const herbicides = activity.form_data.activity_subtype_data.chemical_treatment_details?.herbicides ?? [];

      for (let i = 0; i < herbicides.length; i++) {
        const herbicide = herbicides[i];
        newActivity.form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.herbicides[
          i
        ].herbicide_code = herbicide?.herbicide_code;
        newActivity.form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.herbicides[
          i
        ].herbicide_type_code = herbicide?.herbicide_type_code;
        newActivity.form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.herbicides[i].index = i;
      }

      newActivity.form_data.activity_subtype_data.chemical_treatment_details.herbicides = [];
    }

    if (!tank_mix && newActivity.form_data?.activity_subtype_data?.chemical_treatment_details?.herbicides?.length > 0) {
      newActivity.form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].amount_of_mix =
        newActivity.form_data.activity_subtype_data?.chemical_treatment_details?.tank_mix_object?.amount_of_mix;
      newActivity.form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].delivery_rate_of_mix =
        newActivity.form_data.activity_subtype_data.chemical_treatment_details?.tank_mix_object?.delivery_rate_of_mix;
      newActivity.form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].product_application_rate =
        newActivity.form_data.activity_subtype_data.chemical_treatment_details?.tank_mix_object?.herbicides?.[0]?.product_application_rate;
      newActivity.form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].index = 0;

      if (
        newActivity.form_data.activity_subtype_data.chemical_treatment_details?.herbicides[0]?.herbicide_type_code ===
        'G'
      ) {
        newActivity.form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].product_application_rate_calculated =
          newActivity.form_data.activity_subtype_data.chemical_treatment_details?.tank_mix_object?.herbicides?.[0]?.product_application_rate_calculated;
      }

      newActivity.form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].product_application_rate =
        newActivity.form_data.activity_subtype_data.chemical_treatment_details?.tank_mix_object?.herbicides?.[0]?.product_application_rate;
      newActivity.form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].calculation_type =
        newActivity.form_data.activity_subtype_data.chemical_treatment_details?.tank_mix_object?.calculation_type;

      newActivity.form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object = {
        herbicides: [],
        calculation_type: null
      };
    }

    const formData = mapFormDataToLegacy(newActivity?.form_data ?? {});
    const calculationResults = performCalculation(area, formData);
    newActivity.form_data.activity_subtype_data.chemical_treatment_details.calculation_results = calculationResults;

    return newActivity;
  } catch (e) {
    console.error('error autofilling chem fields', e);
    throw e;
  }
};

export const activity_create_function = (
  type: string,
  subType: string,
  username: string,
  displayName: string,
  pac_number?: string,
  platform?: string
) => {
  const activityV1 = generateDBActivityPayload({}, null, type, subType, platform);
  const activityV2 = populateSpeciesArrays(activityV1);
  activityV2.created_by = username;

  //    if ([ActivityType.Observation, ActivityType.Treatment].includes(activityV2.activity_type))
  {
    activityV2.form_data.activity_type_data.activity_persons = [{ person_name: displayName }];
  }

  if ([ActivityType.Treatment]?.includes(activityV2.activity_type)) {
    activityV2.form_data.activity_type_data.activity_persons[0].applicator_license = pac_number;
  }

  return activityV2;
};

export function generateDBActivityPayload(
  formData: any,
  geometry: Feature[] | null,
  activityType: string,
  activitySubtype: string,
  platform?: string
) {
  const id = crypto.randomUUID();
  const time = moment(new Date()).format();
  const short_id: string | undefined = getShortActivityID({
    activity_subtype: activitySubtype,
    activity_id: id,
    date_created: time
  });
  const returnVal = {
    initial_autofill_done: false,
    _id: id,
    short_id: short_id,
    activity_id: id,
    activity_type: activityType,
    activity_subtype: activitySubtype,
    geometry,
    created_timestamp: time, // TODO different?
    date_created: time, // TODO different?
    date_updated: null,
    form_data: {
      ...formData,
      activity_data: {
        ...formData?.activity_data,
        activity_date_time: time
      },
      activity_type_data: {},
      activity_subtype_data: {}
    },
    media: undefined,
    created_by: undefined,
    sync_status: ActivitySyncStatus.NOT_SAVED,
    form_status: ActivityStatus.DRAFT,
    review_status: 'Not Reviewed',
    reviewed_by: undefined,
    reviewed_at: undefined,
    platform_src: platform
  };
  if (returnVal.activity_subtype === ActivitySubtype.Treatment_ChemicalPlant) {
    returnVal.form_data.activity_subtype_data.chemical_treatment_details = {
      invasive_plants: [],
      herbicides: [],
      tank_mix: false,
      chemical_application_method: null,
      tank_mix_object: {
        herbicides: [],
        calculation_type: null
      },
      skipAppRateValidation: false
    };
  }
  if (returnVal.activity_subtype === ActivitySubtype.Treatment_ChemicalPlantAquatic) {
    returnVal.form_data.activity_subtype_data.chemical_treatment_details = {
      invasive_plants: [],
      herbicides: [],
      tank_mix: false,
      chemical_application_method: null,
      tank_mix_object: {
        herbicides: [],
        calculation_type: null
      },
      skipAppRateValidation: false
    };
  }
  if (returnVal.activity_subtype === ActivitySubtype.Collection_Biocontrol) {
    returnVal.form_data.activity_subtype_data.Biocontrol_Collection_Information = [];
    returnVal.form_data.activity_subtype_data.Biocontrol_Collection_Information[0] = {
      actual_biological_agents: [{}],
      estimated_biological_agents: [{}]
    };
  }
  if (returnVal.activity_subtype === ActivitySubtype.Treatment_BiologicalPlant) {
    returnVal.form_data.activity_subtype_data.Biocontrol_Release_Information = [];
    returnVal.form_data.activity_subtype_data.Biocontrol_Release_Information[0] = {
      actual_biological_agents: [{}],
      estimated_biological_agents: [{}]
    };
  }
  if (returnVal.activity_subtype === ActivitySubtype.Monitoring_BiologicalDispersal) {
    returnVal.form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information = [];
    returnVal.form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information[0] = {
      actual_biological_agents: [{}],
      estimated_biological_agents: [{}]
    };
  }
  return returnVal;
}

export const getShortActivityID = (activity) => {
  if (!activity?.activity_subtype || !activity?.activity_id || !(activity?.date_created || activity.created_timestamp))
    return;
  const shortYear = moment(activity.date_created || activity.created_timestamp)
    .format()
    .substr(2, 2);
  return shortYear + ActivityLetter[activity.activity_subtype] + activity.activity_id.substr(0, 8).toUpperCase();
};

export function populateSpeciesArrays(record) {
  const species_positive: Array<string> = [];
  const species_negative: Array<string> = [];
  const species_treated: Array<string> = [];

  const subtypeData = record?.form_data?.activity_subtype_data;

  switch (record.activity_subtype) {
    // Observation Types
    case ActivitySubtype.Observation_PlantTerrestrial: {
      const arr = subtypeData?.TerrestrialPlants ?? [];
      species_positive.push(
        ...arr
          .filter((plant) => plant.observation_type?.includes('Positive'))
          .map(({ invasive_plant_code }) => invasive_plant_code)
      );
      species_negative.push(
        ...arr
          .filter((plant) => plant.observation_type?.includes('Negative'))
          .map(({ invasive_plant_code }) => invasive_plant_code)
      );
      break;
    }
    case ActivitySubtype.Observation_PlantAquatic: {
      const arr = subtypeData.AquaticPlants ?? [];
      species_positive.push(
        ...arr
          .filter((plant) => plant.observation_type?.includes('Positive'))
          .map(({ invasive_plant_code }) => invasive_plant_code)
      );
      species_negative.push(
        ...arr
          .filter((plant) => plant.observation_type?.includes('Negative'))
          .map(({ invasive_plant_code }) => invasive_plant_code)
      );
      break;
    }
    // Treatment Types
    case ActivitySubtype.Treatment_ChemicalPlantAquatic: {
      const arr = subtypeData?.chemical_treatment_details?.invasive_plants ?? [];
      species_treated.push(...arr.map(({ invasive_plant_code }) => invasive_plant_code));
      break;
    }
    case ActivitySubtype.Treatment_ChemicalPlant: {
      const arr = subtypeData?.chemical_treatment_details?.invasive_plants ?? [];
      species_treated.push(...arr.map(({ invasive_plant_code }) => invasive_plant_code));
      break;
    }
    case ActivitySubtype.Treatment_MechanicalPlantAquatic: // Intentional Fallthrough
    case ActivitySubtype.Treatment_MechanicalPlant: {
      const arr = subtypeData?.Treatment_MechanicalPlant_Information ?? [];
      species_treated.push(...arr.map(({ invasive_plant_code }) => invasive_plant_code));
      break;
    }
    case ActivitySubtype.Treatment_BiologicalPlant: {
      const arr = subtypeData?.Biocontrol_Release_Information ?? [];
      species_treated.push(...arr.map(({ invasive_plant_code }) => invasive_plant_code));
      break;
    }
    // Monitoring Types
    case ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant: {
      const arr = subtypeData?.Monitoring_ChemicalTerrestrialAquaticPlant_Information ?? [];
      species_treated.push(
        ...arr.flatMap(({ invasive_plant_code, invasive_plant_aquatic_code }) =>
          [invasive_plant_code, invasive_plant_aquatic_code].filter(Boolean)
        )
      );
      break;
    }
    case ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant: {
      const arr = subtypeData?.Monitoring_MechanicalTerrestrialAquaticPlant_Information ?? [];
      species_treated.push(
        ...arr.flatMap(({ invasive_plant_code, invasive_plant_aquatic_code }) =>
          [invasive_plant_code, invasive_plant_aquatic_code].filter(Boolean)
        )
      );
      break;
    }
    case ActivitySubtype.Monitoring_BiologicalTerrestrialPlant: {
      const arr = subtypeData?.Monitoring_BiocontrolRelease_TerrestrialPlant_Information ?? [];
      species_treated.push(...arr.map(({ invasive_plant_code }) => invasive_plant_code));
      break;
    }
    case ActivitySubtype.Monitoring_BiologicalDispersal: {
      const arr = subtypeData?.Monitoring_BiocontrolDispersal_Information ?? [];
      species_treated.push(...arr.map(({ invasive_plant_code }) => invasive_plant_code));
      break;
    }
    // Biocontrol Types
    case ActivitySubtype.Collection_Biocontrol: {
      const arr = subtypeData?.Biocontrol_Collection_Information ?? [];
      species_treated.push(...arr.map(({ invasive_plant_code }) => invasive_plant_code));
      break;
    }

    // None implemented
    case ActivitySubtype.Transect_FireMonitoring: {
      const arr = subtypeData?.fire_monitoring_transect_lines ?? [];
      species_positive.push(
        ...arr
          .map((line) =>
            line.fire_monitoring_transect_points?.map((point) =>
              point.invasive_plants?.map((plant) => plant.invasive_plant_code)
            )
          )
          .flat(3)
      );
      break;
    }
    case ActivitySubtype.Transect_Vegetation: {
      const arr = subtypeData?.vegetation_transect_lines ?? [];
      species_positive.push(
        ...arr
          .map((line) =>
            [
              line.vegetation_transect_points_percent_cover,
              line.vegetation_transect_points_number_plants,
              line.vegetation_transect_points_daubenmire
            ]
              .flat(2)
              .filter((point) => point)
              .map((point) =>
                point.vegetation_transect_species?.invasive_plants?.map((plant) => plant.invasive_plant_code)
              )
          )
          .flat(3)
      );
      break;
    }
    case ActivitySubtype.Transect_BiocontrolEfficacy: {
      const arr = subtypeData?.transect_invasive_plants ?? [];
      species_positive.push(...arr.map((plant) => plant.invasive_plant_code));
      break;
    }
    case ActivitySubtype.Activity_AnimalTerrestrial: {
      console.warn('no species selection currently available for Activity_AnimalTerrestrial');
      break;
    }
    case ActivitySubtype.Activity_AnimalAquatic: {
      const arr = subtypeData?.invasive_aquatic_animals ?? [];
      species_treated.push(...arr.map((animal) => animal.invasive_animal_code));
      break;
    }
    default:
      break;
  }
  const returnVal = {
    ...record,
    species_positive: Array.from(new Set(species_positive))
      ?.filter((code) => typeof code === 'string')
      .sort(),
    species_negative: Array.from(new Set(species_negative))
      ?.filter((code) => typeof code === 'string')
      .sort(),
    species_treated: Array.from(new Set(species_treated))
      ?.filter((code) => typeof code === 'string')
      .sort()
  };

  return returnVal;
}
