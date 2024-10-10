import { put, select, take } from 'redux-saga/effects';
import { ActivityStatus } from 'sharedAPI';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';

import {
  ACTIVITIES_GEOJSON_REFETCH_ONLINE,
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_DELETE_FAILURE,
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_GET_FAILURE,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_SAVE_SUCCESS,
  AUTH_INITIALIZE_COMPLETE
} from 'state/actions';
import { selectActivity } from 'state/reducers/activity';
import { selectAuth } from 'state/reducers/auth';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import Alerts from 'state/actions/alerts/Alerts';
import Activity from 'state/actions/activity/Activity';
import SuggestedTreatmentId from 'interfaces/SuggestedTreatmentId';

export function* handle_ACTIVITY_CREATE_NETWORK(action) {
  yield InvasivesAPI_Call('POST', `/api/activity/`, action.payload.activity);
  yield put({ type: ACTIVITY_CREATE_SUCCESS, payload: { activity_id: action.payload.activity.activity_id } });
}

export function* handle_ACTIVITY_DELETE_NETWORK_REQUEST() {
  try {
    const activityState = yield select(selectActivity);
    const networkReturn = yield InvasivesAPI_Call('DELETE', `/api/activities`, {
      ids: [activityState.activity.activity_id]
    });
    if (networkReturn?.status == 200) {
      yield put({ type: ACTIVITY_DELETE_SUCCESS });
    } else {
      yield put({ type: ACTIVITY_DELETE_FAILURE });
    }
  } catch (e) {
    yield put({ type: ACTIVITY_DELETE_FAILURE });
  }
}

export function* handle_ACTIVITY_GET_NETWORK_REQUEST(action) {
  const authState = yield select(selectAuth);
  if (!authState.authenticated) {
    yield take(AUTH_INITIALIZE_COMPLETE);
  }
  const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${action.payload.activityID}`);

  if (!(networkReturn.status === 200)) {
    yield put({ type: ACTIVITY_GET_FAILURE, payload: { failNetworkObj: networkReturn } });
    return;
  }

  const datav2 = {
    ...networkReturn.data,
    species_positive: networkReturn.data.species_positive || [],
    species_negative: networkReturn.data.species_negative || [],
    species_treated: networkReturn.data.species_treated || [],
    media: networkReturn.data.media || [],
    media_delete_keys: networkReturn.data.media_delete_keys || []
  };

  //const validatedReturn = yield checkForErrors(networkReturn)

  // const remappedBlob = yield mapDBActivityToDoc(networkReturn.data)

  yield put({ type: ACTIVITY_GET_SUCCESS, payload: { activity: datav2 } });
}

export function* handle_ACTIVITY_SAVE_NETWORK_REQUEST(action) {
  //save to server

  const oldActivity = yield select(selectActivity);

  const newActivity = {
    ...oldActivity.activity,
    species_positive: oldActivity.activity?.species_positive[0] !== null ? oldActivity.activity?.species_positive : [],
    species_negative: oldActivity.activity?.species_negative[0] !== null ? oldActivity.activity?.species_negative : [],
    species_treated: oldActivity.activity?.species_treated[0] !== null ? oldActivity.activity?.species_treated : [],
    form_data: action.payload.updatedFormData ? action.payload.updatedFormData : oldActivity.activity.form_data,
    form_status: [ActivityStatus.DRAFT, ActivityStatus.IN_REVIEW, ActivityStatus.SUBMITTED].includes(
      action.payload.form_status
    )
      ? action.payload.form_status
      : ActivityStatus.DRAFT
  };

  // handle delete photos if needed
  const keys_to_delete: string[] = [];
  const filtered_media_delete_keys: string[] = [];
  if (newActivity.media_delete_keys) {
    if (newActivity.media_delete_keys.length > 0) {
      {
        const keys = newActivity.media_delete_keys;
        for (const key of keys) {
          const deleteReturn = yield InvasivesAPI_Call('DELETE', `/api/media/delete/${key}`);
          if (deleteReturn) {
            keys_to_delete.push(key);
          }
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
  //const validatedReturn = yield checkForErrors(networkReturn)

  //        const remappedBlob = yield mapDBActivityToDoc(networkReturn.data)
  if (networkReturn.status < 200 || networkReturn.status > 299) {
    yield put(
      Alerts.create({
        content: networkReturn.data.message,
        severity: AlertSeverity.Error,
        subject: AlertSubjects.Form
      })
    );
  } else {
    yield put({
      type: ACTIVITY_SAVE_SUCCESS,
      payload: {
        activity: {
          ...newActivity,
          media_delete_keys: filtered_media_delete_keys
        }
      }
    });
  }
  yield put({
    type: ACTIVITIES_GEOJSON_REFETCH_ONLINE,
    payload: {
      page: 0,
      limit: 100000
    }
  });
}

export function* handle_ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE(action) {
  try {
    const userOnline = !(yield select(selectAuth)).workingOffline;
    const searchFeature = action.payload?.[0] ?? null;
    if (searchFeature && userOnline) {
      const networkReturn = yield InvasivesAPI_Call('POST', `/api/jurisdictions/`, {
        search_feature: { ...searchFeature, properties: {} }
      });
      yield put(Activity.Suggestions.jurisdictionsSuccess(networkReturn.data.result ?? []));
    }
  } catch (err) {
    console.error(err);
    yield put(
      Alerts.create({
        content: 'An error occured while fetching suggested Jurisdictions. Suggestions will not be displayed',
        severity: AlertSeverity.Error,
        subject: AlertSubjects.Form,
        autoClose: 8
      })
    );
  }
}

export function* handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE() {
  try {
    const userOnline = !(yield select(selectAuth)).workingOffline;
    if (userOnline) {
      const networkReturn = yield InvasivesAPI_Call('GET', `/api/application-user/`);
      yield put(Activity.Suggestions.personsSuccess(networkReturn.data.result ?? []));
    }
  } catch (e) {
    console.error(e);
    yield put(
      Alerts.create({
        content: 'An error occured while fetching suggested persons. Suggestions will not be displayed',
        severity: AlertSeverity.Error,
        subject: AlertSubjects.Form,
        autoClose: 8
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
        filterType: 'spatialFilterDrawn',
        operator: 'CONTAINED IN',
        operator2: 'AND',
        filter: '0.113619259813296791712616073543',
        geojson: search_feature?.features?.[0]
      });
    }
    const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
      filterObjects: [filterObject]
    });
    let treatments: SuggestedTreatmentId[] = [];
    const result = networkReturn?.data?.data?.result ? networkReturn?.data?.data?.result : networkReturn.data.result;
    if (result && result.length > 0) {
      treatments = result.map((treatment, i) => {
        return {
          label: treatment.short_id, //shortActID,
          title: treatment.short_id, //shortActID,
          value: treatment.activity_id,
          'x-code_sort_order': i + 1
        };
      });
    }
    yield put(Activity.Suggestions.treatmentIdsSuccess(treatments));
  } catch (e) {
    console.error(e);
    yield put(
      Alerts.create({
        content: 'An error occured while fetching suggested persons. Suggestions will not be displayed',
        severity: AlertSeverity.Error,
        subject: AlertSubjects.Form,
        autoClose: 8
      })
    );
  }
}
