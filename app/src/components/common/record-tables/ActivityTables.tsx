import { Add, Check, Clear, Delete, Edit, FindInPage, Sync } from '@material-ui/icons';
import { useKeycloak } from '@react-keycloak/web';
import RecordTable, { IRecordTable } from 'components/common/RecordTable';
import {
  ActivitySubtype,
  ActivitySubtypeShortLabels,
  ActivitySyncStatus,
  FormValidationStatus,
  ReviewStatus
} from 'constants/activities';
import { DEFAULT_PAGE_SIZE, DocType } from 'constants/database';
import { DatabaseContext2 } from '../../../contexts/DatabaseContext2';
import { useDataAccess } from 'hooks/useDataAccess';
import moment from 'moment';
import React, { useContext, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import { arrayWrap, uniqueArray, sanitizeRecord, generateDBActivityPayload, getShortActivityID } from 'utils/addActivity';

export const PAGE_FETCH_BUFFER = 3; // fetches 3 pages before and after the current page of a Record Table (where page size is the current rowsPerPage)

// activityStandardMapping: flattens certain fields deep within an activity so they're accessible at the root level as header/column fields.
// Also maps the content of those to more easily-displayed formats, e.g. mapping arrays of jurisdiction objects to a single array
// future iterations might want to just use deeper keys in the header (e.g. "activity_payload.form_data.activity_data.latitude") instead of flattening here
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
    invasive_plant_code: doc.species_positive, // array
    date_created: flattened.created_timestamp?.substring(0, 10) + ' ' + flattened.date_created?.substring(11, 19),
    latitude: flattened.latitude && parseFloat(flattened.latitude).toFixed(6),
    longitude: flattened.longitude && parseFloat(flattened.longitude).toFixed(6),
    review_status_rendered:
      flattened.review_status === ReviewStatus.APPROVED || flattened.review_status === ReviewStatus.DISAPPROVED
        ? flattened.review_status + ' by ' + flattened.reviewed_by + ' at ' + flattened.reviewed_at
        : flattened.review_status
  };
};

// defaultActivitiesFetch: builds a fetch function for a given RecordTable type
// which will then be called by the table's pagination to fetch from the DB appropriately
// Future development should add geometry and filters search controls here so that a RecordTable can be passed
// those to do the search itself.  Alternatively, if a paraent component handles those, it will need to re-implement the paging function in here
export const defaultActivitiesFetch =
  ({
    databaseContext,
    dataAccess,
    activitySubtypes = [],
    created_by = undefined,
    review_status = [],
    linked_id = undefined
  }) =>
  async ({ page, rowsPerPage, order } : { page: number; rowsPerPage: number; order: string[]; }) : Promise<{ rows: any[]; count: number; }> => {
    // Fetches fresh from the API
    let dbPageSize = DEFAULT_PAGE_SIZE;
    if (dbPageSize - ((page * rowsPerPage) % dbPageSize) < PAGE_FETCH_BUFFER * rowsPerPage)
      // if page is right near the db page limit
      dbPageSize = (page * rowsPerPage) % dbPageSize; // set the limit to the current row count instead
    const types = uniqueArray(arrayWrap(activitySubtypes).map((subtype: string) => String(subtype).split('_')[1]));
    const result = await dataAccess.getActivities(
      {
        page: Math.floor((page * rowsPerPage) / dbPageSize),
        limit: dbPageSize,
        order: order,
        // search_feature: geometry
        activity_type: types,
        activity_subtype: arrayWrap(activitySubtypes),
        // filters: not implemented yet
        // startDate, endDate can be filters
        created_by: created_by, // my_keycloak_id
        review_status: review_status,
        linked_id: linked_id
      },
      databaseContext,
      true
    );
    return {
      rows: result?.rows?.map(activityStandardMapping) || [],
      count: parseInt(result?.count) || 0
    };
  };

export interface IActivitiesTable extends IRecordTable {
  workflow?: string;
  activitySubtypes?: any[];
  created_by?: string;
  review_status?: string[];
}

