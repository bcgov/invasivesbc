import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import {
  ActivityStatus,
  ActivitySyncStatus,
  FormValidationStatus,
  ReviewStatus,
  ActivitySubtype,
  ActivityType,
  ActivityLetter
} from 'constants/activities';
import { Feature } from 'geojson';
import { DocType } from 'constants/database';
import { IActivity } from 'interfaces/activity-interfaces';
import { getFieldsToCopy } from 'rjsf/business-rules/formDataCopyFields';
import { useInvasivesApi } from 'hooks/useInvasivesApi';

const camelCase = (str) => {
  return str
    .replace(/(\_\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+|\_/g, '');
};

const snakeCase = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const mapKeys = (source, mappingFunction) => {
  if (!source) return {};
  return Object.keys(source).reduce(
    (obj, key) => ({
      ...obj,
      [mappingFunction(key)]: source[key]
    }),
    {}
  );
};

export const getShortActivityID = (activity) => {
  const record: any = mapKeys(activity, snakeCase);
  if (!record?.activity_subtype || !record?.activity_id || !(record?.date_created || record.created_timestamp)) return;
  const shortYear = moment(record.date_created || record.created_timestamp).format().substr(2, 2);
  return shortYear + ActivityLetter[record.activity_subtype] + record.activity_id.substr(0, 4).toUpperCase();
};

export const activityDefaults = {
  doc_type: DocType.ACTIVITY,
  date_created: new Date(),
  media: undefined,
  created_by: undefined,
  sync_status: ActivitySyncStatus.NOT_SAVED,
  form_status: FormValidationStatus.NOT_VALIDATED,
  review_status: ReviewStatus.NOT_REVIEWED,
  reviewed_by: undefined,
  reviewed_at: undefined
};

/*
AKA "IDGAF Record Formatter".  wraps an activity or doc or whatever and turns it into a format favoring DB-style
*/
export const sanitizeRecord = (input: any) => {
  if (typeof input !== 'object') throw 'Okay, you have to at least give an object though';

  const flattened: any = {
    ...mapKeys(input?.formData, snakeCase),
    ...mapKeys(input?.formData?.point_of_interest_data, snakeCase),
    ...mapKeys(input?.formData?.point_of_interest_type_data, snakeCase),
    ...mapKeys(input?.formData?.point_of_interest_subtype_data, snakeCase),

    ...mapKeys(input?.form_data, snakeCase),
    ...mapKeys(input?.form_data?.point_of_interest_data, snakeCase),
    ...mapKeys(input?.form_data?.point_of_interest_type_data, snakeCase),
    ...mapKeys(input?.form_data?.point_of_interest_subtype_data, snakeCase),

    ...mapKeys(input?.activityPayload, snakeCase),
    ...mapKeys(input?.activity_payload, snakeCase),
    ...mapKeys(input, snakeCase)
  };
  flattened.activity_payload = {
    ...flattened.activity_payload,
    form_data: {
      activity_data: {
        ...mapKeys(flattened?.form_data?.activity_data, snakeCase),
        ...mapKeys(flattened?.activity_payload?.formData?.activity_data, snakeCase)
      },
      activity_type_data: {
        ...mapKeys(flattened?.form_data?.activity_type_data, snakeCase),
        ...mapKeys(flattened?.activity_payload?.formData?.activity_type_data, snakeCase)
      },
      activity_subtype_data: {
        ...mapKeys(flattened?.form_data?.activity_subtype_data, snakeCase),
        ...mapKeys(flattened?.activity_payload?.formData?.activity_subtype_data, snakeCase)
      }
    }
  };

  if (flattened.activity_id && flattened.point_of_interest_id)
    throw 'This is confusing.  A record should be an activity OR a POI';

  if (!flattened.activity_id && !flattened.point_of_interest_id) {
    if (!flattened.doc_type)
      throw 'Unknown Record type with no ID';

    if (flattened.doc_type === DocType.ACTIVITY) {
      if (flattened._id) flattened.activity_id = flattened._id;
      else {
        flattened.activity_id = uuidv4();
        flattened.date_created = flattened.date_created || moment(new Date()).format();
        flattened.short_id = flattened.short_id || getShortActivityID(flattened);
        // console.log('Generating a new id for activity', flattened);
      }
    }

    if (
      flattened.doc_type === DocType.POINT_OF_INTEREST ||
      flattened.doc_type === DocType.REFERENCE_POINT_OF_INTEREST
    ) {
      if (flattened._id) flattened.point_of_interest_id = flattened._id;
      // TODO else generate id
    }

    // throw "This should have an id of some sort.  Should we generate a new one here?";
  }

  if (flattened.activity_id) {
    const now = moment(new Date()).format();
    const {
      activity_id,
      version,
      activity_type,
      _type,
      activity_subtype,
      created_timestamp,
      received_timestamp,
      deleted_timestamp,
      geom,
      geog,
      media_keys,
      activity_payload,
      biogeoclimatic_zones,
      regional_invasive_species_organization_areas,
      invasive_plant_management_areas,
      ownership,
      regional_districts,
      flnro_districts,
      moti_districts,
      elevation,
      well_proximity,
      utm_zone,
      utm_northing,
      utm_easting,
      albers_northing,
      albers_easting,
      created_by,
      activity_incoming_data,
      form_status,
      sync_status,
      reviewed_by,
      reviewed_at,
      review_status,
      ...otherKeys
    } = flattened;

    return {
      ...activityDefaults,

      // all the DB fields:
      activity_id,
      version,
      activity_type,
      activity_subtype,
      received_timestamp,
      deleted_timestamp,
      media_keys,
      biogeoclimatic_zones,
      regional_invasive_species_organization_areas,
      invasive_plant_management_areas,
      ownership,
      regional_districts,
      flnro_districts,
      moti_districts,
      elevation,
      well_proximity,
      utm_zone,
      utm_northing,
      utm_easting,
      albers_northing,
      albers_easting,
      created_by,
      activity_incoming_data,
      reviewed_by,
      reviewed_at,
      review_status,

      // db-field overrides:
      created_timestamp: created_timestamp || flattened.date_created || now,
      sync_status: sync_status || flattened.sync?.status || ActivitySyncStatus.NOT_SAVED,
      form_status: form_status || FormValidationStatus.NOT_VALIDATED,
      geom: geom || flattened.geometry || flattened.activity_payload.geometry,
      geog: geog || flattened.geography,
      short_id: flattened.short_id || getShortActivityID(flattened),

      // legacy:
      /*
      form_data: {
        ...flattened.form_data,
        activity_data: {
          ...flattened.form_data?.activity_data,
          activity_date_time: now
        }
      },
      */
      _id: activity_id,
      activity_payload: {
        ...activity_payload,
        geom: geom || flattened.geometry || activity_payload?.geometry,
        geog: geog || flattened.geography,
        form_data: {
          ...activity_payload?.form_data,
          activity_data: {
            ...activity_payload?.form_data?.activity_data,
            activity_date_time: flattened.date_created || now
          }
        }
      },

      // legacy: dont actually care about these:
      status: flattened.status || ActivityStatus.NEW,
      date_created: flattened.date_created || now,
      date_updated: flattened.date_updated || flattened.date_created || null,
      media: flattened.photos?.map((photo) => ({
        file_name: photo.filepath,
        encoded_file: photo.dataUrl
      })),

      // gross mapping for yet another db api field...
      form_data: activity_payload?.form_data,
      geometry: geom || flattened.geometry || activity_payload?.geometry
    };
  }

  // TODO handle POIs
};

/*
  Function to temporarily deal with a grievous oversight by initial devs who thought 
  naming variables differently in different contexts was a good idea.
  Note for future refactoring: favor DB representation.
*/
export const mapDocToDBActivity = (doc: any) => ({
  ...mapKeys(doc, snakeCase),
  _id: doc._id || doc.activity_id,
  sync_status: doc.sync?.status,
  media: doc.photos?.map((photo) => ({
    file_name: photo.filepath,
    encoded_file: photo.dataUrl
  }))
});

/*
  Function to temporarily deal with a grievous oversight by initial devs who thought 
  naming variables differently in different contexts was a good idea.
  Note for future refactoring: favor DB representation.
*/
export const mapDBActivityToDoc = (dbActivity: any) => {
  const { _id, ...otherKeys } = dbActivity;
  let doc: any = {
    ...generateActivityPayload(
      dbActivity.form_data,
      dbActivity.geometry,
      dbActivity.activity_type,
      dbActivity.activity_subtype
    ),
    ...mapKeys(otherKeys, camelCase)
  };
  doc = {
    ...doc,
    ...mapKeys(dbActivity.activity_payload, camelCase),
    sync: {
      ...doc.sync,
      ...dbActivity.activity_payload?.sync,
      status: dbActivity.sync_status
    },
    _id: dbActivity.activity_id
  };
  return doc;
};

/*
  Function to generate activity payload for a new activity (in old pouchDB doc format)
*/
export function generateActivityPayload(
  formData: any,
  geometry: Feature[],
  activityType: ActivityType,
  activitySubtype: ActivitySubtype
): IActivity {
  const id = uuidv4();
  const short_id: string = getShortActivityID({
    activity_subtype: activitySubtype,
    activity_id: id,
    date_created: new Date()
  });
  return {
    _id: id,
    shortId: short_id,
    activityId: id,
    docType: DocType.ACTIVITY,
    activityType,
    activitySubtype,
    status: ActivityStatus.NEW,
    sync: {
      ready: false,
      status: ActivitySyncStatus.NOT_SAVED,
      error: null
    },
    dateCreated: new Date(),
    dateUpdated: null,
    formData,
    formStatus: FormValidationStatus.NOT_VALIDATED,
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
  return {
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
      }
    },
    media: undefined,
    created_by: undefined,
    sync_status: ActivitySyncStatus.NOT_SAVED,
    form_status: FormValidationStatus.NOT_VALIDATED,
    review_status: 'Not Reviewed',
    reviewed_by: undefined,
    reviewed_at: undefined
  };
}

