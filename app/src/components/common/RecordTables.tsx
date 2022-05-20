import { Add, Check, Clear, Delete, Edit, FindInPage, Sync } from '@mui/icons-material';
import RecordTable, { IRecordTable } from 'components/common/RecordTable';
import { IGeneralDialog, GeneralDialog } from 'components/dialog/GeneralDialog';
import {
  ActivitySubtype,
  ActivitySubtypeShortLabels,
  ActivitySyncStatus,
  FormValidationStatus,
  ReviewStatus
} from 'constants/activities';
import { DEFAULT_PAGE_SIZE, DocType } from 'constants/database';
import { useDataAccess } from 'hooks/useDataAccess';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import moment from 'moment';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { generateDBActivityPayload, getShortActivityID, sanitizeRecord } from 'utils/addActivity';
import { DatabaseContext } from '../../contexts/DatabaseContext';
import { selectAuth } from '../../state/reducers/auth';
import { useSelector } from '../../state/utilities/use_selector';

export const activityStandardMapping = (doc) => {
  const record = sanitizeRecord(doc);
  const flattened = {
    ...record.activity_payload,
    ...record.activity_payload?.form_data?.activity_data,
    ...record.activity_payload?.form_data?.activity_type_data,
    ...record.activity_payload?.form_data?.activity_subtype_data,
    ...record
  };
  return {
    ...flattened,
    short_id: getShortActivityID(flattened),
    activity_id: flattened.activity_id, // NOTE: activity_subtype_data.activity_id is overwriting this incorrectly
    jurisdiction_code: flattened.activity_payload?.form_data?.activity_data?.jurisdictions?.reduce(
      (output, jurisdiction) => [
        ...output,
        jurisdiction.jurisdiction_code,
        '(',
        jurisdiction.percent_covered + '%',
        ')'
      ],
      []
    ),
    invasive_plant_code: doc.species_positive,
    date_created: flattened.created_timestamp?.substring(0, 10) + ' ' + flattened.date_created?.substring(11, 19),
    latitude: flattened.latitude && parseFloat(flattened.latitude).toFixed(6),
    longitude: flattened.longitude && parseFloat(flattened.longitude).toFixed(6),
    review_status_rendered:
      flattened.review_status === ReviewStatus.APPROVED || flattened.review_status === ReviewStatus.DISAPPROVED
        ? flattened.review_status + ' by ' + flattened.reviewed_by + ' at ' + flattened.reviewed_at
        : flattened.review_status
  };
};

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

const arrayWrap = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const uniqueArray = (items) => {
  return Array.from(new Set(arrayWrap(items)));
};

export const defaultActivitiesFetch =
  ({
    databaseContext,
    dataAccess,
    activitySubtypes = [],
    created_by = undefined,
    user_roles = [],
    review_status = [],
    linked_id = undefined
  }) =>
  async ({ page, rowsPerPage, order }) => {
    // Fetches fresh from the API (web).  TODO fetch from SQLite
    let dbPageSize = DEFAULT_PAGE_SIZE;
    if (dbPageSize - ((page * rowsPerPage) % dbPageSize) < 3 * rowsPerPage)
      // if page is right near the db page limit
      dbPageSize = (page * rowsPerPage) % dbPageSize; // set the limit to the current row count instead
    const types = uniqueArray(arrayWrap(activitySubtypes).map((subtype: string) => String(subtype).split('_')[1]));
    const criteria: IActivitySearchCriteria = {
      page: Math.floor((page * rowsPerPage) / dbPageSize),
      limit: dbPageSize,
      order: order,
      user_roles: user_roles,
      // search_feature: geometry TODO
      activity_type: types,
      activity_subtype: arrayWrap(activitySubtypes),
      // startDate, endDate will be filters
      created_by: created_by,
      review_status: review_status,
      linked_id: linked_id
    };
    const response = await dataAccess.getActivities(criteria, databaseContext, true);
    return {
      rows: response?.map(activityStandardMapping) || [],
      count: response?.length || 0
    };
  };

export interface IActivitiesTable extends IRecordTable {
  workflow?: string;
  activitySubtypes?: any[];
  created_by?: string;
  review_status?: string[];
}

