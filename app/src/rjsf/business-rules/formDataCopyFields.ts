export function getFieldsToCopy(data: any, type: string) {
  if (type === 'Activity') {
    const { activity_date_time, latitude, longitude, reported_area, ...activityDataToCopy } = data;
    return activityDataToCopy;
  }

  return data;
}
