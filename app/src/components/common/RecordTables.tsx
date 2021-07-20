import { makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import moment from 'moment';
import {
  ActivitySubtype,
  ActivityType,
  ActivitySubtypeShortLabels,
  ActivitySyncStatus,
  FormValidationStatus,
  ReviewStatus
} from 'constants/activities';
import { DocType, DEFAULT_PAGE_SIZE } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Add, DeleteForever, Sync, Edit, Delete, FindInPage, Check, Clear } from '@material-ui/icons';
import React, { useContext, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { useKeycloak } from '@react-keycloak/web';
import {
  addLinkedActivityToDB,
  addNewActivityToDB,
  generateDBActivityPayload,
  mapDocToDBActivity
} from 'utils/addActivity';
import RecordTable, { IRecordTable } from 'components/common/RecordTable';
import { notifyError, notifySuccess } from 'utils/NotificationUtils';

export const activityStandardMapping = (doc) => ({
  ...doc,
  ...doc?.formData?.activity_data,
  ...doc?.formData?.activity_subtype_data,
  activity_id: doc.activity_id, // NOTE: activity_subtype_data.activity_id is overwriting this incorrectly
  jurisdiction_code: doc?.formData?.activity_data?.jurisdictions?.reduce(
    (output, jurisdiction) => [...output, jurisdiction.jurisdiction_code, '(', jurisdiction.percent_covered + '%', ')'],
    []
  ),
  created_timestamp: doc?.created_timestamp?.substring(0, 10),
  latitude: parseFloat(doc?.formData?.activity_data?.latitude).toFixed(6),
  longitude: parseFloat(doc?.formData?.activity_data?.longitude).toFixed(6),
  review_status_rendered:
    doc?.review_status === ReviewStatus.APPROVED || doc?.review_status === ReviewStatus.DISAPPROVED
      ? doc?.review_status + ' by ' + doc?.reviewed_by + ' at ' + doc?.reviewed_at
      : doc?.review_status
});

export const poiStandardMapping = (doc) => ({
  ...doc,
  ...doc?.formData?.point_of_interest_data,
  ...doc?.formData?.point_of_interest_type_data,
  jurisdiction_code: doc?.formData?.surveys?.[0]?.jurisdictions?.reduce(
    (output, jurisdiction) => [
      ...output,
      jurisdiction.jurisdiction_code,
      '(',
      (jurisdiction.percent_covered ? jurisdiction.percent_covered : 100) + '%',
      ')'
    ],
    []
  ),
  latitude: parseFloat(doc?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[1]).toFixed(6),
  longitude: parseFloat(doc?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0]).toFixed(6)
});

export const poiStandardDBMapping = (doc) => ({
  ...doc,
  ...doc.point_of_interest_payload?.form_data?.point_of_interest_data,
  ...doc.point_of_interest_payload?.form_data?.point_of_interest_type_data,
  jurisdiction_code: doc.point_of_interest_payload?.form_data?.surveys?.[0]?.jurisdictions?.reduce(
    (output, jurisdiction) => [
      ...output,
      jurisdiction.jurisdiction_code,
      '(',
      (jurisdiction.percent_covered ? jurisdiction.percent_covered : 100) + '%',
      ')'
    ],
    []
  ),
  latitude: parseFloat(doc?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[1]).toFixed(6),
  longitude: parseFloat(doc?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0]).toFixed(6),
  // pulling these from plan my trip:
  _id: 'POI' + doc.point_of_interest_id,
  docType: DocType.REFERENCE_POINT_OF_INTEREST,
  //trip_IDs: doc?.trip_IDs ? [...doc.trip_IDs, props.trip_ID] : [props.trip_ID],
  formData: doc.point_of_interest_payload?.form_data,
  pointOfInterestType: doc.point_of_interest_type,
  pointOfInterestSubtype: doc.point_of_interest_subtype,
  geometry: [...doc.point_of_interest_payload.geometry]
});

/**
 *
 * @param {ActivitySubtype} treatmentSubtype The treatment subtype for which to get the associated monitoring subtype
 */
const calculateMonitoringSubtypeByTreatmentSubtype = (treatmentSubtype: ActivitySubtype): ActivitySubtype => {
  /*
    Note: There is no explicit subtype for biological dispersal plant monitoring
    If this needs to be present, it needs to be created and defined in API spec
  */
  let monitoringSubtype: ActivitySubtype;

  if (treatmentSubtype.includes('ChemicalPlant')) {
    monitoringSubtype = ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant;
  } else if (treatmentSubtype.includes('MechanicalPlant')) {
    monitoringSubtype = ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant;
  } else if (treatmentSubtype.includes('BiologicalPlant')) {
    monitoringSubtype = ActivitySubtype.Monitoring_BiologicalTerrestrialPlant;
  } else {
    monitoringSubtype = ActivitySubtype[`Monitoring_${treatmentSubtype.split('_')[2]}`];
  }

  return monitoringSubtype;
};

