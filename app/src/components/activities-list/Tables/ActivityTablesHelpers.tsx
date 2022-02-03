import { GridColDef } from '@mui/x-data-grid';
import { ActivitySubtypeShortLabels } from 'constants/activities';

export const mapActivitiesToDataGridRows = (activities) => {
  return activities.rows.map((activity, index) => {
    return {
      id: index,
      short_id: activity?.activity_payload?.short_id,
      activity_type: activity?.activity_payload?.activity_type,
      activity_subtype:
        ActivitySubtypeShortLabels[
          activity?.activity_payload?.activity_subtype && activity?.activity_payload?.activity_subtype
        ],
      date_created: new Date(activity?.activity_payload?.date_created).toString(),
      reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
      latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
      longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
      activity_id: activity?.activity_id
    };
  });
};

// const createAction = (type: string, subtype: string) => ({
//   key: `create_${subtype.toString().toLowerCase()}`,
//   enabled: true,
//   action: async (selectedRows) => {
//     const dbActivity = generateDBActivityPayload({}, null, type, subtype);
//     dbActivity.created_by = userInfo?.preferred_username;
//     dbActivity.user_role = userRoles?.map((role) => role.role_id);
//     await dataAccess.createActivity(dbActivity, databaseContext);
//     await dataAccess.setAppState({ activeActivity: dbActivity.activity_id }, databaseContext);
//     setTimeout(() => {
//       history.push({ pathname: `/home/activity` });
//     }, 500);
//   },
//   icon: <Add />,
//   label: ActivitySubtypeShortLabels[subtype],
//   bulkAction: false,
//   rowAction: false,
//   globalAction: true,
//   triggerReload: true,
//   displayInvalid: 'error',
//   ...actions?.create_activity // allow prop overwrites by defaulto
// });

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
