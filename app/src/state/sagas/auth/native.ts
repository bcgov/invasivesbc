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
    yield put({ type: AUTH_REQUEST_ERROR });
    return;
  }

  if (authResult.authorized) {
    yield put({
      type: AUTH_REQUEST_COMPLETE,
      payload: {
        idToken: authResult.idToken
      }
    });

    yield put({
      type: AUTH_INITIALIZE_COMPLETE,
      payload: {
        authenticated: authResult.authorized,
        idToken: authResult.idToken
      }
    });
    yield put({ type: AUTH_REFRESH_ROLES_REQUEST });
  } else {
    //not logged in

    yield put({
      type: TABS_GET_INITIAL_STATE_REQUEST,
      payload: {
        authenticated: false,
        activated: false
      }
    });
  }
}

function* handleSignoutRequest(action) {
  const { error } = yield AuthBridge.logout({});
  if (error) {
    yield put({ type: AUTH_REQUEST_ERROR });
    return;
  }

  yield put({ type: AUTH_SIGNOUT_COMPLETE });
  yield put({ type: USERINFO_CLEAR_REQUEST });
}

function* initializeAuthentication() {
  yield put({
    type: AUTH_REQUEST_COMPLETE,
    payload: {
      idToken: null
    }
  });
}

const nativeAuthEffects = [
  takeLatest(AUTH_SIGNIN_REQUEST, handleSigninRequest),
  takeLatest(AUTH_SIGNOUT_REQUEST, handleSignoutRequest),
  takeLatest(AUTH_INITIALIZE_REQUEST, initializeAuthentication)
];

export { nativeAuthEffects };