export function cloneDBRecord(dbRecord) {
  const id = uuidv4();
  const time = moment(new Date()).format();
  const clonedRecord = {
    ...dbRecord,
    _id: id,
    date_created: time,
    date_updated: null,
    status: ActivityStatus.NEW,
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
    status: ActivityStatus.NEW,
    activityId: id
  };

  return doc;

  // await databaseContext.database.put(doc);
  //return await databaseContext.database.get(doc._id);
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

  // await databaseContext.database.put(doc);

  return doc;
}

// extract and set the species codes (both positive and negative) of a given activity (or POI, once they're editable)
export function populateSpeciesArrays(record) {
  
  let species_positive = [];
  let species_negative = [];
  const subtypeData = record?.formData?.activity_subtype_data;
  
  switch (record.activitySubtype) {
    case ActivitySubtype.Observation_PlantTerrestrial:
      species_positive = subtypeData?.invasive_plants?.
        filter((plant) => plant.occurrence?.includes('Positive'))
        .map((plant) =>  plant.invasive_plant_code);
      species_negative = subtypeData?.invasive_plants?.
        filter((plant) => plant.occurrence?.includes('Negative'))
        .map((plant) => plant.invasive_plant_code);
      break;
    case ActivitySubtype.Observation_PlantAquatic:
      species_positive = subtypeData?.invasive_plants?.
        filter((plant) => plant.observation_type?.includes('Positive'))
        .map((plant) =>  plant.invasive_plant_code);
      species_negative = subtypeData?.invasive_plants?.
        filter((plant) => plant.observation_type?.includes('Negative'))
        .map((plant) => plant.invasive_plant_code);
      break;

    case ActivitySubtype.Activity_AnimalTerrestrial:
      // no species selection currently
      break;
    case ActivitySubtype.Activity_AnimalAquatic:
      species_positive = subtypeData?.invasive_aquatic_animals?.map(
        (animal) => animal.invasive_animal_code
      );
      break;

    case ActivitySubtype.Treatment_ChemicalPlant:
      species_positive = subtypeData?.treatment_information?.invasive_plants_information?.map((plant) => plant.invasive_plant_code);
      break;
    case ActivitySubtype.Treatment_MechanicalPlant:
    case ActivitySubtype.Treatment_BiologicalPlant:
    case ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant:
    case ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant:
    case ActivitySubtype.Monitoring_BiologicalTerrestrialPlant:
    case ActivitySubtype.Activity_BiologicalDispersal:
      species_positive = [subtypeData?.invasive_plant_code];
      break;

    case ActivitySubtype.Transect_FireMonitoring:
      species_positive = subtypeData?.fire_monitoring_transect_lines?.map(
        (line) => line.fire_monitoring_transect_points?.map(
          (point) => point.invasive_plants?.map(
            (plant) => plant.invasive_plant_code
          )
        )
      ).flat(3);
      break;
    case ActivitySubtype.Transect_Vegetation:
      species_positive = subtypeData?.vegetation_transect_lines?.map(
        (line) => [
          line.vegetation_transect_points_percent_cover,
          line.vegetation_transect_points_number_plants,
          line.vegetation_transect_points_daubenmire
        ]
        .flat(2)
        .filter((point) => point)
        .map((point) => point.vegetation_transect_species?.invasive_plants?.map(
          (plant) => plant.invasive_plant_code
        ))
      ).flat(3);
      break;
    case ActivitySubtype.Transect_BiocontrolEfficacy:
      species_positive = subtypeData?.transect_invasive_plants?.map(
        (plant) => plant.invasive_plant_code
      ) || [];
      break;
    default:
      break;
  }
  console.log(3333, species_positive, species_negative);
  return {
    ...record,
    species_positive: Array.from(new Set(species_positive || []))?.
      filter((code) => typeof code === 'string')
      .sort() || [],
    species_negative: Array.from(new Set(species_negative || []))?.
      filter((code) => typeof code === 'string')
      .sort() || []
  }
}
