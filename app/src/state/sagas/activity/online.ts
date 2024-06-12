import { put, select, take } from 'redux-saga/effects';
import { ActivityStatus } from 'sharedAPI';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';

import {
  ACTIVITIES_GEOJSON_REFETCH_ONLINE,
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_DELETE_FAILURE,
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_GET_FAILURE,
  ACTIVITY_GET_NETWORK_REQUEST,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS,
  ACTIVITY_SAVE_SUCCESS,
  ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
  AUTH_INITIALIZE_COMPLETE
} from 'state/actions';
import { selectActivity } from 'state/reducers/activity';
import { selectAuth } from 'state/reducers/auth';

//
export function* handle_ACTIVITY_CREATE_NETWORK(action) {
  yield InvasivesAPI_Call('POST', `/api/activity/`, action.payload.activity);

  yield put(ACTIVITY_CREATE_SUCCESS({ activity_id: action.payload.activity.activity_id }));
}

export function* handle_ACTIVITY_DELETE_NETWORK_REQUEST() {
  try {
    const activityState = yield select(selectActivity);
    console.dir(activityState);
    const networkReturn = yield InvasivesAPI_Call('DELETE', `/api/activities`, {
      ids: [activityState.activity.activity_id]
    });
    if (networkReturn?.status == 200) {
      yield put(ACTIVITY_DELETE_SUCCESS());
    } else {
      yield put(ACTIVITY_DELETE_FAILURE());
    }
  } catch (e) {
    yield put(ACTIVITY_DELETE_FAILURE());
  }
}

export function* handle_ACTIVITY_GET_NETWORK_REQUEST(action) {
  if (!ACTIVITY_GET_NETWORK_REQUEST.match(action)) {
    return;
  }

  const authState = yield select(selectAuth);
  if (!authState.authenticated) {
    yield take(AUTH_INITIALIZE_COMPLETE.type);
  }
  const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${action.payload}`);

  if (!(networkReturn.status === 200)) {
    yield put(ACTIVITY_GET_FAILURE({ reason: JSON.stringify(networkReturn) }));
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

  yield put(ACTIVITY_GET_SUCCESS({ activity: datav2 }));
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
  if (newActivity.media_delete_keys?.length) {
    const keys = newActivity.media_delete_keys;
    for (const key of keys) {
      const deleteReturn = yield InvasivesAPI_Call('DELETE', `/api/media/delete/${key}`);
      if (deleteReturn) {
        keys_to_delete.push(key);
      }
    }
  }

  const filtered_media_delete_keys = newActivity.media_delete_keys.filter((key) => !keys_to_delete.includes(key));

  const networkReturn = yield InvasivesAPI_Call('PUT', `/api/activity/`, {
    ...newActivity,
    activity_id: oldActivity.activity.activity_id
  });
  //const validatedReturn = yield checkForErrors(networkReturn)

  //        const remappedBlob = yield mapDBActivityToDoc(networkReturn.data)
  if (networkReturn.status < 200 || networkReturn.status > 299) {
    yield put(
      ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS({
        notification: {
          visible: true,
          message: networkReturn.data.message,
          severity: 'error'
        }
      })
    );
  } else {
    yield put(
      ACTIVITY_SAVE_SUCCESS({
        activity: {
          ...newActivity,
          media_delete_keys: filtered_media_delete_keys
        }
      })
    );
  }
  yield put(
    ACTIVITIES_GEOJSON_REFETCH_ONLINE({
      page: 0,
      limit: 100000
    })
  );
}

export function* handle_ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE(action) {
  if (action.payload.search_feature?.[0]) {
    const networkReturn = yield InvasivesAPI_Call('POST', `/api/jurisdictions/`, {
      search_feature: { ...action.payload.search_feature[0], properties: {} }
    });

    yield put(ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS({ jurisdictions: networkReturn.data.result }));
  }
}

export function* handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE() {
  try {
    const networkReturn = yield InvasivesAPI_Call('GET', `/api/application-user/`);

    yield put(ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS({ suggestedPersons: networkReturn.data.result }));
  } catch (e) {
    console.error(e);
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

    let treatments = [];
    const result = networkReturn?.data?.data?.result ? networkReturn?.data?.data?.result : networkReturn.data.result;
    if (result && result.length > 0) {
      treatments = result.map((treatment, i) => {
        console.dir(treatment);
        //const shortActID = getShortActivityID(treatment);
        return {
          label: treatment.short_id, //shortActID,
          title: treatment.short_id, //shortActID,
          value: treatment.activity_id,
          'x-code_sort_order': i + 1
        };
      });
    }

    yield put(ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS({ suggestedTreatmentIDs: treatments }));
  } catch (e) {
    console.error(e);
  }
}
