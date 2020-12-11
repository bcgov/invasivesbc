/*
  Function to determine which fields to copy from provided activity_data/activity_type_data/activity_subtype_data
  and apply some filters based on the type of data 
*/
export function getFieldsToCopy(data: any, type: string) {
  if (type === 'Activity') {
    const { activity_date_time, latitude, longitude, reported_area, ...activityDataToCopy } = data;
    return activityDataToCopy;
  }

  return data;
}
