import { all, put, select, takeLatest } from 'redux-saga/effects';
import { nanoid } from '@reduxjs/toolkit';
import { USERINFO_CLEAR_REQUEST } from 'state/actions';
import AuthBridge from 'utils/auth/authBridge';
import { AuthActions } from 'state/actions/auth/Auth';
import NetworkActions from 'state/actions/network/NetworkActions';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import Alerts from 'state/actions/alerts/Alerts';
import EventActions from 'state/actions/events/EventActions';

function* handleSigninRequest(action) {
  if (!AuthActions.signinRequest.match(action)) {
    return;
  }

  const authResult = yield AuthBridge.authStart({ ...action.payload });

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
  try {
    const authResult = yield AuthBridge.logout({});
    if (authResult?.error) {
      yield put(AuthActions.requestError());
      return;
    }
  } catch (error) {
    // it's possible for this to fail in some cases, which may mean that tokens weren't revoked, but we should still be logged out
    console.error(error);
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

function* checkTokenValidity() {
  const { authenticated } = yield select((state) => state.Auth);

  if (!authenticated) {
    // if we don't think we're logged in, we have no opinion here
    return;
  }

  // verify that we can recover our auth session, sign out if we can't.
  const { error } = yield AuthBridge.token({});
  if (error) {
    // token has become invalid. log us out and tell the user why
    yield all([
      put(AuthActions.signoutRequest()),
      put(
        Alerts.create({
          severity: AlertSeverity.Warning,
          subject: AlertSubjects.Network,
          title: 'Session Expired',
          id: nanoid(),
          content:
            'Your authentication session has expired. This can occur if you have been offline for an extended period and reconnected. You have been signed out.'
        })
      )
    ]);
  }
}

const nativeAuthEffects = [
  takeLatest(AuthActions.signinRequest.type, handleSigninRequest),
  takeLatest(AuthActions.signoutRequest.type, handleSignoutRequest),
  takeLatest(AuthActions.initializeRequest.type, initializeAuthentication),
  takeLatest(
    [NetworkActions.online.type, AuthActions.tokenValidationRequest.type, EventActions.wakeup.type],
    checkTokenValidity
  )
];

export { nativeAuthEffects };