const arrayWrap = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const useStyles = makeStyles((theme: Theme) => ({
  activitiesContent: {},
  activityList: {},
  activitiyListItem: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    border: '1px solid',
    borderColor: theme.palette.grey[300],
    borderRadius: '6px'
  },
  activityListItem_Grid: {
    flexWrap: 'nowrap',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  activitiyListItem_Typography: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline',
      marginRight: '1rem'
    }
  },
  formControl: {
    minWidth: 180
  },
  map: {
    height: 500,
    width: '100%',
    zIndex: 0
  },
  metabaseAddButton: {
    marginLeft: 10,
    marginRight: 10
  }
}));

export const defaultActivitiesFetch =
  ({ invasivesApi, activitySubtypes, created_by }) =>
  async ({ page, rowsPerPage, order }) => {
    // Fetches fresh from the API (web).  TODO fetch from SQLite
    let dbPageSize = DEFAULT_PAGE_SIZE;
    if (dbPageSize - ((page * rowsPerPage) % dbPageSize) < 3 * rowsPerPage)
      // if page is right near the db page limit
      dbPageSize = (page * rowsPerPage) % dbPageSize; // set the limit to the current row count instead

    const types = activitySubtypes.map((subtype) => subtype[0]);
    const subtypes = activitySubtypes.map((subtype) => subtype[1]);
    const result = await invasivesApi.getActivities({
      page: Math.floor((page * rowsPerPage) / dbPageSize),
      limit: dbPageSize,
      order: order,
      // search_feature: geometry TODO
      activity_type: arrayWrap(types),
      activity_subtype: arrayWrap(subtypes),
      // startDate, endDate will be filters
      created_by: created_by // my_keycloak_id
    });
    return {
      rows: result.rows.map(activityStandardMapping),
      count: result.count
    };
  };

export interface IActivitiesTable extends IRecordTable {
  workflow?: string;
  activitySubtypes?: any[];
  created_by?: string;
}

