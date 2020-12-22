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
import { IActivity } from 'interfaces/activity-interfaces';
import { getFieldsToCopy } from 'rjsf/business-rules/formDataCopyFields';

/*
  Function to create a new activity and save it to DB
  Newly created activity can be free-standing or linked to another activity
  If linked, the activity_id field which is present in the activity_type_data is populated to reference the linked activity record's id
  Also, the activity_data is populated based on business logic rules which specify which fields to copy
*/
export async function addActivityToDB(
  databaseContext: any,
  activityType: ActivityType,
  activitySubtype: ActivitySubtype,
  linkedRecord?: any
): Promise<IActivity> {
  const id = uuidv4();
  let formData: any;

  if (linkedRecord) {
    formData = {
      activity_data: {
        ...getFieldsToCopy(linkedRecord.formData.activity_data, 'activity_data', linkedRecord.activitySubtype),
        activity_date_time: moment(new Date()).format()
      },
      activity_type_data: {
        ...getFieldsToCopy(
          linkedRecord.formData.activity_subtype_data,
          'activity_subtype_data',
          linkedRecord.activitySubtype
        ),
        activity_id: linkedRecord._id
      }
    };
  } else {
    formData = {
      activity_data: {
        activity_date_time: moment(new Date()).format()
      }
    };
  }

  const geometry = linkedRecord ? linkedRecord.geometry : null;

  const doc: IActivity = {
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
    formStatus: FormValidationStatus.NOT_VALIDATED,
    geometry
  };

  await databaseContext.database.put(doc);

  return doc;
}
