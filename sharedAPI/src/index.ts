import { Feature } from 'geojson';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { ActivityLetter, ActivityStatus, ActivitySubtype, ActivitySyncStatus, ActivityType } from './constants';
import { performCalculation } from './validation/herbicideCalculator';
import { mapFormDataToLegacy } from './validation/chemTreatmentValidation';

export * from './validation/constants';
export * from './validation/herbicideCalculator';
export * from './validation/chemTreatmentValidation';
export * from './validation/herbicideApplicationRates';
export * from './validation/areaLimitValidation';
export * from './constants';

//export const autofillChemFields = (activity, codesForFiled) => {
export const autofillChemFields = (activity, chemicalMethodSprayCodes, chemicalMethodCodes) => {
  try {
    let newActivity = JSON.parse(JSON.stringify(activity));
    const area = newActivity?.form_data?.activity_data?.reported_area ?? 0;
    const chemicalApplicationMethod =
      activity.form_data.activity_subtype_data.chemical_treatment_details.chemical_application_method;
    newActivity.form_data.activity_subtype_data.chemical_treatment_details.chemical_application_method_type =
      chemicalMethodSprayCodes?.includes(chemicalApplicationMethod) ? 'spray' : 'direct';
    const businessCodes = {};

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

      delete newActivity.form_data.activity_subtype_data.chemical_treatment_details.herbicides;
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

      delete newActivity.form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object;
    }

    const formData = mapFormDataToLegacy(newActivity?.form_data ?? {});
    const calculationResults = performCalculation(area, formData, businessCodes);
    newActivity.form_data.activity_subtype_data.chemical_treatment_details.calculation_results = calculationResults;

    // TODO:  copy blob autofill stuff from tankmix accordion

    // TODO:  copy blob autofill stuff from herbicides accordion

    return newActivity;
  } catch (e) {
    console.log('error autofilling chem fields', e.stack);
    throw e;
  }
};

export const activity_create_function = (
  type: string,
  subType: string,
  username: string,
  displayName: string,
  pac_number?: string
) => {
  let activityV1 = generateDBActivityPayload({}, null, type, subType);
  let activityV2 = populateSpeciesArrays(activityV1);
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
  activitySubtype: string
) {
  const id = uuidv4();
  const time = moment(new Date()).format();
  const short_id: string | undefined = getShortActivityID({
    activity_subtype: activitySubtype,
    activity_id: id,
    date_created: time
  });
  let returnVal = {
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
    reviewed_at: undefined
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
  let species_positive: any = [];
  let species_negative: any[] = [];
  let species_treated: any[] = [];

  const subtypeData = record?.form_data?.activity_subtype_data;

  switch (record.activity_subtype) {
    case ActivitySubtype.Observation_PlantTerrestrial:
      species_positive = subtypeData?.TerrestrialPlants?.filter((plant) =>
        plant.observation_type?.includes('Positive')
      ).map((plant) => plant.invasive_plant_code);
      species_negative = subtypeData?.TerrestrialPlants?.filter((plant) =>
        plant.observation_type?.includes('Negative')
      ).map((plant) => plant.invasive_plant_code);
      break;
    case ActivitySubtype.Observation_PlantAquatic:
      species_positive = subtypeData?.AquaticPlants?.filter((plant) =>
        plant.observation_type?.includes('Positive')
      ).map((plant) => plant.invasive_plant_code);
      species_negative = subtypeData?.AquaticPlants?.filter((plant) =>
        plant.observation_type?.includes('Negative')
      ).map((plant) => plant.invasive_plant_code);
      break;

    case ActivitySubtype.Activity_AnimalTerrestrial:
      // no species selection currently
      break;
    case ActivitySubtype.Activity_AnimalAquatic:
      species_treated = subtypeData?.invasive_aquatic_animals?.map((animal) => animal.invasive_animal_code);
      break;
    case ActivitySubtype.Treatment_ChemicalPlantAquatic:
      species_treated = subtypeData?.chemical_treatment_details?.invasive_plants?.map(
        (plant) => plant.invasive_plant_code
      );
      break;
    case ActivitySubtype.Treatment_ChemicalPlant:
      species_treated = subtypeData?.chemical_treatment_details?.invasive_plants?.map(
        (plant) => plant.invasive_plant_code
      );
      break;
    case ActivitySubtype.Treatment_MechanicalPlantAquatic:
      species_treated = subtypeData?.Treatment_MechanicalPlant_Information?.map((plant) => plant.invasive_plant_code);
      break;
    case ActivitySubtype.Treatment_MechanicalPlant:
      species_treated = subtypeData?.Treatment_MechanicalPlant_Information?.map((plant) => plant.invasive_plant_code);
      break;
    case ActivitySubtype.Treatment_BiologicalPlant:
      species_treated = subtypeData?.Biocontrol_Release_Information?.map((plant) => plant.invasive_plant_code);
      break;
    case ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant:
      species_treated = subtypeData?.Monitoring_ChemicalTerrestrialAquaticPlant_Information?.map((plantInfo) => {
        return plantInfo?.invasive_plant_code ? plantInfo?.invasive_plant_code : plantInfo?.invasive_plant_aquatic_code;
      });
      break;
    case ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant:
      species_treated = subtypeData?.Monitoring_MechanicalTerrestrialAquaticPlant_Information?.map((plantInfo) => {
        return plantInfo?.invasive_plant_code ? plantInfo?.invasive_plant_code : plantInfo?.invasive_plant_aquatic_code;
      });
      break;
    case ActivitySubtype.Monitoring_BiologicalTerrestrialPlant:
      species_treated = subtypeData?.Monitoring_BiocontrolRelease_TerrestrialPlant_Information?.map(
        (plantInfo) => plantInfo?.invasive_plant_code
      );
      break;
    case ActivitySubtype.Monitoring_BiologicalDispersal:
      species_treated = subtypeData?.Monitoring_BiocontrolDispersal_Information?.map(
        (plantInfo) => plantInfo?.invasive_plant_code
      );
      break;
    case ActivitySubtype.Transect_FireMonitoring:
      species_positive = subtypeData?.fire_monitoring_transect_lines
        ?.map((line) =>
          line.fire_monitoring_transect_points?.map((point) =>
            point.invasive_plants?.map((plant) => plant.invasive_plant_code)
          )
        )
        .flat(3);
      break;
    case ActivitySubtype.Transect_Vegetation:
      species_positive = subtypeData?.vegetation_transect_lines
        ?.map((line) =>
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
        .flat(3);
      break;
    case ActivitySubtype.Transect_BiocontrolEfficacy:
      species_positive = subtypeData?.transect_invasive_plants?.map((plant) => plant.invasive_plant_code) || [];
      break;
    case ActivitySubtype.Collection_Biocontrol:
      species_treated = subtypeData?.Biocontrol_Collection_Information?.map((plant) => plant.invasive_plant_code);
      break;
    default:
      break;
  }
  const returnVal = {
    ...record,
    species_positive:
      Array.from(new Set(species_positive || []))
        ?.filter((code) => typeof code === 'string')
        .sort() || [],
    species_negative:
      Array.from(new Set(species_negative || []))
        ?.filter((code) => typeof code === 'string')
        .sort() || [],
    species_treated:
      Array.from(new Set(species_treated || []))
        ?.filter((code) => typeof code === 'string')
        .sort() || []
  };
  return returnVal;
}