export const ActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const history = useHistory();
  const invasivesApi = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext);
  const { keycloak } = useKeycloak();
  const userInfo: any = keycloak?.userInfo;

  const {
    tableSchemaType,
    actions,
    rows,
    activitySubtypes,
    created_by,
    keyField = 'activity_id',
    enableSelection = true,
    ...otherProps
  } = props;

  let createActions = {};
  const createAction = (type, subtype) => ({
    key: `create_activity_${subtype.toLowerCase()}`,
    enabled: true,
    action: async (selectedRows) => {
      const dbActivity = generateDBActivityPayload({}, null, type, subtype);
      dbActivity.created_by = userInfo?.preferred_username;
      await invasivesApi.createActivity(dbActivity);
    },
    icon: <Add />,
    label: ActivitySubtypeShortLabels[subtype],
    bulkAction: false,
    rowAction: false,
    globalAction: true,
    triggerReload: true,
    displayInvalid: 'error',
    ...actions?.create_activity // allow prop overwrites by default
  });

  arrayWrap(activitySubtypes).forEach(([type, subtype]) => {
    const action = createAction(type, subtype);
    createActions = {
      ...createActions,
      [action.key]: {
        ...action,
        ...actions?.[action.key] // allow prop overwrites still
      }
    };
  });

  return useMemo(
    () => (
      <RecordTable
        tableName="Activities"
        keyField={keyField}
        tableSchemaType={['Activity', 'Jurisdiction', ...arrayWrap(tableSchemaType)]}
        startingOrderBy="activity_id"
        startingOrder="desc"
        enableSelection={enableSelection}
        startExpanded
        headers={[
          'activity_id',
          'activity_type',
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels,
              Activity_Observation_PlantTerrestial: 'Terrestrial Plant' // TODO remove when our data isn't awful
            }
          },
          {
            id: 'created_timestamp',
            title: 'Created Date'
          },
          'biogeoclimatic_zones',
          {
            id: 'elevation',
            type: 'number'
          },
          {
            id: 'flnro_districts',
            title: 'FLNRO Districs'
          },
          'ownership',
          'regional_districts',
          'invasive_species_agency_code',
          'jurisdiction_code',
          {
            id: 'latitude',
            title: 'Latitude',
            type: 'number'
          },
          {
            id: 'longitude',
            title: 'Longitude',
            type: 'number'
          },
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)',
            type: 'number'
          },
          'access_description',
          'general_comment'
        ]}
        rows={
          rows
            ? rows.map(activityStandardMapping)
            : defaultActivitiesFetch({
                invasivesApi,
                created_by,
                activitySubtypes
              })
        }
        actions={{
          ...actions,
          edit: {
            // NOTE: this might be a good candidate to be broken out to a parent class
            // since it breaks generality of this multi-purpose table
            key: 'edit',
            enabled: enableSelection !== false,
            action: async (allSelectedRows) => {
              const selectedIds = allSelectedRows.map((row) => row[keyField]);
              if (selectedIds.length === 1) {
                // TODO switch by activity type, I guess...
                await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc: any) => {
                  return { ...appStateDoc, activeActivity: selectedIds[0] };
                });
                history.push({ pathname: `/home/activity` });
              } else {
                history.push({
                  pathname: `/home/search/bulkedit`,
                  search: '?activities=' + selectedIds.join(','),
                  state: { activityIdsToEdit: selectedIds }
                });
              }
            },
            label: 'Edit',
            icon: <Edit />,
            bulkAction: true,
            rowAction: true,
            bulkCondition: (allSelectedRows) => allSelectedRows.every((a, _, [b]) => a.subtype === b.subtype),
            // TODO limit to only some subtypes too
            // TODO IAPP POIs not editable
            rowCondition: undefined,
            displayInvalid: 'error',
            invalidError: 'All selected rows must be of the same SubType to Bulk Edit',
            ...actions?.edit
          },
          delete: {
            key: 'delete',
            enabled: enableSelection !== false,
            action: async (allSelectedRows) => {
              const selectedIds = allSelectedRows.map((row) => row[keyField]);
              if (selectedIds.length) await invasivesApi.deleteActivities(selectedIds);
            },
            label: 'Delete',
            icon: <Delete />,
            bulkAction: true,
            rowAction: true,
            bulkCondition: undefined, // TODO admin or author only
            rowCondition: undefined,
            displayInvalid: 'disable',
            triggerReload: true,
            ...actions?.delete
          },
          sync: {
            key: 'sync',
            enabled: true,
            label: 'Save',
            bulkAction: true,
            rowAction: true,
            displayInvalid: 'disable',
            triggerReload: true,
            rowCondition: (row) =>
              row.sync_status !== ActivitySyncStatus.SYNC_SUCCESSFUL && row.form_status === FormValidationStatus.VALID,
            bulkCondition: (
              selectedRows // only enable bulk sync if some field needs it
            ) =>
              selectedRows?.filter(
                (row) =>
                  row.sync_status !== ActivitySyncStatus.SYNC_SUCCESSFUL &&
                  row.form_status === FormValidationStatus.VALID
              )?.length > 0,
            action: async (selectedRows) => {
              try {
                selectedRows.map(async (activity) => {
                  if (
                    activity.form_status !== FormValidationStatus.VALID ||
                    activity.sync_status === ActivitySyncStatus.SYNC_SUCCESSFUL
                  )
                    return;
                  const dbActivity: any = await invasivesApi.getActivityById(activity.activity_id);
                  await invasivesApi.updateActivity({
                    ...dbActivity,
                    sync_status: ActivitySyncStatus.SYNC_SUCCESSFUL
                  });
                  const typename = activity.activity_subtype?.split('_')[2];
                  notifySuccess(databaseContext, `${typename} activity has been saved to database.`);
                });
              } catch (error) {
                notifyError(databaseContext, JSON.stringify(error));
              }
            },
            icon: <Sync />,
            ...actions?.sync
          },
          submit: {
            key: 'submit',
            enabled: true,
            label: 'Submit For Review',
            bulkAction: true,
            rowAction: true,
            displayInvalid: 'hidden',
            triggerReload: true,
            rowCondition: (row) =>
              row.sync_status === ActivitySyncStatus.SYNC_SUCCESSFUL &&
              row.form_status === FormValidationStatus.VALID &&
              row.review_status !== ReviewStatus.UNDER_REVIEW,
            bulkCondition: (
              selectedRows // only enable bulk submit if some field needs it
            ) =>
              selectedRows?.filter(
                (row) =>
                  row.sync_status === ActivitySyncStatus.SYNC_SUCCESSFUL &&
                  row.form_status === FormValidationStatus.VALID &&
                  row.review_status !== ReviewStatus.UNDER_REVIEW
              )?.length > 0,
            action: async (selectedRows) => {
              try {
                selectedRows.map(async (activity) => {
                  if (
                    activity.form_status !== FormValidationStatus.VALID ||
                    activity.sync_status !== ActivitySyncStatus.SYNC_SUCCESSFUL ||
                    activity.review_status === ReviewStatus.UNDER_REVIEW
                  )
                    return;
                  const dbActivity: any = await invasivesApi.getActivityById(activity.activity_id);
                  await invasivesApi.updateActivity({
                    ...dbActivity,
                    review_status: ReviewStatus.UNDER_REVIEW
                  });
                  const typename = activity.activity_subtype?.split('_')[2];
                  notifySuccess(databaseContext, `${typename} activity has been marked for review.`);
                });
              } catch (error) {
                notifyError(databaseContext, JSON.stringify(error));
              }
            },
            icon: <FindInPage />,
            ...actions?.submit
          },
          approve: {
            key: 'approve',
            enabled: true,
            label: 'Approve',
            bulkAction: true,
            rowAction: true,
            displayInvalid: 'hidden',
            triggerReload: true,
            rowCondition: (row) =>
              row.sync_status === ActivitySyncStatus.SYNC_SUCCESSFUL &&
              row.form_status === FormValidationStatus.VALID &&
              row.review_status === ReviewStatus.UNDER_REVIEW,
            bulkCondition: (
              selectedRows // only enable bulk submit if some field needs it
            ) =>
              selectedRows?.filter(
                (row) =>
                  row.sync_status === ActivitySyncStatus.SYNC_SUCCESSFUL &&
                  row.form_status === FormValidationStatus.VALID &&
                  row.review_status === ReviewStatus.UNDER_REVIEW
              )?.length > 0,
            action: async (selectedRows) => {
              try {
                selectedRows.map(async (activity) => {
                  if (
                    activity.form_status !== FormValidationStatus.VALID ||
                    activity.sync_status !== ActivitySyncStatus.SYNC_SUCCESSFUL ||
                    activity.review_status !== ReviewStatus.UNDER_REVIEW
                  )
                    return;
                  const dbActivity: any = await invasivesApi.getActivityById(activity.activity_id);
                  await invasivesApi.updateActivity({
                    ...dbActivity,
                    review_status: ReviewStatus.APPROVED,
                    reviewed_by: userInfo.preferred_username, // latest reviewer
                    reviewed_at: moment(new Date()).format()
                  });
                  const typename = activity.activity_subtype?.split('_')[2];
                  notifySuccess(databaseContext, `${typename} activity has been reviewed and approved.`);
                });
              } catch (error) {
                notifyError(databaseContext, JSON.stringify(error));
              }
            },
            icon: <Check />,
            ...actions?.approve
          },
          disapprove: {
            key: 'disapprove',
            enabled: true,
            label: 'Disapprove',
            bulkAction: true,
            rowAction: true,
            displayInvalid: 'hidden',
            triggerReload: true,
            rowCondition: (row) =>
              row.sync_status === ActivitySyncStatus.SYNC_SUCCESSFUL &&
              row.form_status === FormValidationStatus.VALID &&
              row.review_status === ReviewStatus.UNDER_REVIEW,
            bulkCondition: (
              selectedRows // only enable bulk submit if some field needs it
            ) =>
              selectedRows?.filter(
                (row) =>
                  row.sync_status === ActivitySyncStatus.SYNC_SUCCESSFUL &&
                  row.form_status === FormValidationStatus.VALID &&
                  row.review_status === ReviewStatus.UNDER_REVIEW
              )?.length > 0,
            action: async (selectedRows) => {
              try {
                selectedRows.map(async (activity) => {
                  if (
                    activity.form_status !== FormValidationStatus.VALID ||
                    activity.sync_status !== ActivitySyncStatus.SYNC_SUCCESSFUL ||
                    activity.review_status !== ReviewStatus.UNDER_REVIEW
                  )
                    return;
                  const dbActivity: any = await invasivesApi.getActivityById(activity.activity_id);
                  await invasivesApi.updateActivity({
                    ...dbActivity,
                    review_status: ReviewStatus.DISAPPROVED,
                    reviewed_by: userInfo.preferred_username, // latest reviewer
                    reviewed_at: moment(new Date()).format()
                  });
                  const typename = activity.activity_subtype?.split('_')[2];
                  notifySuccess(databaseContext, `${typename} activity has been reviewed and disapproved.`);
                });
              } catch (error) {
                notifyError(databaseContext, JSON.stringify(error));
              }
            },
            icon: <Clear />,
            ...actions?.disapprove
          },
          ...createActions
        }}
        {...otherProps}
      />
    ),
    [rows?.length, props.selected?.length, JSON.stringify(actions)]
  );
};