export const activitesDefaultHeaders = [
  {
    id: 'short_id',
    title: 'Activity ID'
  },
  'activity_type',
  {
    id: 'activity_subtype',
    valueMap: { ...ActivitySubtypeShortLabels }
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


/* useActions:
A handy list of "things which do things", usually accompanied by a button, and with behavior
generalized into JSON definitions.  Primarily used for RecordTable components, but could work
for anything in the app.  
*/
export const useActions = (props) => {
  const history = useHistory();
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext2);
  const { keycloak } = useKeycloak();
  const username = useKeycloakWrapper().preferred_username;

  const {
    actions, // overrides
    activitySubtypes,
    created_by,
    enableSelection = true,
    keyField = 'activity_id',
    review_status = [ReviewStatus.APPROVED, ReviewStatus.PREAPPROVED],
    tableSchemaType,
    ...otherProps
  } = props;

  const actionDefaults = {
    enabled: false,
    action: () => {},
    icon: null,
    label: "",
    bulkAction: false,
    rowAction: false,
    globalAction: false,
    triggerReload: false,
    displayInvalid: 'error',
  }

  // generate the default "create_activity_xyz" action buttons
  const createAction = (type: string, subtype: string) => ({
    ...actionDefaults,
    key: `create_activity_${subtype.toString().toLowerCase()}`,
    enabled: true,
    action: async (selectedRows) => {
      // create record
      const dbActivity = generateDBActivityPayload({}, null, type, subtype);
      dbActivity.created_by = username;
      await dataAccess.createActivity(dbActivity, databaseContext);

      // Redirect to new record:
      await dataAccess.setAppState({ activeActivity: dbActivity.activity_id }, databaseContext);
      history.push({ pathname: `/home/activity` });
    },
    icon: <Add />,
    label: ActivitySubtypeShortLabels[subtype],
    ...actions?.create_activity // overrides to create_activity will affect ALL create_activity_x actions
  });

  let createActions = {};
  arrayWrap(activitySubtypes).forEach((subtype) => {
    const action = createAction(subtype.toString().split('_')[1], subtype);
    createActions = {
      ...createActions,
      [action.key]: {
        ...action,
        ...actions?.[action.key] // allow individual prop overwrites still
      }
    };
  });

  return {
    ...actions,
    edit: {
      // NOTE: this might be a good candidate to be broken out to a parent class
      // since it breaks generality of this multi-purpose table
      key: 'edit',
      enabled: enableSelection !== false,
      action: async (allSelectedRows) => {
        const selectedIds = allSelectedRows.map((row) => row[keyField]);
        if (selectedIds.length === 1) {
          await dataAccess.setAppState({ activeActivity: selectedIds[0] }, databaseContext);

          // TODO switch by activity type, I guess...
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
        if (selectedIds.length) await dataAccess.deleteActivities(selectedIds, databaseContext);
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
            const dbActivity: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
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
            const dbActivity: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
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
            const dbActivity: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
            await dataAccess.updateActivity(
              sanitizeRecord({
                ...dbActivity,
                review_status: ReviewStatus.APPROVED,
                reviewed_by: username, // latest reviewer
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
            const dbActivity: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
            await dataAccess.updateActivity(
              sanitizeRecord({
                ...dbActivity,
                review_status: ReviewStatus.DISAPPROVED,
                reviewed_by: username, // latest reviewer
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
    create_treatment: {
      // Legacy, likely deprecated.
      // Creates a new treatment out of a number of observations, linking their data
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
      bulkCondition: (selectedRows) => selectedRows.every((a, _, [b]) => a.subtype === b.subtype),
      rowCondition: (row) => row.form_status === FormValidationStatus.VALID,
      ...actions?.create_treatment
    },
    ...createActions
  };
}

export const ActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const history = useHistory();
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext2);
  const { keycloak } = useKeycloak();
  const username = useKeycloakWrapper().preferred_username;

  const {
    actions,
    activitySubtypes,
    created_by,
    enableSelection = true,
    keyField = 'activity_id',
    review_status = [ReviewStatus.APPROVED, ReviewStatus.PREAPPROVED],
    tableSchemaType,
    ...otherProps
  } = props;

  // generate the default "create_activity_xyz" action buttons
  const createAction = (type: string, subtype: string) => ({
    key: `create_activity_${subtype.toString().toLowerCase()}`,
    enabled: true,
    action: async (selectedRows) => {
      // create record
      const dbActivity = generateDBActivityPayload({}, null, type, subtype);
      dbActivity.created_by = username;
      await dataAccess.createActivity(dbActivity, databaseContext);

      // Redirect to new record:
      await dataAccess.setAppState({ activeActivity: dbActivity.activity_id }, databaseContext);
      history.push({ pathname: `/home/activity` });
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

  const defaultActions = {
    ...actions,
    edit: {
      // NOTE: this might be a good candidate to be broken out to a parent class
      // since it breaks generality of this multi-purpose table
      key: 'edit',
      enabled: enableSelection !== false,
      action: async (allSelectedRows) => {
        const selectedIds = allSelectedRows.map((row) => row[keyField]);
        if (selectedIds.length === 1) {
          await dataAccess.setAppState({ activeActivity: selectedIds[0] }, databaseContext);

          // TODO switch by activity type, I guess...
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
        if (selectedIds.length) await dataAccess.deleteActivities(selectedIds, databaseContext);
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
            const dbActivity: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
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
            const dbActivity: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
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
            const dbActivity: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
            await dataAccess.updateActivity(
              sanitizeRecord({
                ...dbActivity,
                review_status: ReviewStatus.APPROVED,
                reviewed_by: username, // latest reviewer
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
            const dbActivity: any = await dataAccess.getActivityById(activity.activity_id, databaseContext);
            await dataAccess.updateActivity(
              sanitizeRecord({
                ...dbActivity,
                review_status: ReviewStatus.DISAPPROVED,
                reviewed_by: username, // latest reviewer
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
    create_treatment: {
      // Legacy, likely deprecated.
      // Creates a new treatment out of a number of observations, linking their data
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
      bulkCondition: (selectedRows) => selectedRows.every((a, _, [b]) => a.subtype === b.subtype),
      rowCondition: (row) => row.form_status === FormValidationStatus.VALID,
      ...actions?.create_treatment
    },
    ...createActions
  };

  let rows = props.rows;
  if (Array.isArray(rows)) rows = rows.map(activityStandardMapping);
  if (typeof rows === 'undefined') {
    rows = defaultActivitiesFetch({
      databaseContext,
      dataAccess,
      activitySubtypes: arrayWrap(activitySubtypes),
      created_by,
      review_status
    });
  }

  return useMemo(
    () => (
      <RecordTable
        tableName="Activities"
        tableSchemaType={['Activity', 'Jurisdiction', ...arrayWrap(tableSchemaType)]}
        startingOrderBy="activity_id"
        startingOrder="desc"
        startExpanded
        headers={activitesDefaultHeaders} // overwritten by props.headers if present
        actions={
          actions === false
            ? false
            : defaultActions
        }
        {...{enableSelection, rows, keyField}}
        {...otherProps}
      />
    ),
    [rows?.length, props.selected?.length, JSON.stringify(actions)]
  );
};

export const AnimalActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, ...otherProps } = props;
  return (
    <ActivitiesTable
      tableName="Animal Activities"
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
};

export const ObservationsTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Observations"
        activitySubtypes={[ActivitySubtype.Observation_PlantTerrestrial, ActivitySubtype.Observation_PlantAquatic]}
        tableSchemaType={[
          'Observation',
          'Observation_PlantTerrestrial',
          'Observation_PlantAquatic',
          'ObservationPlantTerrestrialData',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[...headers, ...activitesDefaultHeaders]}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length]);
};

export const TreatmentsTable: React.FC<IActivitiesTable> = (props) => {
  const databaseContext = useContext(DatabaseContext2);
  const dataAccess = useDataAccess();
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
            valueMap: { ...ActivitySubtypeShortLabels }
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

            <MonitoringTable
              tableName="Linked Monitoring"
              key={row._id + '_monitoring'}
              rows={defaultActivitiesFetch({
                databaseContext,
                dataAccess,
                linked_id: row._id
              })}
              hideEmpty
              actions={false}
              enableSelection={false}
            />
          </>
        )}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length]);
};

export const MonitoringTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Treatment Monitoring"
        activitySubtypes={[
          ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant,
          ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant,
          ActivitySubtype.Monitoring_BiologicalTerrestrialPlant,
          ActivitySubtype.Activity_BiologicalDispersal
        ]}
        tableSchemaType={[
          'Monitoring',
          'Monitoring_ChemicalTerrestrialAquaticPlant',
          'Monitoring_MechanicalTerrestrialAquaticPlant',
          'Monitoring_BiologicalTerrestrialPlant',
          'Activity_BiologicalDispersal',
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
            valueMap: { ...ActivitySubtypeShortLabels }
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

export const TransectsTable: React.FC<IActivitiesTable> = (props) => {
  const { headers, ...otherProps } = props;
  return <ActivitiesTable
    tableName="Transects"
    activitySubtypes={[
      ActivitySubtype.Transect_Vegetation,
      ActivitySubtype.Transect_FireMonitoring,
      ActivitySubtype.Transect_BiocontrolEfficacy
    ]}
    headers={[...headers, ...activitesDefaultHeaders]}
    {...otherProps}
  />
};

export const BiocontrolTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, actions, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Biological Control"
        activitySubtypes={[ActivitySubtype.Collection_Biocontrol]}
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
              ...ActivitySubtypeShortLabels
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
            actions={false}
          />
        )}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(actions)]);
};

export default {
  ActivitiesTable,
  AnimalActivitiesTable,
  ObservationsTable,
  TreatmentsTable,
  MonitoringTable,
  TransectsTable,
  BiocontrolTable
};