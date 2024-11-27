import networkAlertMessages from 'constants/alerts/networkAlerts';
import { HEALTH_ENDPOINT } from 'constants/misc';
import { all, put, select, takeEvery } from 'redux-saga/effects';
import Alerts from 'state/actions/alerts/Alerts';
import NetworkActions from 'state/actions/network/NetworkActions';
import { MOBILE } from 'state/build-time-config';
import { selectConfiguration } from 'state/reducers/configuration';
import { selectNetworkConnected } from 'state/reducers/network';
import { OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';

function* handle_NETWORK_GO_OFFLINE() {
  yield put(Alerts.create(networkAlertMessages.userWentOffline));
}

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

function* handle_CHECK_MOBILE_NETWORK_STATUS() {
  if (!MOBILE) {
    return;
  }
  const currentOnlineStatus = yield select(selectNetworkConnected);
  const configuration = yield select(selectConfiguration);

  const networkCheckPassed = yield fetch(configuration.API_BASE + HEALTH_ENDPOINT)
    .then((res) => res.status === 200)
    .catch(() => false);

  if (!networkCheckPassed && !currentOnlineStatus) {
    yield put(Alerts.create(networkAlertMessages.attemptToReconnectFailed));
  } else if (!networkCheckPassed) {
    yield put(NetworkActions.userLostConnection());
    yield put(Alerts.create(networkAlertMessages.userLostConnection));
  } else if (networkCheckPassed && !currentOnlineStatus) {
    // Only fire online event if we are not already online
    yield put(NetworkActions.online());
  }
}

function* networkSaga() {
  yield all([
    takeEvery(NetworkActions.offline, handle_NETWORK_GO_OFFLINE),
    takeEvery(NetworkActions.online, handle_NETWORK_GO_ONLINE),
    takeEvery(NetworkActions.checkMobileNetworkStatus, handle_CHECK_MOBILE_NETWORK_STATUS)
  ]);
}

export default networkSaga;
