import { PayloadAction } from '@reduxjs/toolkit';
import { all, cancelled, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import networkAlertMessages from 'constants/alerts/networkAlerts';
import { HEALTH_ENDPOINT } from 'constants/misc';
import Alerts from 'state/actions/alerts/Alerts';
import NetworkActions from 'state/actions/network/NetworkActions';
import { MOBILE } from 'state/build-time-config';
import { selectConfiguration } from 'state/reducers/configuration';
import { selectNetworkConnected } from 'state/reducers/network';
import { OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';

function* handle_ATTEMPT_TO_RECONNECT_FAILED() {
  yield put(Alerts.create(networkAlertMessages.attemptToReconnectFailed));
}

function* handle_AUTOMATIC_RECONNECT_FAILED() {
  yield put(Alerts.create(networkAlertMessages.automaticReconnectFailed));
}

/**
 * @desc Rolling function that targets the API to determine our online status.
 *       On failure to reach the API, attempts up to 5 times before determining we cannot proceed
 *       In event of this, disconnect the user and alert them of the incident.
 */
function* handle_CHECK_MOBILE_NETWORK_STATUS(cancel: PayloadAction<boolean>) {
  if (!MOBILE || cancel.payload) {
    return;
  }
  const MAX_ATTEMPTS = 5;
  const SECONDS_BETWEEN_CHECKS = 20;
  const SECONDS_BETWEEN_ATTEMPTS = 5;

  while (true) {
    const currentOnlineStatus = yield select(selectNetworkConnected);
    const configuration = yield select(selectConfiguration);
    let attempts: number = 0;
    let networkCheckPassed: boolean = false;

    do {
      networkCheckPassed = yield canConnectToNetwork(configuration.API_BASE + HEALTH_ENDPOINT);
      if (!networkCheckPassed) {
        attempts++;
        yield delay(SECONDS_BETWEEN_ATTEMPTS * 1000);
      }

      if (yield cancelled()) {
        return;
      }
    } while (!networkCheckPassed && attempts < MAX_ATTEMPTS);

    if (!networkCheckPassed && !currentOnlineStatus) {
      yield put(NetworkActions.attemptToReconnectFailed());
    } else if (!networkCheckPassed) {
      yield put(NetworkActions.userLostConnection());
      return;
    } else if (networkCheckPassed && !currentOnlineStatus) {
      // Only fire online event if we are not already online
      yield put(NetworkActions.online());
    }
    yield delay(SECONDS_BETWEEN_CHECKS * 1000);
  }
}

/**
 * @desc Targets the API and checks for successful response.
 * @param url Path to API Health check
 * @returns Connection to API Succeeded
 */
const canConnectToNetwork = async (url: string): Promise<boolean> => {
  return await fetch(url)
    .then((res) => res.status === 200)
    .catch(() => false);
};

/**
 * Initial Network Connectivity Check, determines to begin application online or offline
 */
function* handle_CHECK_INIT_CONNECTION() {
  if (!MOBILE) {
    return;
  }
  const configuration = yield select(selectConfiguration);
  if (yield canConnectToNetwork(configuration.API_BASE + HEALTH_ENDPOINT)) {
    yield put(NetworkActions.online());
  } else {
    yield put(NetworkActions.offline());
  }
}
/**
 * @desc Handler for User manually going offline. Fires a cancellation event to stop rolling api checks.
 */
function* handle_NETWORK_GO_OFFLINE() {
  yield put(Alerts.create(networkAlertMessages.userWentOffline));
  yield put(NetworkActions.checkMobileNetworkStatus(true));
}

/**
 * @desc When user comes online, check for any existing unsychronized Activities.
 *       Restart the rolling Network status checks.
 */
function* handle_NETWORK_GO_ONLINE() {
  const { serializedActivities } = yield select(selectOfflineActivity);
  const userHasUnsynchronizedActivities = Object.keys(serializedActivities).some(
    (entry) => serializedActivities[entry].sync_state !== OfflineActivitySyncState.SYNCHRONIZED
  );
  if (userHasUnsynchronizedActivities) {
    yield put(Alerts.create(networkAlertMessages.userWentOnlineWithUnsyncedActivities));
  } else {
    yield put(Alerts.create(networkAlertMessages.userWentOnline));
  }
  yield put(NetworkActions.checkMobileNetworkStatus());
}

/**
 * @desc Attempt to establish connection with the API. Abandons after ~3 minutes of disconnection.
 *       When this event fires, it cancels the rolling API checks
 */
function* handle_USER_LOST_CONNECTION() {
  const MAX_RECONNECT_ATTEMPTS = 18;
  const SECONDS_BETWEEN_ATTEMPTS = 10;

  const configuration = yield select(selectConfiguration);
  let attempts: number = 0;
  let networkCheckPassed: boolean = false;

  yield put(Alerts.create(networkAlertMessages.userLostConnection));

  do {
    networkCheckPassed = yield canConnectToNetwork(configuration.API_BASE + HEALTH_ENDPOINT);
    if (!networkCheckPassed) {
      attempts++;
      yield delay(SECONDS_BETWEEN_ATTEMPTS * 1000);
    }
  } while (!networkCheckPassed && attempts < MAX_RECONNECT_ATTEMPTS);

  if (networkCheckPassed) {
    yield put(NetworkActions.online());
  } else {
    yield put(NetworkActions.automaticReconnectFailed());
  }
}

function* networkSaga() {
  yield all([
    takeEvery(NetworkActions.attemptToReconnectFailed, handle_ATTEMPT_TO_RECONNECT_FAILED),
    takeEvery(NetworkActions.automaticReconnectFailed, handle_AUTOMATIC_RECONNECT_FAILED),
    takeEvery(NetworkActions.checkInitConnection, handle_CHECK_INIT_CONNECTION),
    takeLatest(NetworkActions.checkMobileNetworkStatus, handle_CHECK_MOBILE_NETWORK_STATUS),
    takeEvery(NetworkActions.offline, handle_NETWORK_GO_OFFLINE),
    takeEvery(NetworkActions.online, handle_NETWORK_GO_ONLINE),
    takeLatest(NetworkActions.userLostConnection, handle_USER_LOST_CONNECTION)
  ]);
}

export default networkSaga;
