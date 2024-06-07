import { all, put, select, takeEvery } from 'redux-saga/effects';
import {
  EMAIL_SETTINGS_RETRIEVE_REQUEST,
  EMAIL_SETTINGS_RETRIEVE_REQUEST_SUCCESS,
  EMAIL_SETTINGS_UPDATE,
  EMAIL_SETTINGS_UPDATE_FAILURE,
  EMAIL_SETTINGS_UPDATE_SUCCESS
} from 'state/actions';
import { selectConfiguration } from 'state/reducers/configuration';
import { getCurrentJWT } from 'state/sagas/auth/auth';

function* fetchEmailSettings() {
  console.log('Fetch called...');
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/email-settings`, {
    headers: {
      Authorization: yield getCurrentJWT()
    }
  });

  const data = yield res.json();

  yield put({
    type: EMAIL_SETTINGS_RETRIEVE_REQUEST_SUCCESS,
    payload: {
      emailSettings: {
        enabled: data.result[0].enabled,
        authenticationURL: data.result[0].authenticationurl,
        emailServiceURL: data.result[0].emailserviceurl,
        clientId: data.result[0].clientid,
        clientSecret: data.result[0].clientsecret,
        id: data.result[0].id
      }
    }
  });
}

function* updateEmailSettings(action) {
  const configuration = yield select(selectConfiguration);
  const res = yield fetch(configuration.API_BASE + `/api/email-settings`, {
    method: 'PUT',
    headers: {
      Authorization: yield getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(action.payload)
  });
  const data = yield res.json();
  
  if (res.ok) {
    yield put({
      type: EMAIL_SETTINGS_UPDATE_SUCCESS,
      payload: {
        message: 'Email settings updated successfully',
        emailSettings: data.request
      }
    });
  } else {
    yield put({
      type: EMAIL_SETTINGS_UPDATE_FAILURE,
      payload: {
        message: data.message,
        emailSettings: data.request
      }
    });
  }
}

function* emailSettingsSaga() {
  yield all([
    takeEvery(EMAIL_SETTINGS_UPDATE, updateEmailSettings),
    takeEvery(EMAIL_SETTINGS_RETRIEVE_REQUEST, fetchEmailSettings)
  ]);
}

export default emailSettingsSaga;