export const MyActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const { keycloak } = useKeycloak();
  const userInfo: any = keycloak?.userInfo;
  const { headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[
          ...headers,
          'sync_status',
          'form_status',
          {
            id: 'review_status_rendered',
            title: 'Review Status'
          }
        ]}
        created_by={userInfo?.preferred_username}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const AnimalActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const history = useHistory();
  const { tableSchemaType, ...otherProps } = props;
  return (
    <ActivitiesTable
      tableName="Animal Activities"
      activitySubtypes={[
        [ActivityType.AnimalActivity, ActivitySubtype.Activity_AnimalTerrestrial],
        [ActivityType.AnimalActivity, ActivitySubtype.Activity_AnimalAquatic]
      ]}
      tableSchemaType={[
        'Observation',
        'Activity_AnimalTerrestrial',
        'Activity_AnimalAquatic',
        ...arrayWrap(tableSchemaType)
      ]}
      {...otherProps}
    />
  );
};

export const MyAnimalActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const { keycloak } = useKeycloak();
  const userInfo: any = keycloak?.userInfo;
  const { headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <AnimalActivitiesTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[
          ...headers,
          'sync_status',
          'form_status',
          {
            id: 'review_status_rendered',
            title: 'Review Status'
          }
        ]}
        created_by={userInfo?.preferred_username}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const ObservationsTable: React.FC<IActivitiesTable> = (props) => {
  const history = useHistory();
  const { tableSchemaType, actions, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Observations"
        activitySubtypes={[
          [ActivityType.Observation, ActivitySubtype.Observation_PlantTerrestrial],
          [ActivityType.Observation, ActivitySubtype.Observation_PlantAquatic]
        ]}
        tableSchemaType={[
          'Observation',
          'Observation_PlantTerrestrial',
          'Observation_PlantAquatic',
          'ObservationPlantTerrestrialData',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[
          ...headers,
          'activity_id',
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels,
              Activity_Observation_PlantTerrestial: 'Terrestrial Plant' // TODO remove when our data isn't awful
            }
          },
          {
            id: 'created_timestamp',
            title: 'Created Date'
          },
          'biogeoclimatic_zones',
          {
            id: 'elevation',
            type: 'number'
          },
          {
            id: 'flnro_districts',
            title: 'FLNRO Districs'
          },
          'ownership',
          'regional_districts',
          'invasive_species_agency_code',
          'jurisdiction_code',
          {
            id: 'latitude',
            title: 'Latitude',
            type: 'number'
          },
          {
            id: 'longitude',
            title: 'Longitude',
            type: 'number'
          },
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)',
            type: 'number'
          },
          'access_description',
          'general_comment'
        ]}
        actions={{
          ...actions,
          create_treatment: {
            key: 'create_treatment',
            enabled: true,
            action: (selectedRows) => {
              const ids = selectedRows.map((row: any) => row['activity_id']);
              history.push({
                pathname: `/home/activity/treatment`,
                search: '?observations=' + ids.join(','),
                state: { observations: ids }
              });
            },
            label: 'Create Treatment',
            bulkAction: true,
            rowAction: false,
            displayInvalid: 'error',
            invalidError: 'All selected activities must be of the same SubType to create a Treatment',
            /*
              Function to determine if all selected observation records are
              of the same subtype. For example: Cannot create a treatment if you select a plant
              and an animal observation, and most probably will not go treat a terrestrial
              and aquatic observation in a single treatment as those are different areas
            */
            bulkCondition: (selectedRows) => selectedRows.every((a, _, [b]) => a.subtype === b.subtype),
            ...actions?.create_treatment
          }
        }}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(actions)]);
};

