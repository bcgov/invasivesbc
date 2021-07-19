import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import {
  ActivityStatus,
  ActivitySyncStatus,
  FormValidationStatus,
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

const mapKeys = (source, mappingFunction) =>
  Object.keys(source).reduce(
    (obj, key) => ({
      ...obj,
      [mappingFunction(key)]: source[key]
    }),
    {}
  );

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
    ...mapKeys(doc.activityPayload, camelCase),
    sync: {
      ...doc.sync,
      ...doc.activityPayload?.sync,
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
  activityType: ActivityType,
  activitySubtype: ActivitySubtype
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
