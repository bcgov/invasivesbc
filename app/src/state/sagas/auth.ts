import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects';
import Keycloak from 'keycloak-js';
import {
  AUTH_INITIALIZE_COMPLETE,
  AUTH_INITIALIZE_REQUEST,
  AUTH_REFRESH_ROLES_COMPLETE,
  AUTH_REFRESH_ROLES_ERROR,
  AUTH_REFRESH_ROLES_REQUEST,
  AUTH_REFRESH_TOKEN,
  AUTH_REQUEST_COMPLETE,
  AUTH_REQUEST_ERROR,
  AUTH_SIGNIN_REQUEST,
  AUTH_SIGNOUT_COMPLETE,
  AUTH_SIGNOUT_REQUEST,
  AUTH_UPDATE_TOKEN_STATE,
  TABS_GET_INITIAL_STATE_REQUEST,
  USERINFO_CLEAR_REQUEST,
  USERINFO_LOAD_COMPLETE,
  USER_SETTINGS_SET_ERROR_HANDLER_DIALOG
} from '../actions';
import { AppConfig } from '../config';
import { selectConfiguration } from '../reducers/configuration';
import { selectAuthHeaders } from '../reducers/auth';
import { Http } from '@capacitor-community/http';
import { autoRestart } from 'state/utilities/errorHandlers';

const MIN_TOKEN_FRESHNESS = 2 * 60; //want our token to be good for atleast this long at all times
const GRACE_PERIOD = 10; // get a new one with this much time to spare

let keycloakInstance = null;

const initializeAuthentication = autoRestart(
  function* initializeAuthentication() {
    const config: AppConfig = yield select(selectConfiguration);

    keycloakInstance = Keycloak({
      clientId: config.KEYCLOAK_CLIENT_ID,
      realm: config.KEYCLOAK_REALM,
      url: config.KEYCLOAK_URL
    });

    yield call(keycloakInstance.init, {
      checkLoginIframe: false,
      adapter: config.KEYCLOAK_ADAPTER,
      redirectUri: config.REDIRECT_URI,
      onLoad: 'check-sso',
      pkceMethod: 'S256'
    });

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
  },
  function* handleError(e) {
    const errorMessage = 'Initialize authentication request failed: ' + e.toString();
    yield put({
      type: USER_SETTINGS_SET_ERROR_HANDLER_DIALOG,
      payload: {
        dialogOpen: true,
        dialogContentText: errorMessage
      }
    });
    yield put({
      type: AUTH_REFRESH_ROLES_ERROR
    });
  }
);

const refreshRoles = autoRestart(
  function* refreshRoles() {
    const configuration = yield select(selectConfiguration);
    const authHeaders = yield select(selectAuthHeaders);
  
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
          extendedInfo: userData.result.extendedInfo
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
  },
  function* handleError(e) {
    const errorMessage = 'Refresh roles request failed: ' + e.toString();
    yield put({
      type: USER_SETTINGS_SET_ERROR_HANDLER_DIALOG,
      payload: {
        dialogOpen: true,
        dialogContentText: errorMessage
      }
    });
    yield put({
      type: AUTH_REFRESH_ROLES_ERROR
    });
  }
);

const keepTokenFresh = autoRestart(
  function* keepTokenFresh() {
    yield keycloakInstance.updateToken(MIN_TOKEN_FRESHNESS);
    yield put({ type: AUTH_UPDATE_TOKEN_STATE });

    // load roles
    yield put({ type: AUTH_REFRESH_ROLES_REQUEST });

    const expiresIn =
      keycloakInstance.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + keycloakInstance.timeSkew;

    // wait until the time is right
    yield delay((expiresIn - GRACE_PERIOD) * 1000);
    yield put({ type: AUTH_REFRESH_TOKEN });
  },
  function* handleError(e) {
    const errorMessage = 'Keeping token fresh request failed: ' + e.toString();
    yield put({
      type: USER_SETTINGS_SET_ERROR_HANDLER_DIALOG,
      payload: {
        dialogOpen: true,
        dialogContentText: errorMessage
      }
    });
    yield put({
      type: AUTH_REFRESH_ROLES_ERROR
    });
  }
);

function* handleSigninRequest(action) {
  try {
    yield call(keycloakInstance.login);

    yield put({ type: AUTH_REQUEST_COMPLETE, payload: {} });
    yield put({ type: AUTH_REFRESH_TOKEN });
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
    takeLatest(AUTH_REFRESH_ROLES_REQUEST, refreshRoles)
  ]);
}

export default authenticationSaga;
export { keycloakInstance };
