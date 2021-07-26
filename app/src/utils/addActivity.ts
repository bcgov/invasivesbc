import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import {
  ActivityStatus,
  ActivitySyncStatus,
  FormValidationStatus,
  ReviewStatus,
  ActivitySubtype,
  ActivityType
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
}

export const activityDefaults = {
  doc_type: DocType.ACTIVITY,
  date_created: new Date(),
  media: undefined,
  created_by: undefined,
  sync_status: ActivitySyncStatus.NOT_SYNCED,
  form_status: FormValidationStatus.NOT_VALIDATED,
  review_status: ReviewStatus.NOT_REVIEWED,
  reviewed_by: undefined,
  reviewed_at: undefined
};

/*
AKA "IDGAF Record Formatter".  wraps an activity or doc or whatever and turns it into a format favoring DB-style
*/
export const sanitizeRecord = (input: any) => {
  if (typeof input !== 'object')
    throw "Okay, you have to at least give an object though"

  const soup : any = {
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
    ...mapKeys(input, snakeCase),
  };
  soup.activity_payload = {
    ...soup.activity_payload,
    form_data: {
      activity_data: {
        ...mapKeys(soup?.form_data?.activity_data, snakeCase),
        ...mapKeys(soup?.activity_payload?.formData?.activity_data, snakeCase),
      },
      activity_type_data: {
        ...mapKeys(soup?.form_data?.activity_type_data, snakeCase),
        ...mapKeys(soup?.activity_payload?.formData?.activity_type_data, snakeCase),
      },
      activity_subtype_data: {
        ...mapKeys(soup?.form_data?.activity_subtype_data, snakeCase),
        ...mapKeys(soup?.activity_payload?.formData?.activity_subtype_data, snakeCase),
      }
    }
  }

  if (soup.activity_id && soup.point_of_interest_id)
    throw "This is confusing.  A record should be an activity OR a POI";

  if (!soup.activity_id && !soup.point_of_interest_id) {
    if (soup.doc_type === DocType.ACTIVITY) {
      if (soup._id) soup.activity_id = soup._id;
      else {
        soup.activity_id = uuidv4();
        console.log("Generating a new id for activity", soup);
      }
    }

    if (soup.doc_type === DocType.POINT_OF_INTEREST || soup.doc_type === DocType.REFERENCE_POINT_OF_INTEREST) {
      if (soup._id) soup.point_of_interest_id = soup._id;
      // TODO else generate id
    }
    
    // throw "This should have an id of some sort.  Should we generate a new one here?";
  }

  if (soup.activity_id) {
    const now = moment(new Date()).format();
    const {
      activity_id,
      version,
      activity_type,                                                                                                        _type,
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
    } = soup;

    return {
      ...activityDefaults,

      // all the DB fields:
      activity_id,
      version,
      activity_type,                                                                                                        _type,
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
      created_timestamp: created_timestamp || soup.date_created || now,
      sync_status: sync_status || soup.sync?.status || ActivitySyncStatus.NOT_SYNCED,
      form_status: form_status ||FormValidationStatus.NOT_VALIDATED,
      geom: geom || soup.geometry || soup.activity_payload.geometry,
      geog: geog || soup.geography,
      
      // legacy: 
      /*
      form_data: {
        ...soup.form_data,
        activity_data: {
          ...soup.form_data?.activity_data,
          activity_date_time: now
        }
      },
      */
      activity_payload: {
        ...activity_payload,
        geom: geom || soup.geometry || activity_payload?.geometry,
        geog: geog || soup.geography,
        form_data: {
          ...activity_payload?.form_data,
          activity_data: {
            ...activity_payload?.form_data?.activity_data,
            activity_date_time: now
          }
        }
      },
      
      // legacy: dont actually care about these:
      status: soup.status || ActivityStatus.NEW,
      date_created: soup.date_created || now,
      date_updated: soup.date_updated || null,
      media: soup.photos?.map((photo) => ({
        file_name: photo.filepath,
        encoded_file: photo.dataUrl
      })),

      // gross mapping for yet another db api field...
      form_data: activity_payload?.form_data,
      geometry: geom || soup.geometry || activity_payload?.geometry,

    };
  }
};

/*
  Function to temporarily deal with a grievous oversight by initial devs who thought 
  naming variables differently in different contexts was a good idea.
  Note for future refactoring: favor DB representation.
*/
export const mapDocToDBActivity = (doc: any) => ({
  ...mapKeys(doc, snakeCase),
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

  return {
    _id: id,
    activityId: id,
    docType: DocType.ACTIVITY,
    activityType,
    activitySubtype,
    status: ActivityStatus.NEW,
    sync: {
      ready: false,
      status: ActivitySyncStatus.NOT_SYNCED,
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
  return {
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
    sync_status: ActivitySyncStatus.NOT_SYNCED,
    form_status: FormValidationStatus.NOT_VALIDATED,
    review_status: 'Not Reviewed',
    reviewed_by: undefined,
    reviewed_at: undefined
  };
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

/*
  Function to create a cloned activity and save it to DB
*/
export async function addClonedActivityToDB(databaseContext: any, clonedRecord: any) {
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

  await databaseContext.database.put(doc);

  return await databaseContext.database.get(doc._id);
}

/*
  Function to create a linked activity and save it to DB
  The activity_id field which is present in the form data is populated to reference the linked activity record's id
  Also, the activity_data is populated based on business logic rules which specify which fields to copy
*/
export async function addLinkedActivityToDB(
  databaseContext: any,
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

  await databaseContext.database.put(doc);

  return doc;
}
