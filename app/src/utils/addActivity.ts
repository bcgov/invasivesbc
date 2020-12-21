import { v4 as uuidv4 } from 'uuid';
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

  const formData = !linkedRecord
    ? null
    : {
        activity_data: getFieldsToCopy(linkedRecord.formData.activity_data, 'activity_data'),
        activity_type_data: {
          ...getFieldsToCopy(
            linkedRecord.formData.activity_subtype_data,
            'activity_subtype_data',
            linkedRecord.activitySubtype
          ),
          activity_id: linkedRecord._id
        }
      };

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
    formStatus: FormValidationStatus.NOT_VALIDATED
  };

  await databaseContext.database.put(doc);

  return doc;
}
