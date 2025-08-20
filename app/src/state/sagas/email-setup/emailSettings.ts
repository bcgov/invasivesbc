import { all, put, select, takeEvery } from 'redux-saga/effects';
import { EmailActions } from 'state/actions/email/emailActions';
import { selectConfiguration } from 'state/reducers/configuration';
import { getCurrentJWT } from 'state/sagas/auth/auth';

function* fetchEmailSettings() {
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/email-settings`, {
    headers: {
      Authorization: yield getCurrentJWT()
    }
  });

  const data = yield res.json();
  if (data.result.length === 0) {
    return;
  }
  yield put(
    EmailActions.retrieveReqSuccess({
      emailSettings: {
        enabled: data.result[0].enabled,
        authenticationURL: data.result[0].authenticationurl,
        emailServiceURL: data.result[0].emailserviceurl,
        clientId: data.result[0].clientid,
        clientSecret: data.result[0].clientsecret,
        id: data.result[0].id
      }
    })
  );
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
    yield put(
      EmailActions.updateSettingsSuccess({
        message: 'Email settings updated successfully',
        emailSettings: data.request
      })
    );
  } else {
    yield put(
      EmailActions.updateSettingsFailure({
        message: data.message,
        emailSettings: data.request
      })
    );
  }
}

function* emailSettingsSaga() {
  yield all([
    takeEvery(EmailActions.updateSettingsReq, updateEmailSettings),
    takeEvery(EmailActions.retrieveReq, fetchEmailSettings)
  ]);
}

export default emailSettingsSaga;
