/*
  Function to determine which fields to copy from provided activity_data/activity_type_data/activity_subtype_data
  and apply some filters based on the type of data 
*/
export function getFieldsToCopy(activityData: any, activitySubtypeData: any, activitySubtype?: string) {
  /*
    These fields are not being included because they are either read-only fields that are generated
    based on the geometry or editable fields that get autopopulated based on when the activity
    was created

    However, for monitorings, we do copy these fields over as well because they are identical to
    the treatment record they are referencing
  */
  const activityDataToCopy = { ...activityData };
  let activitySubtypeDataToCopy = {};

  delete activityDataToCopy.activity_date_time;

  if (activitySubtype) {
    if (activitySubtype.includes('Treatment')) {
      return activityDataToCopy;
    }

    /*
      When creating a treatment linked to a plant observation, we copy the invasive plant
      species from the subtype data to prevent/reduce data entry errors
    */
    if (activitySubtype.includes('Observation_Plant')) {
      activitySubtypeDataToCopy = { invasive_plant_code: activitySubtypeData.invasive_plants[0].invasive_plant_code };
    }
  }

  delete activityDataToCopy.latitude;
  delete activityDataToCopy.longitude;
  delete activityDataToCopy.reported_area;
  delete activityDataToCopy.utm_easting;
  delete activityDataToCopy.utm_northing;
  delete activityDataToCopy.utm_zone;

  return { activityData: activityDataToCopy, activitySubtypeData: activitySubtypeDataToCopy };
}
