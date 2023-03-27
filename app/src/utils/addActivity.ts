
import { DocType } from '../constants/database';
import { Feature } from 'geojson';
import { IActivity } from '../interfaces/activity-interfaces';
import moment from 'moment';
import { getFieldsToCopy } from '../rjsf/business-rules/formDataCopyFields';
import { v4 as uuidv4 } from 'uuid';
import { ActivityStatus, ActivitySubtype, ActivitySyncStatus, ActivityType, getShortActivityID, ReviewStatus } from 'sharedLibWithAPI/activityCreate';



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

/*
  function to determine if a Monitoring activity subtype requires a linked treatment ID.
*/
export function isLinkedTreatmentSubtype(subType:ActivitySubtype): boolean {
  return ([
    ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant,
    ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant,
    ActivitySubtype.Monitoring_BiologicalTerrestrialPlant
  ].includes(subType));
}
// extract and set the species codes (both positive and negative) of a given activity (or POI, once they're editable)

export function populateJurisdictionArray(record) {
  const jurisdictions = record?.form_data?.activity_data?.jurisdictions;

  let jurisdiction = [];
  if (jurisdictions) {
    jurisdiction = jurisdictions?.map((j) => {
      return j.jurisdiction_code;
    });
  } else {
    return record;
  }

  return {
    ...record,
    jurisdiction: jurisdiction.sort() || []
  };
}
