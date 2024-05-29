import { call, cancelled, delay, fork, put, select, takeLatest } from 'redux-saga/effects';
import Keycloak from 'keycloak-js';
import { AppConfig } from 'state/config';
import { selectConfiguration } from 'state/reducers/configuration';
import { historySingleton } from 'state/store';
import {
  AUTH_INITIALIZE_COMPLETE,
  AUTH_INITIALIZE_REQUEST,
  AUTH_REFRESH_ROLES_REQUEST,
  AUTH_REFRESH_TOKEN,
  AUTH_REINIT,
  AUTH_REQUEST_COMPLETE,
  AUTH_REQUEST_ERROR,
  AUTH_SET_DISRUPTED,
  AUTH_SET_RECOVERED_FROM_DISRUPTION,
  AUTH_SIGNIN_REQUEST,
  AUTH_SIGNOUT_COMPLETE,
  AUTH_SIGNOUT_REQUEST,
  AUTH_UPDATE_TOKEN_STATE,
  TABS_GET_INITIAL_STATE_REQUEST,
  USERINFO_CLEAR_REQUEST
} from 'state/actions';
import { selectAuth } from 'state/reducers/auth';

let keycloakInstance = null;

const MIN_TOKEN_FRESHNESS = 20; //want our token to be good for at least this long at all times
const TOKEN_REFRESH_INTERVAL = 5 * 1000;

function* handleSigninRequest(action) {
  const config: AppConfig = yield select(selectConfiguration);

  try {
    yield call(keycloakInstance.login, {
      redirectUri: config.REDIRECT_URI
    });

    yield put({
      type: AUTH_REQUEST_COMPLETE,
      payload: {
        idToken: keycloakInstance.idToken
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: AUTH_REQUEST_ERROR });
  }
}

function* handleSignoutRequest(action) {
  try {
    yield keycloakInstance.logout();
    yield put({ type: AUTH_SIGNOUT_COMPLETE });
    yield put({ type: USERINFO_CLEAR_REQUEST });
  } catch (e) {
    console.error(e);
    yield put({ type: AUTH_REQUEST_ERROR });
  }
}

function* keepTokenFresh() {
  const RETRY_LIMIT = 10;

  try {
    let refreshRetryCount = 0;

    while (!(yield cancelled())) {
      if (!keycloakInstance) {
        // KC is not yet initialized
        yield delay(TOKEN_REFRESH_INTERVAL);
        continue;
      }
      const { authenticated, disrupted } = yield select(selectAuth);

      if (!authenticated) {
        // not logged in yet, nothing to do
        yield delay(TOKEN_REFRESH_INTERVAL);
        continue;
      }

      try {
        if (keycloakInstance.isTokenExpired(MIN_TOKEN_FRESHNESS)) {
          const refreshed = yield keycloakInstance.updateToken(MIN_TOKEN_FRESHNESS);
          if (refreshed) {
            yield put({ type: AUTH_UPDATE_TOKEN_STATE, payload: { idToken: keycloakInstance.idToken } });
          }
          if (disrupted) {
            yield put({ type: AUTH_SET_RECOVERED_FROM_DISRUPTION });
            refreshRetryCount = 0;
          }
        }
      } catch (e) {
        console.log('auth refresh failure');
        console.dir(e);
        if (!disrupted) {
          yield put({ type: AUTH_SET_DISRUPTED });
        }

        refreshRetryCount++;
        if (refreshRetryCount >= RETRY_LIMIT) {
          put({ type: AUTH_SIGNOUT_REQUEST });
        }
      } finally {
        yield delay(TOKEN_REFRESH_INTERVAL);
      }
    }
  } finally {
    if (yield cancelled()) {
      console.log('token freshness task shutting down');
    }
  }
}

function* reinitAuth() {
  const config: AppConfig = yield select(selectConfiguration);

  const authTargetJSON = sessionStorage.getItem('_invasivesbc_auth_target');
  let postAuthNavigate = null;
  if (authTargetJSON) {
    const authTarget = JSON.parse(authTargetJSON);
    if (authTarget.at > Date.now() - 30 * 10000) {
      // it is recent
      postAuthNavigate = authTarget.destination;
    } else {
      sessionStorage.removeItem('_invasivesbc_auth_target');
    }
  }

  if (!postAuthNavigate) {
    // either this is an initial request or we have no destination preset
    sessionStorage.setItem(
      '_invasivesbc_auth_target',
      JSON.stringify({
        at: Date.now(),
        destination: historySingleton?.location?.pathname || '/'
      })
    );
  }

  const FAIL_LIMIT = 3;
  let failCount = 0;
  while (failCount < FAIL_LIMIT) {
    try {
      yield call(keycloakInstance.init, {
        checkLoginIframe: false,
        redirectUri: config.REDIRECT_URI,
        responseMode: 'fragment',
        onLoad: 'check-sso',
        pkceMethod: 'S256'
      });
      break;
    } catch (e) {
      console.dir(e);
      if (failCount >= FAIL_LIMIT) {
        yield put({ type: AUTH_SIGNOUT_REQUEST });
      }
      failCount++;
      yield delay(1000);
    }
  }

  yield put({
    type: AUTH_INITIALIZE_COMPLETE,
    payload: {
      authenticated: keycloakInstance.authenticated,
      idToken: keycloakInstance.idToken
    }
  });

  if (keycloakInstance.authenticated) {
    // we are already logged in
    // schedule our refresh
    // note that this happens after the redirect too, so we only need it here (it does not need to be in the signin handler)
    yield put({ type: AUTH_REFRESH_TOKEN });
    yield put({ type: AUTH_REFRESH_ROLES_REQUEST });
    if (postAuthNavigate) {
      sessionStorage.removeItem('_invasivesbc_auth_target');
      historySingleton.push(postAuthNavigate);
    }
  } else {
    // we are not logged in
    yield put({
      type: TABS_GET_INITIAL_STATE_REQUEST,
      payload: {
        authenticated: false,
        activated: false
      }
    });
  }
}

function* initializeAuthentication() {
  const config: AppConfig = yield select(selectConfiguration);

  keycloakInstance = new Keycloak({
    clientId: config.KEYCLOAK_CLIENT_ID,
    realm: config.KEYCLOAK_REALM,
    url: config.KEYCLOAK_URL
  });

  yield put({
    type: AUTH_REINIT
  });
}

const keycloakAuthEffects = [
  takeLatest(AUTH_INITIALIZE_REQUEST, initializeAuthentication),
  takeLatest(AUTH_SIGNIN_REQUEST, handleSigninRequest),
  takeLatest(AUTH_SIGNOUT_REQUEST, handleSignoutRequest),
  takeLatest(AUTH_REINIT, reinitAuth),
  fork(keepTokenFresh)
];

export { keycloakAuthEffects, keycloakInstance };
