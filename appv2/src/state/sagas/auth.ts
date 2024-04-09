import { all, call, cancelled, delay, fork, put, select, takeLatest } from 'redux-saga/effects';

import { historySingleton } from '../store';

import Keycloak, {
  KeycloakAdapter,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
  KeycloakRegisterOptions
} from 'keycloak-js';

import { Browser } from '@capacitor/browser';

import {
  AUTH_INITIALIZE_COMPLETE,
  AUTH_INITIALIZE_REQUEST,
  AUTH_REFRESH_ROLES_COMPLETE,
  AUTH_REFRESH_ROLES_ERROR,
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
  USERINFO_CLEAR_REQUEST,
  USERINFO_LOAD_COMPLETE
} from '../actions';
import { AppConfig } from '../config';
import { selectConfiguration } from '../reducers/configuration';
import { selectAuth, selectAuthHeaders } from '../reducers/auth';
import { Http } from '@capacitor-community/http';
import { END } from 'redux-saga';

const MIN_TOKEN_FRESHNESS = 20; //want our token to be good for at least this long at all times
const TOKEN_REFRESH_INTERVAL = 5 * 1000;

let keycloakInstance = null;

class CapacitorBrowserKeycloakAdapter implements KeycloakAdapter {
  private kc: Keycloak;

  constructor(instance: Keycloak) {
    this.kc = instance;
  }

  async accountManagement(): Promise<void> {
    const url = this.kc.createAccountUrl();
    return Browser.open({ url });
  }

  async login(options?: KeycloakLoginOptions): Promise<void> {
    const url = this.kc.createLoginUrl(options);

    const p: Promise<void> = new Promise(async (resolve, reject) => {
      await Browser.open({ url, presentationStyle: 'popover' });
      await Browser.addListener('browserFinished', () => {
        Browser.removeAllListeners();
        resolve();
      });
    });

    return p;
  }

  async logout(options?: KeycloakLogoutOptions): Promise<void> {
    const url = this.kc.createLogoutUrl(options);
    return Browser.open({ url });
  }

  redirectUri(options: { redirectUri: string }, encodeHash: boolean): string {
    if (options && options.redirectUri) {
      return options.redirectUri;
    } else if (this.kc.redirectUri) {
      return this.kc.redirectUri;
    } else {
      return window.location.href;
    }
  }

  async register(options?: KeycloakRegisterOptions): Promise<void> {
    const url = this.kc.createRegisterUrl(options);
    return Browser.open({ url });
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

  if (config.MOBILE) {
    yield call(keycloakInstance.init, {
      checkLoginIframe: false,
      silentCheckSsoFallback: false,
      silentCheckSsoRedirectUri: 'https://invasivesbc.gov.bc.ca/check_sso.html',
      redirectUri: config.REDIRECT_URI,
      enableLogging: true,
      responseMode: 'query',
      adapter: new CapacitorBrowserKeycloakAdapter(keycloakInstance),
      onLoad: 'check-sso',
      pkceMethod: 'S256'
    });

    yield delay(3000);
  } else {
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
  }

  yield put({
    type: AUTH_INITIALIZE_COMPLETE,
    payload: {
      authenticated: keycloakInstance.authenticated
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

function* refreshRoles() {
  const configuration = yield select(selectConfiguration);
  let authHeaders = yield select(selectAuthHeaders);

  for (let i = 0; i < 3; i++) {
    if (authHeaders.authorization !== null && authHeaders.authorization.length > 0) {
      // we've got a valid header
      break;
    }
    // wait for it...
    yield delay(500);
    authHeaders = yield select(selectAuthHeaders);
  }

  try {
    const { data: userData } = yield Http.request({
      method: 'GET',
      url: configuration.API_BASE + `/api/user-access`,
      headers: {
        authorization: authHeaders.authorization,
        accept: 'application/json'
      }
    });

    const { data: rolesData } = yield Http.request({
      method: 'GET',
      url: configuration.API_BASE + `/api/roles`,
      headers: {
        authorization: authHeaders.authorization,
        accept: 'application/json'
      }
    });

    yield put({
      type: AUTH_REFRESH_ROLES_COMPLETE,
      payload: {
        all_roles: rolesData.result,
        roles: userData.result.roles,
        extendedInfo: userData.result.extendedInfo,
        v2BetaAccess: userData.result.v2BetaAccess
      }
    });

    yield put({
      type: USERINFO_LOAD_COMPLETE,
      payload: {
        userInfo: userData.result.extendedInfo
      }
    });
    yield put({
      type: TABS_GET_INITIAL_STATE_REQUEST,
      payload: {
        authenticated: true,
        activated: userData.result.extendedInfo.activation_status === 1
      }
    });
  } catch (err) {
    console.dir(err);
    yield put({ type: AUTH_REFRESH_ROLES_ERROR });
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
            yield put({ type: AUTH_UPDATE_TOKEN_STATE });
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

function* handleSigninRequest(action) {
  const config: AppConfig = yield select(selectConfiguration);

  try {
    yield call(keycloakInstance.login, {
      redirectUri: config.REDIRECT_URI
    });

    yield put({ type: AUTH_REQUEST_COMPLETE, payload: {} });
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

function* authenticationSaga() {
  yield all([
    takeLatest(AUTH_INITIALIZE_REQUEST, initializeAuthentication),
    takeLatest(AUTH_SIGNIN_REQUEST, handleSigninRequest),
    takeLatest(AUTH_SIGNOUT_REQUEST, handleSignoutRequest),
    takeLatest(AUTH_REFRESH_ROLES_REQUEST, refreshRoles),
    takeLatest(AUTH_REINIT, reinitAuth),
    fork(keepTokenFresh)
  ]);
}

export default authenticationSaga;
export { keycloakInstance };
