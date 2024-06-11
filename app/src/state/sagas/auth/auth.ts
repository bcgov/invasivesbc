import { all, put, select, takeLatest } from 'redux-saga/effects';
import { selectConfiguration } from 'state/reducers/configuration';
import { keycloakAuthEffects, keycloakInstance } from 'state/sagas/auth/keycloak';
import { nativeAuthEffects } from 'state/sagas/auth/native';
import {
  AUTH_REFRESH_ROLES_COMPLETE,
  AUTH_REFRESH_ROLES_ERROR,
  AUTH_REFRESH_ROLES_REQUEST,
  AUTH_SAVE_CURRENT_TO_OFFLINE,
  TABS_GET_INITIAL_STATE_REQUEST,
  USERINFO_LOAD_COMPLETE
} from 'state/actions';
import AuthBridge from 'utils/auth/authBridge'; // not a saga, but an exported convenience function

// not a saga, but an exported convenience function
type withCurrentJWTCallback = (header: string) => Promise<any>;

async function withCurrentJWT(callback: withCurrentJWTCallback) {
  // make a build-time determination about which version of the function to use
  if (import.meta.env.VITE_MOBILE && import.meta.env.VITE_MOBILE.toLowerCase() === 'true') {
    const { idToken } = await AuthBridge.token({});
    const header = `Bearer ${idToken}`;
    return await callback(header);
  } else {
    if (keycloakInstance !== null) {
      const header = `Bearer ${keycloakInstance.idToken}`;
      return await callback(header);
    } else {
      console.error('Keycloak instance was null. this is unexpected');
    }
  }
}

// convenience function to just return the token rather than executing a callback
async function getCurrentJWT(): Promise<string> {
  return await withCurrentJWT(async (header) => header);
}

// this saga is platform (mobile/web) agnostic
function* refreshRoles() {
  const configuration = yield select(selectConfiguration);

  try {
    const { userData, rolesData } = yield withCurrentJWT(async (header) => {
      const userAccessResponse = await fetch(configuration.API_BASE + `/api/user-access`, {
        headers: {
          authorization: header,
          accept: 'application/json'
        }
      });
      const rolesResponse = await fetch(configuration.API_BASE + `/api/roles`, {
        headers: {
          authorization: header,
          accept: 'application/json'
        }
      });
      if (userAccessResponse == null || rolesResponse == null) {
        console.error('null response received');
        return null;
      }
      return { userData: await userAccessResponse.json(), rolesData: await rolesResponse.json() };
    });

    yield put(
      AUTH_REFRESH_ROLES_COMPLETE({
        all_roles: rolesData.result,
        roles: userData.result.roles,
        extendedInfo: userData.result.extendedInfo,
        v2BetaAccess: userData.result.v2BetaAccess
      })
    );

    yield put(
      USERINFO_LOAD_COMPLETE({
        userInfo: userData.result.extendedInfo
      })
    );

    yield put(AUTH_SAVE_CURRENT_TO_OFFLINE());

    yield put(
      TABS_GET_INITIAL_STATE_REQUEST({
        authenticated: true,
        activated: userData.result.extendedInfo.activation_status === 1
      })
    );
  } catch (e) {
    yield put(AUTH_REFRESH_ROLES_ERROR());
  }
}

function* authenticationSaga() {
  if (import.meta.env.VITE_MOBILE && import.meta.env.VITE_MOBILE.toLowerCase() === 'true') {
    // use native authentication bridge for better user experience
    yield all([takeLatest(AUTH_REFRESH_ROLES_REQUEST, refreshRoles), ...nativeAuthEffects]);
  } else {
    // building for web, use keycloak
    yield all([takeLatest(AUTH_REFRESH_ROLES_REQUEST, refreshRoles), ...keycloakAuthEffects]);
  }
}

export { withCurrentJWT, getCurrentJWT };
export default authenticationSaga;
