import { PayloadAction } from '@reduxjs/toolkit';
import { all, cancelled, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import networkAlertMessages from 'constants/alerts/networkAlerts';
import { HEALTH_ENDPOINT } from 'constants/misc';
import Alerts from 'state/actions/alerts/Alerts';
import NetworkActions from 'state/actions/network/NetworkActions';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import { selectConfiguration } from 'state/reducers/configuration';
import { OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { selectNetworkState } from 'state/reducers/network';
import { selectAuth } from 'state/reducers/auth';

/* Utilities */

/**
 * @desc Targets the API and checks for successful response.
 * @param url Path to API Health check
 * @returns Connection to API Succeeded
 */
const canConnectToNetwork = async (url: string): Promise<boolean> => {
  return await fetch(url)
    .then((res) => res.ok)
    .catch(() => false);
};

/**
 * @desc Get the time between ticks for polling the heartbeat
 * @param heartbeatFailures Current number of sequential failed network attempts
 * @returns { number } delay between heartbeat checks
 */
const getTimeBetweenTicks = (heartbeatFailures: number): number => {
  const BASE_SECONDS_BETWEEN_FAILURE = 20 * 1000;
  const BASE_SECONDS_BETWEEN_SUCCESS = 60 * 1000;
  if (heartbeatFailures === 0) {
    // We are online and working as intended
    return BASE_SECONDS_BETWEEN_SUCCESS;
  }
  // Poll more frequently if there are failed heartbeats, gradually increasing the time between ticks.
  return BASE_SECONDS_BETWEEN_FAILURE * Math.floor(Math.pow(1.1, heartbeatFailures));
};

/* Sagas */

/**
 * @desc If administrative status enabled at launch, begin monitoring heartbeat
 */
function* handle_CHECK_INIT_CONNECTION() {
  const { administrativeStatus } = yield select(selectNetworkState);
  if (administrativeStatus) {
    yield put(NetworkActions.monitorHeartbeat());
  }
}

/**
 * @desc Handles Manual reconnect attempt by user. Sets their administrative status to true
 */
function* handle_MANUAL_RECONNECT() {
  const configuration = yield select(selectConfiguration);
  yield put(NetworkActions.setAdministrativeStatus(true));
  if (yield canConnectToNetwork(configuration.API_BASE + HEALTH_ENDPOINT)) {
    yield put(NetworkActions.monitorHeartbeat());
  } else {
    yield put(Alerts.create(networkAlertMessages.attemptToReconnectFailed));
  }
}

/**
 * @desc Rolling function that targets the API to determine our online status.
 */
function* handle_MONITOR_HEARTBEAT(cancel: PayloadAction<boolean>) {
  if (!buildTimeConfig.MOBILE || cancel.payload) {
    return;
  }
  const configuration = yield select(selectConfiguration);

  do {
    const { consecutiveHeartbeatFailures } = yield select(selectNetworkState);
    const networkRequestSuccess = yield canConnectToNetwork(configuration.API_BASE + HEALTH_ENDPOINT);
    yield put(NetworkActions.updateConnectionStatus(networkRequestSuccess));
    yield delay(getTimeBetweenTicks(consecutiveHeartbeatFailures));
  } while (!(yield cancelled()));
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
}

/**
 * @desc Handler for Administrative status.
 *       When enabled, begin polling for heartbeat.
 *       When disabled, notify user they're offline, cancel heartbeat polling,
 * @param newStatus new Administrative status
 */
function* handle_SET_ADMINISTRATIVE_STATUS(newStatus: PayloadAction<boolean>) {
  const { workingOffline } = yield select(selectAuth);

  if (workingOffline) {
    yield all([
      put(Alerts.create(networkAlertMessages.offlineUserWarning)),
      put(NetworkActions.updateConnectionStatus(true))
    ]);
    return;
  }
  if (newStatus.payload) {
    yield put(NetworkActions.monitorHeartbeat());
  } else {
    yield all([
      put(NetworkActions.monitorHeartbeat(true)), // Cancel loop
      put(Alerts.create(networkAlertMessages.userWentOffline)),
      put(NetworkActions.updateConnectionStatus(true))
    ]);
  }
}

/**
 * @desc Handler for updating current connection status given boolean flags.
 *       In case of match, do nothing.
 */
function* handle_UPDATE_CONNECTION_STATUS() {
  const { administrativeStatus, operationalStatus, connected } = yield select(selectNetworkState);
  const { workingOffline } = yield select(selectAuth);

  const networkLive = administrativeStatus && operationalStatus;
  const disconnected = connected && administrativeStatus && !operationalStatus;
  if (disconnected) {
    yield put(Alerts.create(networkAlertMessages.userLostConnection));
  }
  if ((connected && !networkLive) || workingOffline) {
    yield put(NetworkActions.offline());
  } else if (!connected && networkLive) {
    yield put(NetworkActions.online());
  }
}

function* networkSaga() {
  yield all([
    takeEvery(NetworkActions.manualReconnect, handle_MANUAL_RECONNECT),
    takeLatest(NetworkActions.monitorHeartbeat, handle_MONITOR_HEARTBEAT),
    takeEvery(NetworkActions.online, handle_NETWORK_GO_ONLINE),
    takeEvery(NetworkActions.setAdministrativeStatus, handle_SET_ADMINISTRATIVE_STATUS),
    takeEvery(NetworkActions.updateConnectionStatus, handle_UPDATE_CONNECTION_STATUS),
    takeEvery(NetworkActions.checkInitConnection, handle_CHECK_INIT_CONNECTION)
  ]);
}

export default networkSaga;
