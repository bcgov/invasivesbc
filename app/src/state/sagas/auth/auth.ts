import { all, put, select, takeLatest } from 'redux-saga/effects';
import { MOBILE, PLATFORM, Platform } from 'state/build-time-config';
import { selectConfiguration } from 'state/reducers/configuration';
import { keycloakAuthEffects, keycloakInstance } from 'state/sagas/auth/keycloak';
import { nativeAuthEffects } from 'state/sagas/auth/native';
import { USERINFO_LOAD_COMPLETE } from 'state/actions';
import AuthBridge from 'utils/auth/authBridge';
import UserSettings from 'state/actions/userSettings/UserSettings';
import NetworkActions from 'state/actions/network/NetworkActions';
import { AuthActions } from 'state/actions/auth/Auth';
import { APIDocs } from 'state/actions/userSettings/APIDocs';

// not a saga, but an exported convenience function
type withCurrentJWTCallback = (header: string) => Promise<any>;

async function withCurrentJWT(callback: withCurrentJWTCallback) {
  // make a build-time determination about which version of the function to use
  if (MOBILE && [Platform.IOS, Platform.ANDROID].includes(PLATFORM)) {
    const { idToken } = await AuthBridge.token({});
    const header = `Bearer ${idToken}`;
    return await callback(header);
  } else if (keycloakInstance !== null) {
    const header = `Bearer ${keycloakInstance.idToken}`;
    return await callback(header);
  } else {
    console.error('Keycloak instance was null. this is unexpected');
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
      AuthActions.refreshRolesComplete({
        all_roles: rolesData.result,
        roles: userData.result.roles,
        extendedInfo: userData.result.extendedInfo,
        v2BetaAccess: userData.result.v2BetaAccess
      })
    );

    yield put({
      type: USERINFO_LOAD_COMPLETE,
      payload: {
        userInfo: userData.result.extendedInfo
      }
    });

    yield put(AuthActions.saveCurrentToOffline());
  } catch (e) {
    yield put(AuthActions.refreshRolesError());
  }
}

function* handle_AUTH_FORGET_OFFLINE_USER(action) {
  if (AuthActions.forgetOfflineUser.match(action)) {
    yield put(APIDocs.forgetSaved({ displayName: action.payload.displayName })); // also forget api-docs for this user
  }
}

function* handle_AUTH_MAKE_OFFLINE_USER_CURRENT(action) {
  if (AuthActions.makeOfflineUserCurrent.match(action)) {
    yield all([
      put(NetworkActions.setAdministrativeStatus(false)),
      put(UserSettings.InitState.get({ offlineAPIDocsDisplayName: action.payload.displayName }))
    ]);
  }
}

function* authenticationSaga() {
  const baseSaga = [
    takeLatest(AuthActions.refreshRolesRequest.type, refreshRoles),
    takeLatest(AuthActions.makeOfflineUserCurrent.type, handle_AUTH_MAKE_OFFLINE_USER_CURRENT),
    takeLatest(AuthActions.forgetOfflineUser.type, handle_AUTH_FORGET_OFFLINE_USER)
  ];
  if (MOBILE && [Platform.IOS, Platform.ANDROID].includes(PLATFORM)) {
    // use native authentication bridge for better user experience
    yield all([...baseSaga, ...nativeAuthEffects]);
  } else {
    // building for web, use keycloak
    yield all([...baseSaga, ...keycloakAuthEffects]);
  }
}

export { withCurrentJWT, getCurrentJWT };
export default authenticationSaga;
