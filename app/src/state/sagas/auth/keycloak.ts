import { call, cancelled, delay, fork, put, select, takeLatest } from 'redux-saga/effects';
import Keycloak from 'keycloak-js';
import { AppConfig } from 'state/config';
import { selectConfiguration } from 'state/reducers/configuration';
import { historySingleton } from 'state/store';
import { USERINFO_CLEAR_REQUEST } from 'state/actions';
import { selectAuth } from 'state/reducers/auth';
import { AuthActions } from 'state/actions/auth/Auth';

let keycloakInstance: Keycloak | null = null;

const MIN_TOKEN_FRESHNESS = 20; //want our token to be good for at least this long at all times
const TOKEN_REFRESH_INTERVAL = 5 * 1000;

function* handleSigninRequest() {
  const config: AppConfig = yield select(selectConfiguration);
  if (!keycloakInstance) {
    return;
  }

  try {
    yield call(keycloakInstance.login, {
      redirectUri: config.REDIRECT_URI
    });

    yield put(AuthActions.requestComplete({ idToken: keycloakInstance.idToken }));
  } catch (e) {
    console.error(e);
    yield put(AuthActions.requestError());
  }
}

function* handleSignoutRequest() {
  const config: AppConfig = yield select(selectConfiguration);
  if (!keycloakInstance) {
    return;
  }

  try {
    yield call(keycloakInstance.logout, {
      id_token_hint: keycloakInstance.idToken,
      post_logout_redirect_uri: config.REDIRECT_URI
    });
    yield put(AuthActions.signoutComplete());
    yield put({ type: USERINFO_CLEAR_REQUEST });
  } catch (e) {
    console.error(e);
    yield put(AuthActions.requestError());
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
            yield put(AuthActions.updateTokenState({ idToken: keycloakInstance.idToken }));
          }
          if (disrupted) {
            yield put(AuthActions.recovered());
            refreshRetryCount = 0;
          }
        }
      } catch (e) {
        console.error(e);
        if (!disrupted) {
          yield put(AuthActions.disrupted());
        }

        refreshRetryCount++;
        if (refreshRetryCount >= RETRY_LIMIT) {
          put(AuthActions.signoutRequest());
        }
      } finally {
        yield delay(TOKEN_REFRESH_INTERVAL);
      }
    }
  } finally {
    if (yield cancelled()) {
      console.info('token freshness task shutting down');
    }
  }
}

function* reinitAuth() {
  const config: AppConfig = yield select(selectConfiguration);
  if (!keycloakInstance) {
    return;
  }

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
        yield put(AuthActions.signoutRequest());
      }
      failCount++;
      yield delay(1000);
    }
  }

  yield put(
    AuthActions.initializeComplete({
      authenticated: keycloakInstance.authenticated,
      idToken: keycloakInstance.idToken
    })
  );

  if (keycloakInstance.authenticated) {
    // we are already logged in
    // schedule our refresh
    // note that this happens after the redirect too, so we only need it here (it does not need to be in the signin handler)
    yield put(AuthActions.refreshToken());
    yield put(AuthActions.refreshRolesRequest());
    if (postAuthNavigate) {
      sessionStorage.removeItem('_invasivesbc_auth_target');
      historySingleton.push(postAuthNavigate);
    }
  } else {
    yield put(AuthActions.requestError());
  }
}

function* initializeAuthentication() {
  const config: AppConfig = yield select(selectConfiguration);

  keycloakInstance = new Keycloak({
    clientId: config.KEYCLOAK_CLIENT_ID,
    realm: config.KEYCLOAK_REALM,
    url: config.KEYCLOAK_URL
  });

  yield put(AuthActions.reinit());
}

const keycloakAuthEffects = [
  takeLatest(AuthActions.initializeRequest.type, initializeAuthentication),
  takeLatest(AuthActions.signinRequest.type, handleSigninRequest),
  takeLatest(AuthActions.signoutRequest.type, handleSignoutRequest),
  takeLatest(AuthActions.reinit.type, reinitAuth),
  fork(keepTokenFresh)
];

export { keycloakAuthEffects, keycloakInstance };
