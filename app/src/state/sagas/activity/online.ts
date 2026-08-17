import { put, select, take } from 'redux-saga/effects';
import { ActivityStatus, ActivitySyncStatus } from 'sharedAPI';
import { PayloadAction } from '@reduxjs/toolkit';
import { getLinkedTreatmentsFromCachedRecords } from './dataAccess';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { selectActivity } from 'state/reducers/activity';
import { selectAuth } from 'state/reducers/auth';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import Alerts from 'state/actions/alerts/Alerts';
import Activity from 'state/actions/activity/Activity';
import SuggestedTreatmentId from 'interfaces/SuggestedTreatmentId';
import { AuthActions } from 'state/actions/auth/Auth';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import parseActivityForPermissions from 'utils/parseActivityForPermissions';
import EFilterType from 'constants/EFilterType';
import { PLATFORM_SRC } from 'constants/misc';

export function* handle_ACTIVITY_CREATE_NETWORK(action: PayloadAction<Record<string, any>>) {
  const response = yield InvasivesAPI_Call('POST', `/api/activity/`, action.payload);
  if (response?.ok) {
    yield put(Activity.createSuccess(action.payload.activity_id));
  } else {
    yield put(
      Alerts.create({
        content: response?.data?.message ?? 'Error occurred while creating activity.',
        severity: AlertSeverity.Error,
        subject: AlertSubjects.Form,
        autoClose: 5
      })
    );
  }
}

export function* handle_ACTIVITY_DELETE_NETWORK_REQUEST() {
  try {
    const activityState = yield select(selectActivity);
    const networkReturn = yield InvasivesAPI_Call('DELETE', `/api/activities`, {
      ids: [activityState.activity.activity_id]
    });
    if (networkReturn?.ok) {
      yield put(Activity.deleteSuccess());
    } else {
      yield put(Activity.deleteFailure());
    }
  } catch (_e) {
    yield put(Activity.deleteFailure());
  }
}

export function* handle_ACTIVITY_GET_NETWORK_REQUEST(action) {
  const authState = yield select(selectAuth);
  if (!authState.authenticated) {
    yield take(AuthActions.initializeComplete.type);
  }
  const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${action.payload}`);

  if (!networkReturn?.ok) {
    yield put(Activity.getFailure(networkReturn));
    return;
  }

  const datav2 = {
    ...networkReturn.data,
    species_positive: networkReturn.data.species_positive || [],
    species_negative: networkReturn.data.species_negative || [],
    species_treated: networkReturn.data.species_treated || [],
    media: networkReturn.data.media || [],
    media_delete_keys: networkReturn.data.media_delete_keys || [],
    platform_src: PLATFORM_SRC
  };

  yield put(Activity.getSuccess({ activity: datav2, permissions: parseActivityForPermissions(datav2) }));
}

export function* handle_ACTIVITY_SAVE_NETWORK_REQUEST(action) {
  //save to server
  try {
    const oldActivity = yield select(selectActivity);

    const newActivity = {
      ...oldActivity.activity,
      species_positive:
        oldActivity.activity?.species_positive[0] !== null ? oldActivity.activity?.species_positive : [],
      species_negative:
        oldActivity.activity?.species_negative[0] !== null ? oldActivity.activity?.species_negative : [],
      species_treated: oldActivity.activity?.species_treated[0] !== null ? oldActivity.activity?.species_treated : [],
      form_data: action.payload?.updatedFormData ?? oldActivity.activity.form_data,
      form_status: [ActivityStatus.DRAFT, ActivityStatus.IN_REVIEW, ActivityStatus.SUBMITTED].includes(
        action.payload.form_status
      )
        ? action.payload.form_status
        : ActivityStatus.DRAFT,
      sync_status:
        action.payload.form_status === ActivityStatus.SUBMITTED
          ? ActivitySyncStatus.SAVE_SUCCESSFUL
          : ActivitySyncStatus.SAVE_SUCCESSFUL_PRIVATE
    };

    // handle delete photos if needed
    const keys_to_delete: string[] = [];
    const filtered_media_delete_keys: string[] = [];
    if (newActivity.media_delete_keys) {
      if (newActivity.media_delete_keys.length > 0) {
        const keys = newActivity.media_delete_keys;
        for (const key of keys) {
          const deleteReturn = yield InvasivesAPI_Call('DELETE', `/api/media/delete/${key}`);
          if (deleteReturn) {
            keys_to_delete.push(key);
          }
        }
      }
      filtered_media_delete_keys.push(
        ...newActivity.media_delete_keys.filter((key: string) => !keys_to_delete.includes(key))
      );
    }

    const networkReturn = yield InvasivesAPI_Call('PUT', `/api/activity/`, {
      ...newActivity,
      activity_id: oldActivity.activity.activity_id
    });

    if (networkReturn?.ok) {
      yield put(
        Activity.saveSuccess({
          ...newActivity,
          media_delete_keys: filtered_media_delete_keys
        })
      );
    } else {
      yield put(
        Alerts.create({
          content: networkReturn.data.message,
          severity: AlertSeverity.Error,
          subject: AlertSubjects.Form
        })
      );
    }
  } catch (e) {
    console.error(e);
    yield put(
      Alerts.create({
        content:
          'An Error occured while attempting to upload your activity. Please check your internet connection and try again.',
        severity: AlertSeverity.Error,
        subject: AlertSubjects.Form
      })
    );
  }
}

export function* handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE(action) {
  try {
    const search_feature = action.payload.search_feature;
    // convert to v2 endpoint call:

    const filterObject: any = {
      recordSetType: 'Activity',
      tableFilters: [
        {
          id: '2',
          field: 'form_status',
          operator1: 'CONTAINS',
          operator2: 'AND',
          filterType: 'tableFilter',
          filter: 'Submitted'
        },
        {
          id: '3',
          field: 'activity_subtype',
          operator: 'CONTAINS',
          operator2: 'AND',
          filterType: 'tableFilter',
          filter: action.payload.activity_subtype[0]
        }
      ],
      selectColumns: ['activity_id', 'short_id']
    };

    if (action.payload.search_feature?.features?.[0]) {
      filterObject.tableFilters.push({
        filterType: EFilterType.Drawn,
        operator: 'CONTAINED IN',
        operator2: 'AND',
        filter: '0.113619259813296791712616073543',
        geojson: search_feature?.features?.[0]
      });
    }
    const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
      filterObjects: [filterObject]
    });
    if (networkReturn?.ok) {
      let treatments: SuggestedTreatmentId[] = [];
      const result = networkReturn?.data?.data?.result ? networkReturn?.data?.data?.result : networkReturn.data.result;
      if (result && result.length > 0) {
        treatments = result.map((treatment, i) => ({
          label: treatment.short_id, //shortActID,
          title: treatment.short_id, //shortActID,
          value: treatment.activity_id,
          'x-code_sort_order': i + 1
        }));
      }
      yield put(Activity.Suggestions.treatmentIdsSuccess(treatments));
    } else if (buildTimeConfig.MOBILE) {
      yield getLinkedTreatmentsFromCachedRecords(action.payload);
    }
  } catch (e) {
    console.error(e);
    yield put(
      Alerts.create({
        content: 'An error occurred while fetching suggested treatment IDs. Suggestions will not be displayed',
        severity: AlertSeverity.Error,
        subject: AlertSubjects.Form,
        autoClose: 8
      })
    );
  }
}
