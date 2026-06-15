import { buffers } from 'redux-saga';
import { actionChannel, all, call, fork, put, take } from 'redux-saga/effects';
import RecordCache from 'state/actions/cache/RecordCache';
import WellCache from 'state/actions/cache/WellCache';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import { IPlanMyTripCacheStatus, IPlanMyTripCacheStatuses, PlanMyTripCacheService } from 'utils/plan-my-trip-cache';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import OfflineProtomaps from 'state/actions/cache/OfflineProtomaps';
import Alerts from 'state/actions/alerts/Alerts';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';

function* createQueueWorker(channel) {
  while (true) {
    const action = yield take(channel);
    yield call(processCombinedCacheAction, action);
  }
}

const actionToCacheKey = (action: string, setId?: string): keyof IPlanMyTripCacheStatuses => {
  if (action.startsWith(WellCache.PREFIX)) {
    return 'wellData';
  } else if (action.startsWith('OfflineProtomaps')) {
    return 'mapTiles';
  } else if (
    (action.startsWith(RecordCache.PREFIX) || action.startsWith(PlanMyTrip.Recordset.PREFIX)) &&
    setId?.startsWith(PlanMyTrip.Recordset.ACTIVITY_PRE)
  ) {
    return 'activityRecordset';
  }
  return 'iappRecordset';
};

/**
 * @desc Consumes Cache actions. Checks ID belongs to a trip through regex matching `pmt-`
 *       and updates the cache set to match.
 */
function* handleUpdateSubcacheStatus(action, status: IPlanMyTripCacheStatus) {
  const setId = (() => {
    const short = action?.meta?.arg;
    if (typeof short === 'string') {
      return short;
    }
    return short?.id ?? short?.setId ?? '';
  })();

  if (setId.includes(PlanMyTrip.TRIP_ID_PREFIX)) {
    const cleanedSetId = setId
      .replace(PlanMyTrip.Recordset.ACTIVITY_PRE, '')
      .replace(PlanMyTrip.Recordset.IAPP_PRE, '');
    const cacheKey = actionToCacheKey(action.type, setId);
    const service: PlanMyTripCacheService = yield PlanMyTripCacheServiceFactory.getPlatformInstance();
    yield service.updateSubCacheStatus(cleanedSetId, cacheKey, status);
    yield put(PlanMyTrip.refresh());
  }
}
function* handleTripSubcacheDownloadSuccess(action) {
  yield handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.CACHED);
}
function* handleTripSubcacheFailure(action) {
  if (action.payload?.reason === IPlanMyTripCacheStatus.NO_DATA) {
    yield handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.NO_DATA);
  } else {
    yield handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.FAILED);
  }
  if (OfflineProtomaps.mapGeneration.rejected.match(action)) {
    yield put(
      Alerts.create({
        severity: AlertSeverity.Error,
        subject: AlertSubjects.PlanMyTrip,
        content: 'Map Generation Request failed (server was unable to process request)'
      })
    );
  }
}
function* handleTripSubcacheDeleteSuccess(action) {
  yield handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.NOT_CACHED);
}
function* handleTripSubcacheDownloadPending(action) {
  yield handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.IN_PROGRESS);
}

function* processCombinedCacheAction(action) {
  try {
    switch (action.type) {
      // Download starts.
      case WellCache.requestCaching.pending.type:
      case OfflineProtomaps.mapGeneration.pending.type:
      case RecordCache.requestCaching.pending.type:
        yield call(handleTripSubcacheDownloadPending, action);
        break;

      // Success Actions
      case OfflineProtomaps.mapGeneration.fulfilled.type:
      case WellCache.requestCaching.fulfilled.type:
      case RecordCache.requestCaching.fulfilled.type:
        yield call(handleTripSubcacheDownloadSuccess, action);
        break;

      // All Rejected actions
      case WellCache.requestCaching.rejected.type:
      case WellCache.deleteRepository.rejected.type:
      case RecordCache.requestCaching.rejected.type:
      case RecordCache.deleteCache.rejected.type:
      case OfflineProtomaps.mapGeneration.rejected.type:
      case PlanMyTrip.Recordset.download.rejected.type:
        yield call(handleTripSubcacheFailure, action);
        break;

      // Successful Deletion
      case WellCache.deleteRepository.fulfilled.type:
      case RecordCache.deleteCache.fulfilled.type:
        yield call(handleTripSubcacheDeleteSuccess, action);
        break;

      default:
        console.warn(`unhandled action type in queue: ${action.type}`);
        break;
    }
  } catch (error) {
    console.error(`Error in queue for action ${action.type}:`, error);
  }
}

/**
 * @desc Saga for PlanMyTrip. Runs single channel to avoid race conditions in updating (affects LocalForage)
 */
function* planMyTripSaga() {
  const combinedCacheChannel = yield actionChannel(
    [
      // Pending Actions
      OfflineProtomaps.mapGeneration.pending,
      WellCache.requestCaching.pending,
      RecordCache.requestCaching.pending,

      // Fulfilled Actions
      OfflineProtomaps.mapGeneration.fulfilled,
      WellCache.requestCaching.fulfilled,
      RecordCache.requestCaching.fulfilled,

      // Rejected Actions (various)
      OfflineProtomaps.mapGeneration.rejected,
      WellCache.requestCaching.rejected,
      WellCache.deleteRepository.rejected,
      RecordCache.requestCaching.rejected,
      RecordCache.deleteCache.rejected,
      PlanMyTrip.Recordset.download.rejected,

      // Delete Fulfilled Actions
      WellCache.deleteRepository.fulfilled,
      RecordCache.deleteCache.fulfilled
    ],
    buffers.expanding()
  );

  yield all([fork(createQueueWorker, combinedCacheChannel)]);
}

export default planMyTripSaga;
