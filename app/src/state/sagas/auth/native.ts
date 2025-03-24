import { all, put, takeLatest } from 'redux-saga/effects';
import { nanoid } from '@reduxjs/toolkit';
import { USERINFO_CLEAR_REQUEST } from 'state/actions';
import AuthBridge from 'utils/auth/authBridge';
import { AuthActions } from 'state/actions/auth/Auth';
import NetworkActions from 'state/actions/network/NetworkActions';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import Alerts from 'state/actions/alerts/Alerts';

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

function* checkTokenValidity() {
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
  takeLatest([NetworkActions.online.type, AuthActions.tokenValidationRequest.type], checkTokenValidity)
];

export { nativeAuthEffects };