export const MyObservationsTable: React.FC<IActivitiesTable> = (props) => {
  const { keycloak } = useKeycloak();
  const userInfo: any = keycloak?.userInfo;
  const { headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ObservationsTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[
          ...headers,
          'sync_status',
          'form_status',
          {
            id: 'review_status_rendered',
            title: 'Review Status'
          }
        ]}
        created_by={userInfo?.preferred_username}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const TreatmentsTable: React.FC<IActivitiesTable> = (props) => {
  const history = useHistory();
  const databaseContext = useContext(DatabaseContext);
  const { tableSchemaType, actions, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Treatments"
        activitySubtypes={[
          [ActivityType.Treatment, ActivitySubtype.Treatment_ChemicalPlant],
          [ActivityType.Treatment, ActivitySubtype.Treatment_MechanicalPlant],
          [ActivityType.Treatment, ActivitySubtype.Treatment_BiologicalPlant]
        ]}
        tableSchemaType={[
          'Treatment',
          'Treatment_ChemicalPlant',
          'Treatment_MechanicalPlant',
          'Treatment_BiologicalPlant',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[
          ...headers,
          'activity_id',
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels,
              Activity_Observation_PlantTerrestial: 'Terrestrial Plant' // TODO remove when our data isn't awful
            }
          },
          {
            id: 'created_timestamp',
            title: 'Created Date'
          },
          'invasive_plant_code',
          'invasive_species_agency_code',
          'chemical_method_code',
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)'
          },
          {
            id: 'latitude',
            title: 'Latitude',
            type: 'number'
          },
          {
            id: 'longitude',
            title: 'Longitude',
            type: 'number'
          },
          'elevation'
        ]}
        dropdown={(row) => (
          <ActivitiesTable
            tableName=""
            key={row._id}
            tableSchemaType={[
              'Treatment',
              'Treatment_ChemicalPlant',
              'Treatment_MechanicalPlant',
              'Treatment_BiologicalPlant',
              ...arrayWrap(tableSchemaType)
            ]}
            enableSelection={false}
            headers={[
              'jurisdiction_code',
              'biogeoclimatic_zones',
              {
                id: 'flnro_districts',
                title: 'FLNRO Districts'
              },
              'ownership',
              'regional_districts',
              'access_description',
              'general_comment'
            ]}
            rows={[row]}
            pagination={false}
            actions={{
              sync: {
                enabled: false
              }
            }}
          />
        )}
        actions={{
          ...actions,
          create_monitoring: {
            key: 'create_monitoring',
            enabled: true,
            label: 'Create Monitoring',
            bulkAction: false,
            rowAction: true,
            displayInvalid: 'hidden',
            rowCondition: (row) => row.activityType === 'Treatment',
            action: async (selectedRows) => {
              if (selectedRows.length !== 1)
                // action is for creating a single monitoring from a given row
                // NOTE: might want to extend this into a multi-row monitoring action later
                return;
              const activity = selectedRows[0];

              const addedActivity = await addLinkedActivityToDB(
                databaseContext,
                ActivityType.Monitoring,
                calculateMonitoringSubtypeByTreatmentSubtype(activity.activitySubtype),
                activity
              );
              await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc: any) => {
                return { ...appStateDoc, activeActivity: addedActivity._id };
              });

              history.push(`/home/activity`);
            },
            ...actions?.create_monitoring
          }
        }}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(actions)]);
};

