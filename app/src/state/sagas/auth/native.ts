import { put, takeLatest, select } from 'redux-saga/effects';
import { USERINFO_CLEAR_REQUEST } from 'state/actions';
import AuthBridge from 'utils/auth/authBridge';
import { AuthActions } from 'state/actions/auth/Auth';
import { AppConfig } from 'state/config';
import { selectConfiguration } from 'state/reducers/configuration';

function* handleSigninRequest() {
  const authResult = yield AuthBridge.authStart({});

  if (authResult.error) {
    yield put(AuthActions.requestError());
    return;
  }

  if (authResult.authorized) {
    yield put(AuthActions.requestComplete({ idToken: authResult.idToken }));

    yield put(
      AuthActions.initializeComplete({
        authenticated: authResult.authorized,
        idToken: authResult.idToken
      })
    );
    yield put(AuthActions.refreshRolesRequest());
  } else {
    yield put(AuthActions.requestError());
  }
}

function* handleSignoutRequest() {
  const authResult = yield AuthBridge.logout({});

  if (authResult?.error) {
    yield put(AuthActions.requestError());
    return;
  }

  yield put(AuthActions.signoutComplete());
  yield put({ type: USERINFO_CLEAR_REQUEST });
}

function* initializeAuthentication() {
  yield put(
    AuthActions.initializeComplete({
      idToken: undefined
    })
  );
}

const nativeAuthEffects = [
  takeLatest(AuthActions.signinRequest.type, handleSigninRequest),
  takeLatest(AuthActions.signoutRequest.type, handleSignoutRequest),
  takeLatest(AuthActions.initializeRequest.type, initializeAuthentication)
];

export { nativeAuthEffects };
