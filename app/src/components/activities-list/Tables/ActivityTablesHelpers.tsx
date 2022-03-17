export const mapActivitiesToDataGridRows = (activities) => {
  if (!activities) {
    return [];
  }
  if (activities.code) {
    return [];
  }
  return activities.rows.map((activity, index) => {
    return {
      //  id: index,
      short_id: activity?.activity_payload?.short_id,
      //  activity_type: activity?.activity_payload?.activity_type,
      //  activity_subtype:
      //  ActivitySubtypeShortLabels[
      //     activity?.activity_payload?.activity_subtype && activity?.activity_payload?.activity_subtype
      //    ],
      // date_created: new Date(activity?.activity_payload?.date_created).toString(),
      //  reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
      //   latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
      //    longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
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

export const activites_default_headers = [
  {
    key: 'short_id',
    name: 'Activity ID'
  },
  {
    key: 'activity_type',
    name: 'Activity Type'
  },
  {
    key: 'activity_subtype',
    name: 'Activity Sub Type'
  },
  {
    key: 'date_created',
    name: 'Date Created'
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
  {
    key: 'activity_id',
    name: 'Full ID'
  }
];