const activitesDefaultHeaders = [
  {
    id: 'short_id',
    title: 'Activity ID'
  },
  'activity_type',
  {
    id: 'activity_subtype',
    valueMap: {
      ...ActivitySubtypeShortLabels,
      Activity_Observation_PlantTerrestial: 'Terrestrial Plant' // TODO remove when our data isn't awful
    }
  },
  'date_created',
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
  {
    id: 'activity_id',
    title: 'Full ID'
  },
  'access_description',
  'general_comment'
];

export const ActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const history = useHistory();
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
  const { bestName, roles, hasRole } = useSelector(selectAuth);

  const [warningDialog, setWarningDialog] = useState<IGeneralDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: '',
    dialogContentText: null
  });

  const {
    tableSchemaType,
    actions,
    activitySubtypes,
    created_by,
    keyField = 'activity_id',
    enableSelection = true,
    review_status = [ReviewStatus.APPROVED, ReviewStatus.PREAPPROVED],
    ...otherProps
  } = props;

  const createAction = (type: string, subtype: string) => ({
    key: `create_${subtype.toString().toLowerCase()}`,
    enabled: true,
    action: async (selectedRows) => {
      const dbActivity = generateDBActivityPayload({}, null, type, subtype);
      dbActivity.created_by = bestName;
      dbActivity.user_role = roles.map((role) => role.role_id);
      await dataAccess.createActivity(dbActivity, databaseContext);
      await dataAccess.setAppState({ activeActivity: dbActivity.activity_id }, databaseContext);
      setTimeout(() => {
        history.push({ pathname: `/home/activity` });
      }, 500);
    },
    icon: <Add />,
    label: ActivitySubtypeShortLabels[subtype],
    bulkAction: false,
    rowAction: false,
    globalAction: true,
    triggerReload: true,
    displayInvalid: 'error',
    ...actions?.create_activity // allow prop overwrites by defaulto
  });

  let createActions = {};
  arrayWrap(activitySubtypes).forEach((subtype) => {
    const action = createAction(subtype.toString().split('_')[1], subtype);
    createActions = {
      ...createActions,
      [action.key]: {
        ...action,
        ...actions?.[action.key] // allow prop overwrites still
      }
    };
  });
  let rows = props.rows;
  if (Array.isArray(rows)) rows = rows.map(activityStandardMapping);
  if (typeof rows === 'undefined') {
    rows = defaultActivitiesFetch({
      databaseContext,
      dataAccess,
      activitySubtypes: arrayWrap(activitySubtypes),
      created_by,
      user_roles: roles,
      review_status: review_status
    });
  }

  return useMemo(
    () => (
      <>
        <RecordTable
          tableName="Activities"
          keyField={keyField}
          tableSchemaType={['Activity', 'Jurisdiction', ...arrayWrap(tableSchemaType)]}
          startingOrderBy="activity_id"
          startingOrder="desc"
          enableSelection={enableSelection}
          startExpanded
          headers={activitesDefaultHeaders}
          rows={rows}
          actions={
            actions === false
              ? false
              : {
                  ...actions,
                  edit: {
                    // NOTE: this might be a good candidate to be broken out to a parent class
                    // since it breaks generality of this multi-purpose table
                    key: 'edit',
                    enabled: enableSelection !== false,
                    action: async (allSelectedRows) => {
                      const selectedIds = allSelectedRows.map((row) => row[keyField]);
                      if (selectedIds.length === 1) {
                        const appState = props.referenceData
                          ? { activeActivity: selectedIds[0], referenceData: true }
                          : { activeActivity: selectedIds[0], referenceData: false };
                        await dataAccess.setAppState(appState, databaseContext);
                        setTimeout(() => {
                          history.push({ pathname: `/home/activity` });
                        }, 500);
                        // TODO switch by activity type, I guess...
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
                    rowCondition: (row) => {
                      if (row && row.activity_payload) {
                        const createdBy = row.activity_payload.created_by;
                        return createdBy === bestName || hasRole('master_administrator');
                      }
                    },
                    displayInvalid: 'error',
                    invalidError: 'All selected rows must be of the same SubType to Bulk Edit',
                    ...actions?.edit
                  },
                  delete: {
                    key: 'delete',
                    enabled: enableSelection !== false,
                    action: (allSelectedRows) => {
                      setWarningDialog({
                        dialogOpen: true,
                        dialogTitle: 'Are you sure?',
                        dialogContentText: 'You are about to delete this activity. Are you sure you want to do this?',
                        dialogActions: [
                          {
                            actionName: 'No',
                            actionOnClick: async () => {
                              setWarningDialog({ ...warningDialog, dialogOpen: false });
                            }
                          },
                          {
                            actionName: 'Yes',
                            actionOnClick: async () => {
                              setWarningDialog({ ...warningDialog, dialogOpen: false });

                              const selectedIds = allSelectedRows.map((row) => row[keyField]);
                              if (selectedIds.length) {
                                await dataAccess.deleteActivities(selectedIds, databaseContext);
                              }
                            },
                            autoFocus: true
                          }
                        ]
                      });
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
                      row.sync_status !== ActivitySyncStatus.SAVE_SUCCESSFUL &&
                      row.form_status === FormValidationStatus.VALID,
                    bulkCondition: (
                      selectedRows // only enable bulk sync if some field needs it
                    ) =>
                      selectedRows?.filter(
                        (row) =>
                          row.sync_status !== ActivitySyncStatus.SAVE_SUCCESSFUL &&
                          row.form_status === FormValidationStatus.VALID
                      )?.length > 0,
                    action: async (selectedRows) => {
                      try {
                        selectedRows.map(async (activity) => {
                          if (
                            activity.form_status !== FormValidationStatus.VALID ||
                            activity.sync_status === ActivitySyncStatus.SAVE_SUCCESSFUL
                          )
                            return;
                          const response: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
                          const dbActivity = response;
                          await dataAccess.updateActivity(
                            sanitizeRecord({
                              ...dbActivity,
                              sync_status: ActivitySyncStatus.SAVE_SUCCESSFUL
                            }),
                            databaseContext
                          );
                        });
                      } catch (error) {
                        console.log(error);
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
                      row.sync_status === ActivitySyncStatus.SAVE_SUCCESSFUL &&
                      row.form_status === FormValidationStatus.VALID &&
                      row.review_status !== ReviewStatus.UNDER_REVIEW,
                    bulkCondition: (
                      selectedRows // only enable bulk submit if some field needs it
                    ) =>
                      selectedRows?.filter(
                        (row) =>
                          row.sync_status === ActivitySyncStatus.SAVE_SUCCESSFUL &&
                          row.form_status === FormValidationStatus.VALID &&
                          row.review_status !== ReviewStatus.UNDER_REVIEW
                      )?.length > 0,
                    action: async (selectedRows) => {
                      try {
                        selectedRows.map(async (activity) => {
                          if (
                            activity.form_status !== FormValidationStatus.VALID ||
                            activity.sync_status !== ActivitySyncStatus.SAVE_SUCCESSFUL ||
                            activity.review_status === ReviewStatus.UNDER_REVIEW
                          )
                            return;
                          const response: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
                          const dbActivity = response;
                          await dataAccess.updateActivity(
                            sanitizeRecord({
                              ...dbActivity,
                              review_status: ReviewStatus.UNDER_REVIEW
                            }),
                            databaseContext
                          );
                          // const typename = activity.activity_subtype?.split('_')[2];
                          //notifySuccess(databaseContext, `${typename} activity has been marked for review.`);
                        });
                      } catch (error) {
                        // notifyError(databaseContext, JSON.stringify(error));
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
                      row.sync_status === ActivitySyncStatus.SAVE_SUCCESSFUL &&
                      row.form_status === FormValidationStatus.VALID &&
                      row.review_status === ReviewStatus.UNDER_REVIEW,
                    bulkCondition: (
                      selectedRows // only enable bulk submit if some field needs it
                    ) =>
                      selectedRows?.filter(
                        (row) =>
                          row.sync_status === ActivitySyncStatus.SAVE_SUCCESSFUL &&
                          row.form_status === FormValidationStatus.VALID &&
                          row.review_status === ReviewStatus.UNDER_REVIEW
                      )?.length > 0,
                    action: async (selectedRows) => {
                      try {
                        selectedRows.map(async (activity) => {
                          if (
                            activity.form_status !== FormValidationStatus.VALID ||
                            activity.sync_status !== ActivitySyncStatus.SAVE_SUCCESSFUL ||
                            activity.review_status !== ReviewStatus.UNDER_REVIEW
                          )
                            return;
                          const response: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
                          const dbActivity = response;
                          await dataAccess.updateActivity(
                            sanitizeRecord({
                              ...dbActivity,
                              review_status: ReviewStatus.APPROVED,
                              reviewed_by: bestName, // latest reviewer
                              reviewed_at: moment(new Date()).format()
                            }),
                            databaseContext
                          );
                          // const typename = activity.activity_subtype?.split('_')[2];
                          // notifySuccess(databaseContext, `${typename} activity has been reviewed and approved.`);
                        });
                      } catch (error) {
                        // notifyError(databaseContext, JSON.stringify(error));
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
                      row.sync_status === ActivitySyncStatus.SAVE_SUCCESSFUL &&
                      row.form_status === FormValidationStatus.VALID &&
                      row.review_status === ReviewStatus.UNDER_REVIEW,
                    bulkCondition: (
                      selectedRows // only enable bulk submit if some field needs it
                    ) =>
                      selectedRows?.filter(
                        (row) =>
                          row.sync_status === ActivitySyncStatus.SAVE_SUCCESSFUL &&
                          row.form_status === FormValidationStatus.VALID &&
                          row.review_status === ReviewStatus.UNDER_REVIEW
                      )?.length > 0,
                    action: async (selectedRows) => {
                      try {
                        selectedRows.map(async (activity) => {
                          if (
                            activity.form_status !== FormValidationStatus.VALID ||
                            activity.sync_status !== ActivitySyncStatus.SAVE_SUCCESSFUL ||
                            activity.review_status !== ReviewStatus.UNDER_REVIEW
                          )
                            return;
                          const response: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
                          const dbActivity = response;
                          await dataAccess.updateActivity(
                            sanitizeRecord({
                              ...dbActivity,
                              review_status: ReviewStatus.DISAPPROVED,
                              reviewed_by: bestName, // latest reviewer
                              reviewed_at: moment(new Date()).format()
                            }),
                            databaseContext
                          );
                          // const typename = activity.activity_subtype?.split('_')[2];
                          // notifySuccess(databaseContext, `${typename} activity has been reviewed and disapproved.`);
                        });
                      } catch (error) {
                        // notifyError(databaseContext, JSON.stringify(error));
                      }
                    },
                    icon: <Clear />,
                    ...actions?.disapprove
                  },
                  ...createActions
                }
          }
          {...otherProps}
        />
        <GeneralDialog
          dialogOpen={warningDialog.dialogOpen}
          dialogTitle={warningDialog.dialogTitle}
          dialogActions={warningDialog.dialogActions}
          dialogContentText={warningDialog.dialogContentText}
        />
      </>
    ),
    [rows?.length, props.selected?.length, JSON.stringify(actions), warningDialog]
  );
};

export const MyActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const { headers = [], ...otherProps } = props;
  const { bestName } = useSelector(selectAuth);

  return useMemo(() => {
    return (
      <ActivitiesTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[...headers, 'form_status', ...activitesDefaultHeaders]}
        created_by={bestName}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const FREPActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, ...otherProps } = props;
  return (
    <ActivitiesTable
      tableName="FREP Forms"
      activitySubtypes={[ActivitySubtype.Activity_FREP_FormC]}
      tableSchemaType={['Observation', 'FREP_FormC', ...arrayWrap(tableSchemaType)]}
      {...otherProps}
    />
  );
};

export const MyFREPTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, ...otherProps } = props;
  return useMemo(() => {
    return (
      <MyActivitiesTable
        tableName="FREP Forms"
        activitySubtypes={[ActivitySubtype.Activity_FREP_FormC]}
        tableSchemaType={['Observation', 'FREP_FormC', ...arrayWrap(tableSchemaType)]}
        {...otherProps}
      />
    );
  }, []);
};

export const MyAnimalActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, ...otherProps } = props;
  return useMemo(() => {
    return (
      <MyActivitiesTable
        tableName="Animal Observations"
        activitySubtypes={[ActivitySubtype.Activity_AnimalTerrestrial, ActivitySubtype.Activity_AnimalAquatic]}
        tableSchemaType={[
          'Observation',
          'Activity_AnimalTerrestrial',
          'Activity_AnimalAquatic',
          ...arrayWrap(tableSchemaType)
        ]}
        {...otherProps}
      />
    );
  }, []);
};

export const ObservationsTable: React.FC<IActivitiesTable> = (props) => {
  const history = useHistory();
  const { tableSchemaType, actions, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Observations"
        referenceData={props.referenceData}
        activitySubtypes={[ActivitySubtype.Observation_PlantTerrestrial, ActivitySubtype.Observation_PlantAquatic]}
        tableSchemaType={[
          'Observation',
          'Observation_PlantTerrestrial',
          'Observation_PlantAquatic',
          'ObservationPlantTerrestrialData',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[...headers, ...activitesDefaultHeaders]}
        actions={
          actions === false
            ? false
            : {
                ...actions,
                create_treatment: {
                  key: 'create_treatment',
                  enabled: false,
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
                  rowAction: true,
                  displayInvalid: 'error',
                  invalidError: 'Observation forms must be validated before they can be used to create a new Treatment',
                  // invalidError: 'All selected activities must be of the same SubType to create a Treatment',
                  /*
              Function to determine if all selected observation records are
              of the same subtype. For example: Cannot create a treatment if you select a plant
              and an animal observation, and most probably will not go treat a terrestrial
              and aquatic observation in a single treatment as those are different areas
              NOTE: we might have deprecated multiple treatment creation
            */
                  bulkCondition: (selectedRows) => selectedRows.every((a, _, [b]) => a.subtype === b.subtype),
                  rowCondition: (row) => row.form_status === FormValidationStatus.VALID,
                  ...actions?.create_treatment
                }
              }
        }
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(actions)]);
};

export const MyObservationsTable: React.FC<IActivitiesTable> = (props) => {
  const { headers = [], ...otherProps } = props;
  const { bestName } = useSelector(selectAuth);

  return useMemo(() => {
    return (
      <ObservationsTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[...headers, 'form_status']}
        created_by={bestName}
        review_status={[ReviewStatus.DISAPPROVED, ReviewStatus.PREAPPROVED, ReviewStatus.NOT_REVIEWED]}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const PlantTreatmentsTable: React.FC<IActivitiesTable> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const dataAccess = useDataAccess();
  const { roles } = useSelector(selectAuth);

  const { tableSchemaType, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Treatments"
        activitySubtypes={[
          ActivitySubtype.Treatment_ChemicalPlant,
          ActivitySubtype.Treatment_ChemicalPlantAquatic,
          ActivitySubtype.Treatment_MechanicalPlant,
          ActivitySubtype.Treatment_MechanicalPlantAquatic,
          ActivitySubtype.Treatment_BiologicalPlant
        ]}
        tableSchemaType={[
          'Treatment',
          'Treatment_ChemicalPlant',
          'Treatment_ChemicalPlantAquatic',
          'Treatment_MechanicalPlant',
          'Treatment_MechanicalPlantAquatic',
          'Treatment_BiologicalPlant',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[
          ...headers,
          {
            id: 'short_id',
            title: 'Activity ID'
          },
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels,
              Activity_Observation_PlantTerrestial: 'Terrestrial Plant' // TODO remove when our data isn't awful
            }
          },
          'date_created',
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
          'elevation',
          {
            id: 'activity_id',
            title: 'Full ID'
          }
        ]}
        dropdown={(row) => (
          <>
            <ActivitiesTable
              tableName=""
              key={row._id}
              tableSchemaType={[
                'Treatment',
                'Treatment_ChemicalPlant',
                'Treatment_MechanicalPlant',
                'Treatment_MechanicalPlantAquatic',
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
              actions={false}
            />

            <PlantMonitoringTable
              tableName="Linked Monitoring"
              key={row._id + '_monitoring'}
              rows={defaultActivitiesFetch({
                databaseContext,
                dataAccess,
                user_roles: roles,
                linked_id: row._id
              })}
              hideEmpty
              actions={{
                create_activity: {
                  // disable create buttons
                  enabled: false
                }
              }}
            />
          </>
        )}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length]);
};

export const MyPlantTreatmentsTable: React.FC<IActivitiesTable> = (props) => {
  const { headers = [], ...otherProps } = props;
  const { bestName } = useSelector(selectAuth);

  return useMemo(() => {
    return (
      <PlantTreatmentsTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[...headers, 'form_status']}
        created_by={bestName}
        review_status={[ReviewStatus.DISAPPROVED, ReviewStatus.PREAPPROVED, ReviewStatus.NOT_REVIEWED]}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const AnimalTreatmentsTable: React.FC<IActivitiesTable> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const dataAccess = useDataAccess();
  const { roles } = useSelector(selectAuth);

  const { tableSchemaType, headers = [], ...otherProps } = props;

  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Treatments"
        activitySubtypes={[
          ActivitySubtype.Treatment_MechanicalAnimalTerrestrial,
          ActivitySubtype.Treatment_ChemicalAnimalTerrestrial
        ]}
        tableSchemaType={[
          'Treatment',
          'Treatment_ChemicalAnimalTerrestrial',
          'Treatment_MechanicalAnimalTerrestrial',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[
          ...headers,
          {
            id: 'short_id',
            title: 'Activity ID'
          },
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels,
              Activity_Observation_AnimalTerrestrial: 'Terrestrial Animal' // TODO remove when our data isn't awful
            }
          },
          'date_created',
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
          'elevation',
          {
            id: 'activity_id',
            title: 'Full ID'
          }
        ]}
        dropdown={(row) => (
          <>
            <ActivitiesTable
              tableName=""
              key={row._id}
              tableSchemaType={[
                'Treatment',
                'Treatment_ChemicalAnimalTerrestrial',
                'Treatment_MechanicalAnimalTerrestrial',
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
              actions={false}
            />

            <AnimalMonitoringTable
              tableName="Linked Monitoring"
              key={row._id + '_monitoring'}
              rows={defaultActivitiesFetch({
                databaseContext,
                dataAccess,
                user_roles: roles,
                linked_id: row._id
              })}
              hideEmpty
              actions={{
                create_activity: {
                  // disable create buttons
                  enabled: false
                }
              }}
            />
          </>
        )}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length]);
};

export const MyAnimalTreatmentsTable: React.FC<IActivitiesTable> = (props) => {
  const { headers = [], ...otherProps } = props;
  const { bestName } = useSelector(selectAuth);

  return useMemo(() => {
    return (
      <AnimalTreatmentsTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[...headers, 'form_status']}
        created_by={bestName}
        review_status={[ReviewStatus.DISAPPROVED, ReviewStatus.PREAPPROVED, ReviewStatus.NOT_REVIEWED]}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const PlantMonitoringTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Treatment Monitoring"
        activitySubtypes={[
          ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant,
          ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant,
          ActivitySubtype.Monitoring_BiologicalTerrestrialPlant
        ]}
        tableSchemaType={[
          'Monitoring',
          'Monitoring_ChemicalTerrestrialAquaticPlant',
          'Monitoring_MechanicalTerrestrialAquaticPlant',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[
          ...headers,
          {
            id: 'short_id',
            title: 'Activity ID'
          },
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels,
              Activity_Observation_PlantTerrestial: 'Terrestrial Plant' // TODO remove when our data isn't awful
            }
          },
          'date_created',
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
          'elevation',
          {
            id: 'activity_id',
            title: 'Full ID'
          }
        ]}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length]);
};

export const MyPlantMonitoringTable: React.FC<IActivitiesTable> = (props) => {
  const { headers = [], ...otherProps } = props;
  const { bestName } = useSelector(selectAuth);

  return useMemo(() => {
    return (
      <PlantMonitoringTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[...headers, 'form_status']}
        created_by={bestName}
        review_status={[ReviewStatus.DISAPPROVED, ReviewStatus.PREAPPROVED, ReviewStatus.NOT_REVIEWED]}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const AnimalMonitoringTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Treatment Monitoring"
        activitySubtypes={[
          ActivitySubtype.Monitoring_ChemicalAnimalTerrestrial,
          ActivitySubtype.Monitoring_MechanicalAnimalTerrestrial
        ]}
        tableSchemaType={[
          'Monitoring',
          'Monitoring_ChemicalAnimalTerrestrial',
          'Monitoring_MechanicalAnimalTerrestrial',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[
          ...headers,
          {
            id: 'short_id',
            title: 'Activity ID'
          },
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels,
              Activity_Observation_AnimalTerrestrial: 'Terrestrial Animal' // TODO remove when our data isn't awful
            }
          },
          'date_created',
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
          'elevation',
          {
            id: 'activity_id',
            title: 'Full ID'
          }
        ]}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length]);
};

export const MyAnimalMonitoringTable: React.FC<IActivitiesTable> = (props) => {
  const { headers = [], ...otherProps } = props;
  const { bestName } = useSelector(selectAuth);

  return useMemo(() => {
    return (
      <AnimalMonitoringTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[...headers, 'form_status']}
        created_by={bestName}
        review_status={[ReviewStatus.DISAPPROVED, ReviewStatus.PREAPPROVED, ReviewStatus.NOT_REVIEWED]}
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
          ActivitySubtype.Transect_BiocontrolEfficacy,
          ActivitySubtype.Monitoring_BiologicalTerrestrialPlant,
          ActivitySubtype.Monitoring_BiologicalDispersal
        ]}
        {...props}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(props.actions)]);
};

export const TransectsTable: React.FC<IActivitiesTable> = (props) => {
  const { headers, ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Transects"
        activitySubtypes={[
          ActivitySubtype.Transect_FireMonitoring,
          ActivitySubtype.Transect_BiocontrolEfficacy,
          ActivitySubtype.Transect_Vegetation
        ]}
        headers={[...headers, ...activitesDefaultHeaders]}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(props.actions)]);
};

export const MyTransectsTable: React.FC<IActivitiesTable> = (props) => {
  const { headers = [], ...otherProps } = props;
  const { bestName } = useSelector(selectAuth);

  return useMemo(() => {
    return (
      <TransectsTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[...headers, 'form_status']}
        created_by={bestName}
        review_status={[ReviewStatus.DISAPPROVED, ReviewStatus.PREAPPROVED, ReviewStatus.NOT_REVIEWED]}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const BiocontrolTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, actions, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Biological Control"
        activitySubtypes={[ActivitySubtype.Collection_Biocontrol, ActivitySubtype.Monitoring_BiologicalDispersal]}
        tableSchemaType={['Collection', 'Collection_Biocontrol', ...arrayWrap(tableSchemaType)]}
        headers={[
          ...headers,
          {
            id: 'short_id',
            title: 'Activity ID'
          },
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels,
              Activity_Collection_Biocontrol: 'Biocontrol Collection' // TODO remove when our data isn't awful
            }
          },
          'date_created',
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
          {
            id: 'activity_id',
            title: 'Full ID'
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
            actions={
              actions === false
                ? false
                : {
                    sync: {
                      enabled: false
                    }
                  }
            }
          />
        )}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(actions)]);
};

export const MyBiocontrolTable: React.FC<IActivitiesTable> = (props) => {
  const { headers = [], ...otherProps } = props;
  const { bestName } = useSelector(selectAuth);

  return useMemo(() => {
    return (
      <BiocontrolTable
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[...headers, 'form_status']}
        created_by={bestName}
        review_status={[ReviewStatus.DISAPPROVED, ReviewStatus.PREAPPROVED, ReviewStatus.NOT_REVIEWED]}
        {...otherProps}
      />
    );
  }, [headers?.length]);
};

