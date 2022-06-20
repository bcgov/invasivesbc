import { all, delay, put, select, takeLatest } from 'redux-saga/effects';
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
  AUTH_UPDATE_TOKEN_STATE
} from '../actions';
import { AppConfig } from '../config';
import { selectConfiguration } from '../reducers/configuration';
import { selectAuthHeaders } from '../reducers/auth';
import { Http } from '@capacitor-community/http';

const MIN_TOKEN_FRESHNESS = 2 * 60; //want our token to be good for atleast this long at all times
const GRACE_PERIOD = 10; // get a new one with this much time to spare

let keycloakInstance = null;

function* initializeAuthentication() {
  const config: AppConfig = yield select(selectConfiguration);

  keycloakInstance = Keycloak({
    clientId: config.KEYCLOAK_CLIENT_ID,
    realm: config.KEYCLOAK_REALM,
    url: config.KEYCLOAK_URL
  });

  const authStatus = yield keycloakInstance.init({
    checkLoginIframe: false,
    adapter: config.KEYCLOAK_ADAPTER,
    redirectUri: config.REDIRECT_URI,
    onLoad: 'check-sso',
    pkceMethod: 'S256'
  });

  yield put({
    type: AUTH_INITIALIZE_COMPLETE,
    payload: {
      authenticated: authStatus
    }
  });

  if (authStatus) {
    // we are already logged in
    // schedule our refresh
    // note that this happens after the redirect too, so we only need it here (it does not need to be in the signin handler)

    yield put({ type: AUTH_REFRESH_TOKEN });

    // load roles
    yield put({ type: AUTH_REFRESH_ROLES_REQUEST });
  }
}

function* refreshRoles() {
  const configuration = yield select(selectConfiguration);
  const authHeaders = yield select(selectAuthHeaders);

  try {
    const { data: userData } = yield Http.request({
      method: 'GET',
      url: configuration.API_BASE + `/api/user-access`,
      headers: {
        Authorization: authHeaders.authorization,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

    const { data: rolesData } = yield Http.request({
      method: 'GET',
      url: configuration.API_BASE + `/api/roles`,
      headers: {
        Authorization: authHeaders.authorization,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

    yield put({ type: AUTH_REFRESH_ROLES_COMPLETE, payload: { all_roles: rolesData.rows, roles: userData.roles } });
  } catch (err) {
    console.dir(err);
    yield put({ type: AUTH_REFRESH_ROLES_ERROR });
  }
}

function* keepTokenFresh() {
  yield keycloakInstance.updateToken(MIN_TOKEN_FRESHNESS);
  yield put({ type: AUTH_UPDATE_TOKEN_STATE });

  const expiresIn =
    keycloakInstance.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + keycloakInstance.timeSkew;

  // wait until the time is right
  yield delay((expiresIn - GRACE_PERIOD) * 1000);
  yield put({ type: AUTH_REFRESH_TOKEN });
}

function* handleSigninRequest(action) {
  try {
    yield keycloakInstance.login();

    yield put({ type: AUTH_REQUEST_COMPLETE, payload: {} });
    yield put({ type: AUTH_REFRESH_TOKEN });
  } catch (e) {
    console.error(e);
    yield put({ type: AUTH_REQUEST_ERROR });
  }
}

function* authenticationSaga() {
  yield all([
    takeLatest(AUTH_INITIALIZE_REQUEST, initializeAuthentication),
    takeLatest(AUTH_SIGNIN_REQUEST, handleSigninRequest),
    takeLatest(AUTH_REFRESH_TOKEN, keepTokenFresh),
    takeLatest(AUTH_REFRESH_ROLES_REQUEST, refreshRoles)
  ]);
}

export default authenticationSaga;
export { keycloakInstance };
