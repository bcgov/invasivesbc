import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { put, select } from 'redux-saga/effects';
import { ActivityStatus, getShortActivityID } from 'sharedAPI';

import {
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS,
  ACTIVITY_SAVE_SUCCESS
} from 'state/actions';
import { selectActivity } from 'state/reducers/activity';

const checkForErrors = (response: any, status?: any, url?: any) => {
  if (response.code > 201) {
  }
};

//
export function* handle_ACTIVITY_CREATE_NETWORK(action) {
  const networkReturn = yield InvasivesAPI_Call('POST', `/api/activity/`, action.payload.activity);

  yield put({ type: ACTIVITY_CREATE_SUCCESS, payload: { activity_id: action.payload.activity.activity_id } });
}

export function* handle_ACTIVITY_GET_NETWORK_REQUEST(action) {
  const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${action.payload.activityID}`);

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
  let keys_to_delete = [];
  if (newActivity.media_delete_keys?.length) {
    const keys = newActivity.media_delete_keys;
    for (let key of keys) {
      const deleteReturn = yield InvasivesAPI_Call('DELETE', `/api/media/delete/${key}`);
      if (deleteReturn) {
        keys_to_delete.push(key);
      }
    }
  }

  const filtered_media_delete_keys = newActivity.media_delete_keys.filter(key => !keys_to_delete.includes(key));

  const networkReturn = yield InvasivesAPI_Call('PUT', `/api/activity/`, {
    ...newActivity,
    activity_id: oldActivity.activity.activity_id
  });
  //const validatedReturn = yield checkForErrors(networkReturn)

  //        const remappedBlob = yield mapDBActivityToDoc(networkReturn.data)

  yield put({
    type: ACTIVITY_SAVE_SUCCESS, payload: {
      activity: {
        ...newActivity,
        media_delete_keys: filtered_media_delete_keys
      }
    }
  });
}

export function* handle_ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE(action) {
  const networkReturn = yield InvasivesAPI_Call('POST', `/api/jurisdictions/`, {
    search_feature: action.payload.search_feature[0]
  });

  yield put({
    type: ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS,
    payload: { jurisdictions: networkReturn.data.result }
  });
}

export function* handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE(action) {
  const networkReturn = yield InvasivesAPI_Call('GET', `/api/application-user/`);

  yield put({
    type: ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS,
    payload: { suggestedPersons: networkReturn.data.result }
  });
}

export function* handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE(action) {
  const search_feature = action.payload.search_feature;
  const networkReturn = yield InvasivesAPI_Call('GET', `/api/activities/`, {
    activity_subtype: action.payload.activity_subtype,
    search_feature,
    form_status: ["Submitted"]
  });

  let treatments = [];
  const result = (networkReturn?.data?.data?.result ? networkReturn?.data?.data?.result : networkReturn.data.result);
  if (result && result.length > 0) {
    treatments = result.map((treatment, i) => {
      const shortActID = getShortActivityID(treatment);
      return {
        label: shortActID,
        title: shortActID,
        value: treatment.activity_id,
        'x-code_sort_order': i + 1
      };
    });
  }

  yield put({
    type: ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS,
    payload: { suggestedTreatmentIDs: treatments }
  });
}