export const PointsOfInterestTable: React.FC<IRecordTable> = (props) => {
  const { tableSchemaType, actions, ...otherProps } = props;
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
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
          'date_created',
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
          const response = await dataAccess.getPointsOfInterest(
            {
              page: Math.floor((page * rowsPerPage) / dbPageSize),
              limit: dbPageSize,
              order: order
            },
            databaseContext
          );
          console.log('RES: ', response);
          return {
            rows: response.rows.map(poiStandardDBMapping) || [],
            count: response.count || 0
          };
        }}
        actions={
          actions === false
            ? false
            : {
                ...actions,
                delete: {
                  enabled: false,
                  ...actions?.delete
                },
                edit: {
                  enabled: false,
                  ...actions?.edit
                }
              }
        }
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

export const ReviewActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const { rows, headers = [], ...otherProps } = props;
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
  const { roles } = useSelector(selectAuth);

  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Under Review"
        startingOrderBy="created_timestamp"
        startingOrder="asc"
        headers={[...headers, 'form_status', ...activitesDefaultHeaders]}
        rows={
          rows ||
          defaultActivitiesFetch({
            databaseContext,
            dataAccess,
            user_roles: roles,
            activitySubtypes: Object.values(ActivitySubtype),
            review_status: [ReviewStatus.UNDER_REVIEW]
          })
        }
        {...otherProps}
      />
    );
  }, [rows?.length]);
};

export const MyPastActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  return useMemo(() => {
    return (
      <MyActivitiesTable
        tableName="My Old Activities"
        review_status={[ReviewStatus.APPROVED, ReviewStatus.PREAPPROVED]}
        {...props}
      />
    );
  }, []);
};