export const MyTreatmentsTable: React.FC<IActivitiesTable> = (props) => {
  const { keycloak } = useKeycloak();
  const userInfo: any = keycloak?.userInfo;
  const { headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <TreatmentsTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[
          ...headers,
          'sync_status',
          'form_status',
          {
            id: 'review_status_rendered',
            title: 'Review Status'
          }
        ]}
        created_by={userInfo?.preferred_username}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const MonitoringTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Treatment Monitoring"
        activitySubtypes={[
          [ActivityType.Monitoring, ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant],
          [ActivityType.Monitoring, ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant],
          [ActivityType.Monitoring, ActivitySubtype.Monitoring_BiologicalTerrestrialPlant],
          [ActivityType.Dispersal, ActivitySubtype.Activity_BiologicalDispersal]
        ]}
        tableSchemaType={[
          'Monitoring',
          'Monitoring_ChemicalTerrestrialAquaticPlant',
          'Monitoring_MechanicalTerrestrialAquaticPlant',
          'Monitoring_BiologicalTerrestrialPlant',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[
          ...headers,
          'activity_id',
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels,
              Activity_Observation_PlantTerrestial: 'Terrestrial Plant' // TODO remove when our data isn't awful
            }
          },
          {
            id: 'created_timestamp',
            title: 'Created Date'
          },
          'invasive_plant_code',
          'invasive_species_agency_code',
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)'
          },
          {
            id: 'latitude',
            title: 'Latitude',
            type: 'number'
          },
          {
            id: 'longitude',
            title: 'Longitude',
            type: 'number'
          },
          'elevation'
        ]}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length]);
};

export const MyMonitoringTable: React.FC<IActivitiesTable> = (props) => {
  const { keycloak } = useKeycloak();
  const userInfo: any = keycloak?.userInfo;
  const { headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <MonitoringTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[
          ...headers,
          'sync_status',
          'form_status',
          {
            id: 'review_status_rendered',
            title: 'Review Status'
          }
        ]}
        created_by={userInfo?.preferred_username}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const GeneralBiologicalControlTable: React.FC<IActivitiesTable> = (props) => {
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Biological Control"
        activitySubtypes={[
          [ActivityType.Treatment, ActivitySubtype.Treatment_BiologicalPlant],
          [ActivityType.Transect, ActivitySubtype.Transect_BiocontrolEfficacy],
          [ActivityType.Monitoring, ActivitySubtype.Monitoring_BiologicalTerrestrialPlant],
          [ActivityType.Dispersal, ActivitySubtype.Activity_BiologicalDispersal]
        ]}
        {...props}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(props.actions)]);
};

export const TransectsTable: React.FC<IActivitiesTable> = (props) => {
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Transects"
        activitySubtypes={[
          [ActivityType.Transect, ActivitySubtype.Transect_FireMonitoring],
          [ActivityType.Transect, ActivitySubtype.Transect_BiocontrolEfficacy],
          [ActivityType.Transect, ActivitySubtype.Transect_Vegetation]
        ]}
        {...props}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(props.actions)]);
};

export const MyTransectsTable: React.FC<IActivitiesTable> = (props) => {
  const { keycloak } = useKeycloak();
  const userInfo: any = keycloak?.userInfo;
  const { headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <TransectsTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[
          ...headers,
          'sync_status',
          'form_status',
          {
            id: 'review_status_rendered',
            title: 'Review Status'
          }
        ]}
        created_by={userInfo?.preferred_username}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const MyCollectionsTable: React.FC<IActivitiesTable> = (props) => {
  const { keycloak } = useKeycloak();
  const userInfo: any = keycloak?.userInfo;
  const { headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <CollectionsTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[
          ...headers,
          'sync_status',
          'form_status',
          {
            id: 'review_status_rendered',
            title: 'Review Status'
          }
        ]}
        created_by={userInfo?.preferred_username}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const CollectionsTable: React.FC<IActivitiesTable> = (props) => {
  const history = useHistory();
  const databaseContext = useContext(DatabaseContext);
  const { tableSchemaType, actions, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Collections"
        activitySubtypes={[[ActivityType.Collection, ActivitySubtype.Collection_Biocontrol]]}
        tableSchemaType={['Collection', 'Collection_Biocontrol', ...arrayWrap(tableSchemaType)]}
        headers={[
          ...headers,
          'activity_id',
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels,
              Activity_Collection_Biocontrol: 'Bio Control' // TODO remove when our data isn't awful
            }
          },
          {
            id: 'created_timestamp',
            title: 'Created Date'
          },
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)'
          },
          {
            id: 'latitude',
            title: 'Latitude',
            type: 'number'
          },
          {
            id: 'longitude',
            title: 'Longitude',
            type: 'number'
          }
        ]}
        dropdown={(row) => (
          <ActivitiesTable
            tableName=""
            key={row._id}
            tableSchemaType={['Collection', 'Collection_Biocontrol', ...arrayWrap(tableSchemaType)]}
            enableSelection={false}
            headers={[
              'jurisdiction_code',
              'biogeoclimatic_zones',
              {
                id: 'flnro_districts',
                title: 'FLNRO Districts'
              },
              'ownership',
              'regional_districts',
              'access_description',
              'general_comment'
            ]}
            rows={[row]}
            pagination={false}
            actions={{
              sync: {
                enabled: false
              }
            }}
          />
        )}
        actions={{
          ...actions
        }}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(actions)]);
};

