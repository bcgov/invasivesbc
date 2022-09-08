import {
  ActivityLetter,
  ActivityStatus,
  ActivitySubtype,
  ActivitySyncStatus,
  ActivityType,
  ReviewStatus
} from '../constants/activities';
import { DocType } from '../constants/database';
import { Feature } from 'geojson';
import { IActivity } from '../interfaces/activity-interfaces';
import moment from 'moment';
import { getFieldsToCopy } from '../rjsf/business-rules/formDataCopyFields';
import { v4 as uuidv4 } from 'uuid';

export const getShortActivityID = (activity) => {
  if (!activity?.activity_subtype || !activity?.activity_id || !(activity?.date_created || activity.created_timestamp))
    return;
  const shortYear = moment(activity.date_created || activity.created_timestamp)
    .format()
    .substr(2, 2);
  return shortYear + ActivityLetter[activity.activity_subtype] + activity.activity_id.substr(0, 4).toUpperCase();
};

export const activityDefaults = {
  doc_type: DocType.ACTIVITY,
  date_created: new Date(),
  media: undefined,
  created_by: undefined,
  user_role: undefined,
  sync_status: ActivitySyncStatus.NOT_SAVED,
  form_status: ActivityStatus.DRAFT,
  review_status: ReviewStatus.NOT_REVIEWED,
  reviewed_by: undefined,
  reviewed_at: undefined
};

/*
  Function to generate activity payload for a new activity (in old pouchDB doc format)
*/
export function generateActivityPayload(
  formData: any,
  geometry: Feature[],
  activityType: ActivityType,
  activitySubtype: ActivitySubtype,
  docType?: DocType
): IActivity {
  const id = uuidv4();
  const short_id: string = getShortActivityID({
    activity_subtype: activitySubtype,
    activity_id: id,
    date_created: new Date()
  });
  return {
    _id: id,
    id: id,
    shortId: short_id,
    activityId: id,
    docType: docType,
    activityType,
    activitySubtype,
    status: ActivityStatus.DRAFT,
    sync: {
      ready: false,
      status: ActivitySyncStatus.NOT_SAVED,
      error: null
    },
    dateCreated: new Date(),
    dateUpdated: null,
    formData,
    formStatus: ActivityStatus.DRAFT,
    geometry
  };
}

/*
  Function to generate activity payload for a new activity (in old pouchDB doc format)
*/
export function generateDBActivityPayload(
  formData: any,
  geometry: Feature[],
  activityType: string,
  activitySubtype: string
) {
  const id = uuidv4();
  const time = moment(new Date()).format();
  const short_id: string = getShortActivityID({
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
    user_role: undefined,
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
    returnVal.form_data.activity_subtype_data.Biocontrol_Collection_Information = [
      {
        actual_quantity_and_life_stage_of_agent_collected: [{}],
        estimated_quantity_and_life_stage_of_agent_collected: [{}]
      }
    ];
  }
  if (returnVal.activity_subtype === ActivitySubtype.Treatment_BiologicalPlant) {
    returnVal.form_data.activity_subtype_data.Biocontrol_Release_Information = {
      actual_biological_agents: [{}],
      estimated_biological_agents: [{}]
    };
  }
  if (returnVal.activity_subtype === ActivitySubtype.Monitoring_BiologicalDispersal) {
    returnVal.form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information = {
      actual_biological_agents: [{}],
      estimated_biological_agents: [{}]
    };
  }
  return returnVal;
}

export function cloneDBRecord(dbRecord) {
  const id = uuidv4();
  const time = moment(new Date()).format();
  const clonedRecord = {
    ...dbRecord,
    _id: id,
    date_created: time,
    date_updated: null,
    status: ActivityStatus.DRAFT,
    activity_id: id
  };
  clonedRecord.short_id = getShortActivityID(clonedRecord);
  return clonedRecord;
}

/*
  Function to create a brand new activity and save it to the DB
*/
export async function addNewActivityToDB(
  databaseContext: any,
  activityType: ActivityType,
  activitySubtype: ActivitySubtype
): Promise<IActivity> {
  const formData = {
    activity_data: {
      activity_date_time: moment(new Date()).format()
    }
  };
  const doc: IActivity = generateActivityPayload(formData, null, activityType, activitySubtype);

  await databaseContext.database.put(doc);
  return doc;
}

export async function cloneActivity(clonedRecord: any) {
  const id = uuidv4();

  // Used to avoid pouch DB conflict
  delete clonedRecord._rev;

  const doc: any = {
    ...clonedRecord,
    _id: id,
    dateCreated: new Date(),
    dateUpdated: null,
    status: ActivityStatus.DRAFT,
    activityId: id
  };

  return doc;
}

/*
  Function to format a linked activity object
  The activity_id field which is present in the form data is populated to reference the linked activity record's id
  Also, the activity_data is populated based on business logic rules which specify which fields to copy
*/
export async function createLinkedActivity(
  activityType: ActivityType,
  activitySubtype: ActivitySubtype,
  linkedRecord: any
): Promise<IActivity> {
  const { activityData, activitySubtypeData } = getFieldsToCopy(
    linkedRecord.formData.activity_data,
    linkedRecord.formData.activity_subtype_data,
    linkedRecord.activitySubtype
  );

  let formData: any = {
    activity_data: {
      ...activityData,
      activity_date_time: moment(new Date()).format()
    },
    activity_subtype_data: {
      ...activitySubtypeData
    }
  };
  const geometry = linkedRecord.geometry;

  /*
    Since chemical plant treatments are different and do not have activity_type_data
    the linked record activity id field is present in the activity_subtype_data
  */
  if (activitySubtype === ActivitySubtype.Treatment_ChemicalPlant) {
    formData.activity_subtype_data = {
      ...formData.activity_subtype_data,
      activity_id: linkedRecord._id
    };
  } else {
    formData.activity_type_data = { activity_id: linkedRecord._id };
  }

  const doc: IActivity = generateActivityPayload(formData, geometry, activityType, activitySubtype);

  return doc;
}

// extract and set the species codes (both positive and negative) of a given activity (or POI, once they're editable)
export function populateSpeciesArrays(record) {
  let species_positive = [];
  let species_negative = [];
  let species_treated = [];
  const subtypeData = record?.form_data?.activity_subtype_data;

  switch (record.activity_subtype) {
    case ActivitySubtype.Observation_PlantTerrestrial:
      species_positive = subtypeData?.TerrestrialPlants?.filter((plant) => plant.occurrence?.includes('Positive')).map(
        (plant) => plant.invasive_plant_code
      );
      species_negative = subtypeData?.TerrestrialPlants?.filter((plant) => plant.occurrence?.includes('Negative')).map(
        (plant) => plant.invasive_plant_code
      );
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
      species_treated = [subtypeData?.Biocontrol_Release_Information?.invasive_plant_code];
      break;
    case ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant:
      species_treated = [subtypeData?.Monitoring_ChemicalTerrestrialAquaticPlant_Information?.invasive_plant_code];
      break;
    case ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant:
      // DOn't know the path record borked
      break;
    case ActivitySubtype.Monitoring_BiologicalTerrestrialPlant:
      // DOn't know the path record borked
      break;
    case ActivitySubtype.Monitoring_BiologicalDispersal:
      species_positive = [subtypeData?.Monitoring_BiocontrolDispersal_Information?.invasive_plant_code];
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
      species_treated = subtypeData?.Biocontrol_Collection_Information?.map((plant) => plant.invasive_plant_code) || [];
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
