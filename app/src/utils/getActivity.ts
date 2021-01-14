export async function getActivityByIdFromApi(invasivesApi: any, activityId: any) {
  const response = await invasivesApi.getActivityById(activityId);

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
        response.media.map((media) => {
          return { filepath: media.file_name, dataUrl: media.encoded_file };
        })) ||
      []
  };
}