export const PointsOfInterestTable: React.FC<IRecordTable> = (props) => {
  const { tableSchemaType, actions, ...otherProps } = props;
  const invasivesApi = useInvasivesApi();
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Points of Interest"
        tableSchemaType={['Point_Of_Interest', 'IAPP_Site', 'Jurisdiction', ...arrayWrap(tableSchemaType)]}
        startingOrderBy="site_id"
        startingOrder="desc"
        enableSelection
        headers={[
          {
            id: 'site_id',
            type: 'number'
          },
          {
            id: 'created_date_on_device',
            title: 'Created Date'
          },
          'jurisdiction_code',
          'site_elevation',
          'slope_code',
          'aspect_code',
          'soil_texture_code',
          {
            id: 'latitude',
            title: 'Latitude',
            type: 'number'
          },
          {
            id: 'longitude',
            title: 'Longitude',
            type: 'number'
          },
          'access_description',
          'general_comment'
        ]}
        rows={async ({ page, rowsPerPage, order }) => {
          // Fetches fresh from the API (web).  TODO fetch from SQLite
          let dbPageSize = DEFAULT_PAGE_SIZE;
          if (dbPageSize - ((page * rowsPerPage) % dbPageSize) < 3 * rowsPerPage)
            // if page is right near the db page limit
            dbPageSize = (page * rowsPerPage) % dbPageSize; // set the limit to the current row count instead
          const result = await invasivesApi.getPointsOfInterest({
            page: Math.floor((page * rowsPerPage) / dbPageSize),
            limit: dbPageSize,
            order: order
          });
          return {
            rows: result.rows.map(poiStandardDBMapping),
            count: result.count
          };
        }}
        actions={{
          ...actions,
          delete: {
            enabled: false,
            ...actions?.delete
          },
          edit: {
            enabled: false,
            ...actions?.edit
          }
        }}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(actions)]);
};

export const IAPPTable: React.FC<IRecordTable> = (props) => (
  <PointsOfInterestTable tableName="IAPP Points of Interest" enableSelection={false} {...props} />
);

export const IAPPSurveyTable: React.FC<IRecordTable> = (props) => {
  const { tableSchemaType, rows, ...otherProps } = props;
  return useMemo(() => {
    return (
      <IAPPTable
        tableName={'Survey Details'}
        keyField="survey_id"
        startingOrderBy="survey_id"
        startingOrder="desc"
        tableSchemaType={['IAPP_Survey', ...arrayWrap(tableSchemaType)]}
        actions={false}
        headers={[
          {
            id: 'survey_id',
            type: 'number'
          },
          'invasive_plant_code',
          'common_name',
          'genus',
          'survey_date',
          'invasive_species_agency_code',
          'reported_area',
          {
            id: 'invasive_plant_density_code',
            align: 'center',
            title: 'Density'
          },
          {
            id: 'invasive_plant_distribution_code',
            align: 'center',
            title: 'Distribution'
          },
          'general_comment'
        ]}
        rows={
          (Array.isArray(rows) &&
            (!rows?.length
              ? []
              : rows.map((row) => ({
                  ...row,
                  density: row.density + (row.density ? ' (' + row.invasive_plant_density_code + ')' : ''),
                  distribution:
                    row.distribution + (row.distribution ? ' (' + row.invasive_plant_distribution_code + ')' : '')
                })))) ||
          rows
        }
        {...otherProps}
      />
    );
  }, [rows?.length, props.selected?.length]);
};

// TODO convert tables below to easily modifiable (otherProps) versions:

export const IAPPMonitoringTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Monitoring"
        startExpanded={true}
        startingOrderBy="monitoring_id"
        startingOrder="desc"
        keyField="monitoring_id"
        tableSchemaType={['IAPP_Monitoring']}
        actions={false}
        headers={[
          {
            id: 'monitoring_id',
            type: 'number'
          },
          'monitoring_date',
          'invasive_species_agency_code',
          'efficacy_code',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((monitor, j) => ({
                ...monitor,
                project_code_label: monitor.project_code[0].description
              }))
        }
      />
    );
  }, [rows?.length]);
};

export const IAPPMechanicalTreatmentsTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Mechanical Treatments and Efficacy Monitoring"
        startExpanded={false}
        keyField="treatment_id"
        startingOrderBy="treatment_id"
        startingOrder="desc"
        tableSchemaType={['IAPP_Treatment', 'IAPP_Mechanical_Treatment']}
        actions={false}
        headers={[
          {
            id: 'treatment_id',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common Name)'
          },
          'treatment_date',
          'invasive_species_agency_code',
          'reported_area',
          'mechanical_method_code',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_label: row.project_code[0].description
              }))
        }
        dropdown={(row) => (!row.monitoring?.length ? undefined : <IAPPMonitoringTable rows={row.monitoring} />)}
      />
    );
  }, [rows?.length]);
};

export const IAPPChemicalTreatmentsTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Chemical Treatments and Efficacy Monitoring"
        startExpanded={false}
        keyField="treatment_id"
        startingOrderBy="treatment_id"
        startingOrder="desc"
        tableSchemaType={['IAPP_Treatment', 'IAPP_Chemical_Treatment']}
        actions={false}
        headers={[
          {
            id: 'treatment_id',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common Name)'
          },
          'treatment_date',
          'invasive_species_agency_code',
          'reported_area',
          'chemical_method_code',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_label: row.project_code[0].description
              }))
        }
        dropdown={(row) => (
          <React.Fragment key={row.treatment_id + '_expanded'}>
            <RecordTable
              startExpanded={true}
              keyField="treatment_id"
              actions={false}
              tableSchemaType={['IAPP_Treatment', 'IAPP_Chemical_Treatment', 'Herbicide']}
              headers={[
                'liquid_herbicide_code',
                'herbicide_description',
                'application_rate',
                'herbicide_amount',
                'dilution',
                'mix_delivery_rate',
                {
                  id: 'mix_delivery_rate',
                  title: 'Mix Delivery Rate'
                }
              ]}
              rows={[row]} // singleton expanded table
              enableFiltering={false}
            />
            <RecordTable
              startExpanded={true}
              keyField="treatment_id"
              actions={false}
              tableSchemaType={['IAPP_Treatment', 'IAPP_Chemical_Treatment', 'Herbicide']}
              headers={[
                'pmp_confirmation_number',
                'pmra_reg_number',
                'pup_number',
                'service_license_number',
                'treatment_time',
                'temperature',
                'humidity',
                'wind_speed',
                'wind_direction',
                'wind_direction_code'
              ]}
              rows={[row]} // singleton expanded table
              enableFiltering={false}
            />
            {row.monitoring.length > 0 && <IAPPMonitoringTable rows={row.monitoring} />}
          </React.Fragment>
        )}
      />
    );
  }, [rows?.length]);
};

export const IAPPBiologicalTreatmentsTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Biological Treatments and Efficacy Monitoring"
        startExpanded={false}
        keyField="treatment_id"
        startingOrderBy="treatment_id"
        startingOrder="desc"
        tableSchemaType={['IAPP_Treatment', 'IAPP_Biological_Treatment']}
        actions={false}
        headers={[
          {
            id: 'treatment_id',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common Name)'
          },
          'treatment_date',
          'collection_date',
          'invasive_species_agency_code',
          'classified_area_code',
          'biological_agent_code',
          'bioagent_source',
          'biological_agent_stage_code',
          'agent_source',
          'release_quantity',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_label: row.project_code[0].description
              }))
        }
        dropdown={(row) =>
          !row.monitoring?.length ? undefined : <IAPPBiologicalTreatmentsMonitoringTable rows={row.monitoring} />
        }
      />
    );
  }, [rows?.length]);
};

export const IAPPBiologicalDispersalsTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Biological Dispersals"
        startExpanded={false}
        keyField="biological_id"
        startingOrderBy="biological_id"
        startingOrder="desc"
        tableSchemaType={['IAPP_Biological_Dispersal']}
        actions={false}
        headers={[
          {
            id: 'monitoring_id',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common)'
          },
          'monitoring_date',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'plant_count',
          'agent_count',
          'count_duration',
          'biological_agent_code',
          'foliar_feeding_damage_ind',
          'root_feeding_damage_ind',
          'seed_feeding_damage_ind',
          'oviposition_marks_ind',
          'eggs_present_ind',
          'pupae_present_ind',
          'adults_present_ind',
          'tunnels_present_ind',
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_label: row.project_code[0].description
              }))
        }
      />
    );
  }, [rows?.length]);
};

export const IAPPBiologicalTreatmentsMonitoringTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Monitoring"
        startExpanded={true}
        startingOrderBy="monitoring_id"
        startingOrder="desc"
        keyField="monitoring_id"
        tableSchemaType={['IAPP_Monitoring', 'Monitoring_BiologicalTerrestrialPlant', 'IAPP_Biological_Monitoring']}
        actions={false}
        headers={[
          {
            id: 'monitoring_id',
            type: 'number'
          },
          'monitoring_date',
          'plant_count',
          'agent_count',
          'count_duration',
          'agent_destroyed_ind',
          'legacy_presence_ind',
          'foliar_feeding_damage_ind',
          'root_feeding_damage_ind',
          'seed_feeding_damage_ind',
          'oviposition_marks_ind',
          'eggs_present_ind',
          'larvae_present_ind',
          'pupae_present_ind',
          'adults_present_ind',
          'tunnels_present_ind',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((monitor, j) => ({
                ...monitor,
                project_code_label: monitor.project_code[0].description
              }))
        }
      />
    );
  }, [rows?.length]);
};
