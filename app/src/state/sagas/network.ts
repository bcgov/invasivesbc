import networkAlertMessages from 'constants/alerts/networkAlerts';
import { all, put, select, takeEvery } from 'redux-saga/effects';
import Alerts from 'state/actions/alerts/Alerts';
import NetworkActions from 'state/actions/network/NetworkActions';
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

function* networkSaga() {
  yield all([
    takeEvery(NetworkActions.offline, handle_NETWORK_GO_OFFLINE),
    takeEvery(NetworkActions.online, handle_NETWORK_GO_ONLINE)
  ]);
}

export default networkSaga;
