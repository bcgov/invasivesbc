import { GridColDef } from '@mui/x-data-grid';

export const mapActivitiesToDataGridRows = (activities) => {
  return activities.rows.map((activity, index) => {
    return {
      id: index,
      short_id: activity?.activity_payload?.short_id,
      activity_type: activity?.activity_payload?.activity_type,
      activity_subtype:
        activity?.activity_payload?.activity_subtype && activity?.activity_payload?.activity_subtype.replace('_', ' '),
      date_created: new Date(activity?.activity_payload?.date_created).toString(),
      reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
      latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
      longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
      activity_id: activity?.activity_id
    };
  });
};

export const activites_default_headers: GridColDef[] = [
  {
    field: 'short_id',
    headerName: 'Activity ID',
    width: 150
  },
  {
    field: 'activity_type',
    headerName: 'Activity Type',
    width: 150
  },
  {
    field: 'activity_subtype',
    headerName: 'Activity Sub Type',
    width: 300
  },
  {
    field: 'date_created',
    headerName: 'Date Created',
    width: 400
  },
  {
    field: 'reported_area',
    headerName: 'Area (m\u00B2)',
    width: 150
  },
  {
    field: 'latitude',
    headerName: 'Latitude',
    width: 150
  },
  {
    field: 'longitude',
    headerName: 'Longitude',
    width: 150
  },
  {
    field: 'activity_id',
    headerName: 'Full ID',
    width: 350
  }
];
