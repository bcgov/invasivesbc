import { ActivitySubtypeShortLabels } from "sharedAPI/src/constants";


export const getUnnestedFieldsForActivity = (activity) =>  {
    const getArrayString = (inputArray: [], subProp?) => {
      let output = ''
      if (subProp) {
        inputArray.map((item, index) => {
          if (item?.[subProp]) {
            output += item?.[subProp];
            if (index < inputArray.length - 1) output += ', ';
          }
        })
      } else {
        inputArray.map((item) => {
          output += ', ' + item
        })
      }
      return output
    }

    //console.dir(activity)
    console.log(activity?.activity_type)
    let columns: any = {
      // id: index,
      activity_id: activity?.activity_id,
      short_id: activity?.activity_payload?.short_id,
      type: activity?.activity_type,
      subtype: ActivitySubtypeShortLabels[activity?.activity_payload?.activity_subtype],
      activity_date: new Date(activity?.activity_payload?.form_data?.activity_data?.activity_date_time).toString(),
      project_code: getArrayString(Array.isArray(activity?.activity_payload?.form_data?.activity_data?.project_code) ? activity?.activity_payload?.form_data?.activity_data?.project_code : [], 'description'),
      jurisdiction: activity?.jurisdiction_display,
      species_positive: activity?.species_positive_full,
      species_negative: activity?.species_negative_full,
      has_current_positive: activity?.has_current_positive ? 'Yes' : 'No',
      current_positive: activity?.current_positive_species,
      has_current_negative: activity?.has_current_negative ? 'Yes' : 'No',
      current_negative: activity?.current_negative_species,
      species_treated: activity?.species_treated_full,
      created_by: activity?.created_by,
      updated_by: activity?.updated_by,
      agency: activity?.agency,
      regional_invasive_species_organization_areas: activity?.regional_invasive_species_organization_areas,
      regional_districts: activity?.regional_districts,
      biogeoclimatic_zones: activity?.biogeoclimatic_zones,
      elevation: activity?.elevation,
      batch_id: activity?.batch_id
      // date_modified: new Date(activity?.activity_payload?.created_timestamp).toString(),
      // reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
      // latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
      // longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
    }

    console.log(columns?.type)
    return JSON.parse(JSON.stringify(columns))
};