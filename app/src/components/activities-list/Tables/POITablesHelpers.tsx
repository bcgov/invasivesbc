export interface POI_IAPP_Row {
  site_id: number;
  date_modified: string;
}

export const point_of_interest_iapp_default_headers = [
  {
    key: 'site_id',
    name: 'IAPP Site ID'
  },
  {
    key: 'date_modified',
    name: 'Date Modified'
  }
];

export const mapPOI_IAPP_ToDataGridRows = (activities) => {
  if (!activities) {
    return [];
  }
  if (activities.code) {
    return [];
  }

  return activities?.rows?.map((activity, index) => {
    return {
      //  id: index,
      short_id: activity?.activity_payload?.short_id,
      type: activity?.activity_payload?.activity_type,
      //      activity_type:
      date_modified: new Date(activity?.activity_payload?.created_timestamp).toString(),
      //  reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
      //   latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
      //    longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
      activity_id: activity?.activity_id,
      created_by: activity?.created_by
    };
  });
};
