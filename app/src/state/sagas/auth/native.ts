import { put, takeLatest } from 'redux-saga/effects';
import {
  AUTH_INITIALIZE_COMPLETE,
  AUTH_INITIALIZE_REQUEST,
  AUTH_REFRESH_ROLES_REQUEST,
  AUTH_REQUEST_COMPLETE,
  AUTH_REQUEST_ERROR,
  AUTH_SIGNIN_REQUEST,
  AUTH_SIGNOUT_COMPLETE,
  AUTH_SIGNOUT_REQUEST,
  TABS_GET_INITIAL_STATE_REQUEST,
  USERINFO_CLEAR_REQUEST
} from 'state/actions';
import AuthBridge from 'utils/auth/authBridge';

function* handleSigninRequest() {
  const authResult = yield AuthBridge.authStart({});

  if (authResult.error) {
    yield put(AUTH_REQUEST_ERROR());
    return;
  }

  if (authResult.authorized) {
    yield put(
      AUTH_REQUEST_COMPLETE({
        idToken: authResult.idToken
      })
    );

    yield put(
      AUTH_INITIALIZE_COMPLETE({
        authenticated: authResult.authorized,
        idToken: authResult.idToken
      })
    );
    yield put(AUTH_REFRESH_ROLES_REQUEST());
  } else {
    //not logged in

    yield put(
      TABS_GET_INITIAL_STATE_REQUEST({
        authenticated: false,
        activated: false
      })
    );
  }
}

function* handleSignoutRequest() {
  const { error } = yield AuthBridge.logout({});
  if (error) {
    yield put(AUTH_REQUEST_ERROR());
    return;
  }

  yield put(AUTH_SIGNOUT_COMPLETE());
  yield put(USERINFO_CLEAR_REQUEST());
}

function* initializeAuthentication() {
  yield put(
    TABS_GET_INITIAL_STATE_REQUEST({
      authenticated: false,
      activated: false
    })
  );

  yield put(
    AUTH_INITIALIZE_COMPLETE({
      idToken: null
    })
  );
}

const nativeAuthEffects = [
  takeLatest(AUTH_SIGNIN_REQUEST, handleSigninRequest),
  takeLatest(AUTH_SIGNOUT_REQUEST, handleSignoutRequest),
  takeLatest(AUTH_INITIALIZE_REQUEST, initializeAuthentication)
];

export { nativeAuthEffects };
