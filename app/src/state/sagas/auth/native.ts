import { put, takeLatest } from 'redux-saga/effects';
import { TABS_GET_INITIAL_STATE_REQUEST, USERINFO_CLEAR_REQUEST } from 'state/actions';
import AuthBridge from 'utils/auth/authBridge';
import { AuthActions } from 'state/actions/auth/Auth';

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

function* handleSignoutRequest(_action) {
  const { error } = yield AuthBridge.logout({});
  if (error) {
    yield put(AuthActions.requestError());
    return;
  }

  yield put(AuthActions.signoutComplete());
  yield put({ type: USERINFO_CLEAR_REQUEST });
}

function* initializeAuthentication() {
  yield put({
    type: TABS_GET_INITIAL_STATE_REQUEST,
    payload: {
      authenticated: false,
      activated: false
    }
  });

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
