import { all, call, delay, put, select, take, takeLatest } from 'redux-saga/effects';

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
  AUTH_SIGNIN_REQUEST,
  AUTH_SIGNOUT_COMPLETE,
  AUTH_SIGNOUT_REQUEST,
  AUTH_UPDATE_TOKEN_STATE,
  TABS_GET_INITIAL_STATE_REQUEST, TOGGLE_PANEL,
  URL_CHANGE,
  USERINFO_CLEAR_REQUEST,
  USERINFO_LOAD_COMPLETE
} from '../actions';
import { AppConfig } from '../config';
import { selectConfiguration } from '../reducers/configuration';
import { selectAuthHeaders } from '../reducers/auth';
import { Http } from '@capacitor-community/http';

const MIN_TOKEN_FRESHNESS = 2 * 60; //want our token to be good for at least this long at all times
const TOKEN_REFRESH_INTERVAL = 7 * 1000;

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
    if (authTarget.at > (Date.now() - (30 * 10000))) {
      // it is recent
      postAuthNavigate = authTarget.destination;
    } else {
      sessionStorage.removeItem('_invasivesbc_auth_target');
    }
  }

  if (!postAuthNavigate) {
    // this is an initial request or we have no destination preset
    sessionStorage.setItem('_invasivesbc_auth_target', JSON.stringify({
      at: Date.now(),
      destination: historySingleton?.location?.pathname || '/'
    }));
  }

  if (config.MOBILE) {
    yield call(keycloakInstance.init, {
      checkLoginIframe: false,
      silentCheckSsoFallback: false,
      silentCheckSsoRedirectUri: "https://invasivesbc.gov.bc.ca/check_sso.html",
      redirectUri: config.REDIRECT_URI,
      enableLogging: true,
      responseMode: 'query',
      adapter: new CapacitorBrowserKeycloakAdapter(keycloakInstance),
      onLoad: 'check-sso',
      pkceMethod: 'S256'
    });

    yield delay(3000);

  } else {
    yield call(keycloakInstance.init, {
      checkLoginIframe: true,
      redirectUri: config.REDIRECT_URI,
      responseMode: 'fragment',
      onLoad: 'check-sso',
      pkceMethod: 'S256'
    });
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
      yield put({
        type: TOGGLE_PANEL, payload: {
          panelOpen: false,
          panelFullScreen: false
        }
      });
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
  let authState = yield select(state => state.Auth);


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
      //url: 'https://api-dev-invasivesbci.apps.silver.devops.gov.bc.ca' + `/api/user-access`,
      //url: 'http://localhost:7080' + `/api/user-access`,
      url: configuration.API_BASE + `/api/user-access`,
      headers: {
        Authorization: authHeaders.authorization,
        'Content-Type': 'application/json'
      }
    });

    const { data: rolesData } = yield Http.request({
      method: 'GET',
      //url: 'https://api-dev-invasivesbci.apps.silver.devops.gov.bc.ca' + `/api/roles`,
      //url: 'http://localhost:7080' + `/api/roles`,
      url: configuration.API_BASE + `/api/roles`,
      headers: {
        Authorization: authHeaders.authorization,
        'Content-Type': 'application/json'
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
  const refreshed = yield keycloakInstance.updateToken(MIN_TOKEN_FRESHNESS);
  if (refreshed) {
    yield put({ type: AUTH_UPDATE_TOKEN_STATE });
  }

  yield delay(TOKEN_REFRESH_INTERVAL);
  yield put({ type: AUTH_REFRESH_TOKEN });
}

function* handleSigninRequest(action) {
  const config: AppConfig = yield select(selectConfiguration);


  try {
    const url = keycloakInstance.createLoginUrl({
      redirectUri: config.REDIRECT_URI
    });

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
    takeLatest(AUTH_REFRESH_TOKEN, keepTokenFresh),
    takeLatest(AUTH_REFRESH_ROLES_REQUEST, refreshRoles),
    takeLatest(AUTH_REINIT, reinitAuth)
  ]);
}

export default authenticationSaga;
export { keycloakInstance };
