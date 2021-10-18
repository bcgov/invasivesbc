import { Add, Check, Clear, Delete, Edit, FindInPage, Sync } from '@material-ui/icons';
import { useKeycloak } from '@react-keycloak/web';
import {
  ActivitySubtypeShortLabels,
  ActivitySyncStatus,
  FormValidationStatus,
  ReviewStatus
} from 'constants/activities';
import { DatabaseContext2 } from 'contexts/DatabaseContext2';
import { useDataAccess } from 'hooks/useDataAccess';
import moment from 'moment';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import {
  arrayWrap,
  sanitizeRecord,
  generateDBActivityPayload
} from 'utils/addActivity';

/* useActions:
A handy list of "things which do things", usually accompanied by a button, and with behavior
generalized into JSON definitions.  Primarily used for RecordTable components, but could work
for anything in the app.

Essentially the default behavior for Buttons in the app. See RecordTableAction for generalized definitions
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
    ...otherProps
  } = props;

  const actionDefaults = {
    enabled: false,
    action: () => {},
    icon: null,
    label: '',
    bulkAction: false,
    rowAction: false,
    globalAction: false,
    triggerReload: false,
    displayInvalid: 'error'
  };

  // generate the default "create_activity_xyz" action buttons
  const createAction = (type: string, subtype: string) => ({
    ...actionDefaults,
    id: `create_activity_${subtype.toString().toLowerCase()}`,
    enabled: true,
    globalAction: true,
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
      [action.id]: {
        ...action,
        ...actions?.[action.id] // allow individual prop overwrites still
      }
    };
  });

  return {
    ...actions,
    edit: {
      // NOTE: this might be a good candidate to be broken out to a parent class
      // since it breaks generality of this multi-purpose table
      id: 'edit',
      enabled: enableSelection !== false,
      action: async (allSelectedRows) => {
        const selectedIds = allSelectedRows.map((row) => row[keyField]);
        if (selectedIds.length === 1) {
          await dataAccess.setAppState(
            { activeActivity: selectedIds[0], referenceData: props.referenceData },
            databaseContext
          );
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
      id: 'delete',
      enabled: enableSelection !== false,
      hasWarningDialog: true,
      warningDialogMessage: (affectedRows) =>
        affectedRows.length === 1
          ? 'Do you want to delete this activity?'
          : `Do you want to delete these ${affectedRows.length} activities?`,
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
      id: 'sync',
      enabled: true,
      label: 'Save',
      bulkAction: true,
      rowAction: true,
      displayInvalid: 'disable',
      triggerReload: true,
      rowCondition: (row) =>
        row.sync_status !== ActivitySyncStatus.SAVE_SUCCESSFUL && row.form_status === FormValidationStatus.VALID,
      bulkCondition: (
        selectedRows // only enable bulk sync if some field needs it
      ) =>
        selectedRows?.filter(
          (row) =>
            row.sync_status !== ActivitySyncStatus.SAVE_SUCCESSFUL && row.form_status === FormValidationStatus.VALID
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
      id: 'submit',
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
      id: 'approve',
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
      id: 'disapprove',
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
      id: 'create_treatment',
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
};

export default useActions;
