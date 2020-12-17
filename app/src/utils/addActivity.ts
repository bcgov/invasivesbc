import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import {
  ActivityStatus,
  ActivitySyncStatus,
  FormValidationStatus,
  ActivitySubtype,
  ActivityType
} from 'constants/activities';
import { DocType } from 'constants/database';

export async function addActivityToDB(databaseContext: any, activityType: ActivityType, activitySubtype: ActivitySubtype, linkedRecordId?: string) {
  const id = uuidv4();
  const formData = !linkedRecordId
    ? null
    : {
        activity_data: {
          activity_date_time: moment(new Date()).format(),
        },
        activity_type_data: {
          activity_id: linkedRecordId
        }
      };

  const doc = {
    _id: id,
    activityId: id,
    docType: DocType.ACTIVITY,
    activityType: activityType,
    activitySubtype: activitySubtype,
    status: ActivityStatus.NEW,
    sync: {
      ready: false,
      status: ActivitySyncStatus.NOT_SYNCED,
      error: null
    },
    dateCreated: new Date(),
    dateUpdated: null,
    formData,
    formStatus: FormValidationStatus.NOT_VALIDATED
  };

  await databaseContext.database.put(doc);

  return doc;
}
