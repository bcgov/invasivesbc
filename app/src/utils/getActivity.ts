import { ICreateOrUpdateActivity } from '../interfaces/useInvasivesApi-interfaces';

/*
  Function that retrieves an activity based on an activityId by making a call to the API
*/
// DEPRECATED, HOPEFULLY
export async function getActivityByIdFromApi(api: any, activityId: any) {
  const response = await api.getActivityById(activityId);

  if (!response) {
    // TODO error messaging
    return;
  }

  return {
    _id: response.activity_id,
    activityId: response.activity_id,
    dateCreated: response.created_timestamp,
    activityType: response.activity_type,
    activitySubtype: response.activity_subtype,
    geometry: response.activity_payload.geometry,
    formData: response.activity_payload.form_data,
    photos:
      (response.media &&
        response.media.length &&
        response.media.map((media: any) => ({
          filepath: media.file_name,
          dataUrl: media.encoded_file
        }))) ||
      []
  };
}

/*
  Function to retrieve an ICreateOrUpdateActivity activity object based on a given activity
  and possibly custom formData
*/
// DEPRECATED, HOPEFULLY
export function getICreateOrUpdateActivity(activity: any, formData?: any): ICreateOrUpdateActivity {
  const activityDoc: ICreateOrUpdateActivity = {
    activity_id: activity.activityId,
    created_timestamp: activity.dateCreated,
    activity_type: activity.activityType,
    activity_subtype: activity.activitySubtype,
    geometry: activity.geometry,
    media: activity.photos.map((photo) => ({
      file_name: photo.filepath,
      encoded_file: photo.dataUrl
    })),
    form_data: formData || activity.formData
  };

  return activityDoc;
}
