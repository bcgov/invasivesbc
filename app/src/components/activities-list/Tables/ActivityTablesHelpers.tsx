import { ActivitySubtypeShortLabels } from 'constants/activities';

export interface ActivityRow {
  activity_id: string;
  short_id: string;
  type: string;
  sub_type: string;
  date_modified: string;
  created_by: string;
}

export const activites_default_headers = [
  {
    key: 'short_id',
    name: 'Activity ID'
  },
  {
    key: 'type',
    name: 'Activity Type'
  },
  {
    key: 'activity_subtype',
    name: 'Activity Sub Type'
  },
  {
    key: 'date_modified',
    name: 'Date Modified'
  },
  {
    key: 'reported_area',
    name: 'Area (m\u00B2)'
  },
  {
    key: 'latitude',
    name: 'Latitude'
  },
  {
    key: 'longitude',
    name: 'Longitude'
  },
  { key: 'created_by', name: 'Created By' }
];

export const mapActivitiesToDataGridRows = (activities) => {
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
      activity_subtype: ActivitySubtypeShortLabels[activity?.activity_payload?.activity_subtype],
      date_modified: new Date(activity?.activity_payload?.created_timestamp).toString(),
      //  reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
      //   latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
      //    longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
      activity_id: activity?.activity_id,
      created_by: activity?.created_by
    };
  });
};
