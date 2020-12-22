/*
  Function to determine which fields to copy from provided activity_data/activity_type_data/activity_subtype_data
  and apply some filters based on the type of data 
*/
export function getFieldsToCopy(data: any, dataField: string, activitySubtype?: string) {
  if (dataField === 'activity_data') {
    /*
      These fields are not being included because they are either read-only fields that are generated
      based on the geometry or editable fields that get autopopulated based on when the activity
      was created

      However, for monitorings, we do copy these fields over as well because they are identical to
      the treatment record they are referencing
    */
    const activityDataToCopy = { ...data };

    delete activityDataToCopy.activity_date_time;

    if (activitySubtype && activitySubtype.includes('Treatment')) {
      return activityDataToCopy;
    }

    delete activityDataToCopy.latitude;
    delete activityDataToCopy.longitude;
    delete activityDataToCopy.reported_area;

    return activityDataToCopy;
  }

  if (dataField === 'activity_subtype_data') {
    /*
      If we are copying fields from treatment subtype to monitoring
      check if plant type, copy over the invasive plant(s) field
    */
<<<<<<< HEAD
    if (activitySubtype && activitySubtype.includes('Treatment') && activitySubtype.includes('Plant')) {
      return { 'invasive_plants': data.invasive_plants || [{ 'invasive_plant_code': data.invasive_plant_code }] };
=======
    if (activitySubtype.includes('Treatment') && activitySubtype.includes('Plant')) {
      return { invasive_plants: data.invasive_plants || [{ invasive_plant_code: data.invasive_plant_code }] };
>>>>>>> dev
    }
  }

  return data;
}
