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

/*
  Function to generate activity payload for a new activity
*/
function generateActivityPayload(
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
export async function addClonedActivityToDB(
  databaseContext: any,
  clonedRecord: any
) {
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

  return doc;
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
  let formData: any = {
    activity_data: {
      ...getFieldsToCopy(linkedRecord.formData.activity_data, linkedRecord.activitySubtype),
      activity_date_time: moment(new Date()).format()
    }
  };
  const geometry = linkedRecord.geometry;

  /*
    Since chemical plant treatments are different and do not have activity_type_data
    the linked record activity id field is present in the activity_subtype_data
  */
  if (activitySubtype === ActivitySubtype.Treatment_ChemicalPlant) {
    formData.activity_subtype_data = { activity_id: linkedRecord._id };
  } else {
    formData.activity_type_data = { activity_id: linkedRecord._id };
  }

  const doc: IActivity = generateActivityPayload(formData, geometry, activityType, activitySubtype);

  await databaseContext.database.put(doc);

  return doc;
}
