/*
  Function to determine which fields to copy from provided activity_data/activity_type_data/activity_subtype_data
  and apply some filters based on the type of data 
*/
export function getFieldsToCopy(data: any, type: string) {
  if (type === 'Activity') {
    /*
      These fields are not being included because they are either read-only fields that are generated
      based on the geometry or editable fields that get autopopulated based on when the activity
      was created
    */
    const { activity_date_time, latitude, longitude, reported_area, ...activityDataToCopy } = data;

    return activityDataToCopy;
  }

  return data;
}
