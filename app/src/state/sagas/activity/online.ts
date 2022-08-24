import { Http } from '@capacitor-community/http';
import { ActivityStatus } from 'constants/activities';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { put, select } from 'redux-saga/effects';
import {
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_SAVE_SUCCESS,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS
} from 'state/actions';
import { selectActivity } from 'state/reducers/activity';
import { selectAuthHeaders } from 'state/reducers/auth';
import { selectConfiguration } from 'state/reducers/configuration';
import { mapDBActivityToDoc } from 'utils/addActivity';

const getRequestOptions = (config, requestHeaders) => {
  return {
    baseUrl: config.API_BASE,
    // baseUrl: 'https://api-dev-invasivesbci.apps.silver.devops.gov.bc.ca',
    headers: { 'Access-Control-Allow-Origin': '*', Authorization: requestHeaders.authorization }
  };
};

const checkForErrors = (response: any, status?: any, url?: any) => {
  if (response.code > 201) {
  }
};

function* InvasivesAPI_Call(method, endpoint, payloadData?) {
  // get config and request setup from store
  const requestOptions = yield select(selectAuthHeaders);
  const config = yield select(selectConfiguration);
  const options = getRequestOptions(config, requestOptions);

  const { data, status, url } = yield Http.request({
    method: method,
    headers: { ...options.headers, 'Content-Type': 'application/json' },
    url: options.baseUrl + endpoint,
    data: payloadData
  });

  return { data, status, url };
}

//
export function* handle_ACTIVITY_CREATE_NETWORK(action) {
  const networkReturn = yield InvasivesAPI_Call('POST', `/api/activity/`, action.payload.activity);

  yield put({ type: ACTIVITY_CREATE_SUCCESS, payload: { activity_id: action.payload.activity.activity_id } });
}

export function* handle_ACTIVITY_GET_NETWORK_REQUEST(action) {
  const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${action.payload.activityID}`);

  // temp workaround for trash from server:
  const species_positive = !networkReturn.data.species_positive[0] ? [] : networkReturn.data.species_positive;
  const species_negative = !networkReturn.data.species_negative[0] ? [] : networkReturn.data.species_negative;
  const species_treated = !networkReturn.data.species_treated[0] ? [] : networkReturn.data.species_treated;

  const datav2 = {
    ...networkReturn.data,
    species_positive: species_positive,
    species_negative: species_negative,
    species_treated: species_treated
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
    form_data: action.payload.updatedFormData ? action.payload.updatedFormData : oldActivity.activity.form_data,
    form_status: [ActivityStatus.DRAFT, ActivityStatus.IN_REVIEW, ActivityStatus.SUBMITTED].includes(
      action.payload.form_status
    )
      ? action.payload.form_status
      : ActivityStatus.DRAFT
  };

  const networkReturn = yield InvasivesAPI_Call('PUT', `/api/activity/`, {
    ...newActivity,
    activity_id: oldActivity.activity.activity_id
  });
  //const validatedReturn = yield checkForErrors(networkReturn)

  //        const remappedBlob = yield mapDBActivityToDoc(networkReturn.data)

  yield put({ type: ACTIVITY_SAVE_SUCCESS, payload: { activity: { ...newActivity } } });
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
