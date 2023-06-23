import {
  EMAIL_SETTINGS_RETRIEVE_REQUEST,
  EMAIL_SETTINGS_RETRIEVE_REQUEST_SUCCESS,
  EMAIL_SETTINGS_UPDATE,
  EMAIL_SETTINGS_UPDATE_SUCCESS,
  EMAIL_SETTINGS_UPDATE_FAILURE,
} from "state/actions";
import { all, takeEvery, select, put } from "redux-saga/effects";
import { selectConfiguration } from "state/reducers/configuration";
import { selectAuth } from "state/reducers/auth";
import { Http } from "@capacitor-community/http";

function* fetchEmailSettings() {
  console.log("Fetch called...")
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);

  const { data } = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/email-settings`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    }
  });
  yield put({
    type: EMAIL_SETTINGS_RETRIEVE_REQUEST_SUCCESS, payload: {
      emailSettings: {
        enabled: data.result[0].enabled,
        authenticationURL: data.result[0].authenticationurl,
        emailServiceURL: data.result[0].emailserviceurl,
        clientId: data.result[0].clientid,
        clientSecret: data.result[0].clientsecret,
        id: data.result[0].id,
      }
    }
  });
};

function* updateEmailSettings(action) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);
  const { data } = yield Http.request({
    method: 'PUT',
    url: configuration.API_BASE + `/api/email-settings`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    },
    data: action.payload
  });
  if (data.code >= 200 && data.code <= 300)
    yield put({
      type: EMAIL_SETTINGS_UPDATE_SUCCESS, payload: {
        'message': 'Email settings updated successfully',
        'emailSettings': data.request,
      }
    });
  else
    yield put({
      type: EMAIL_SETTINGS_UPDATE_FAILURE, payload: {
        'message': data.message,
        'emailSettings': data.request,
      }
    });
};

function* emailSettingsSaga() {
  yield all([
    takeEvery(EMAIL_SETTINGS_UPDATE, updateEmailSettings),
    takeEvery(EMAIL_SETTINGS_RETRIEVE_REQUEST, fetchEmailSettings),
  ]);
}

export default emailSettingsSaga;
