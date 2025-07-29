import { buffers } from 'redux-saga';
import { actionChannel, all, call, fork, put, take } from 'redux-saga/effects';
import RecordCache from 'state/actions/cache/RecordCache';
import TileCache from 'state/actions/cache/TileCache';
import WellCache from 'state/actions/cache/WellCache';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import { IPlanMyTripCacheStatus, IPlanMyTripCacheStatuses, PlanMyTripCacheService } from 'utils/plan-my-trip-cache';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';

function* createQueueWorker(channel, workerFn) {
  while (true) {
    const action = yield take(channel);
    yield call(workerFn, action);
  }
}

const actionToCacheKey = (action: string, setId?: string): keyof IPlanMyTripCacheStatuses => {
  if (action.startsWith(WellCache.PREFIX)) {
    return 'wellData';
  } else if (action.startsWith(TileCache.PREFIX)) {
    return 'mapTiles';
  } else if (action.startsWith(RecordCache.PREFIX) && setId?.startsWith(PlanMyTrip.Recordset.ACTIVITY_PRE)) {
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
  yield handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.FAILED);
}
function* handleTripSubcacheDeleteSuccess(action) {
  yield handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.NOT_CACHED);
}
function* handleTripSubcacheDownloadPending(action) {
  yield handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.IN_PROGRESS);
}

/**
 * @desc Saga for PlanMyTrip. Runs channels to avoid race conditions when updating (affects LocalForage)
 */
function* planMyTripSaga() {
  const pendingChannel = yield actionChannel(
    [TileCache.requestCaching.pending, WellCache.requestCaching.pending, RecordCache.requestCaching.pending],
    buffers.expanding()
  );
  const fulfilledChannel = yield actionChannel(
    [TileCache.requestCaching.fulfilled, WellCache.requestCaching.fulfilled, RecordCache.requestCaching.fulfilled],
    buffers.expanding()
  );
  const rejectedChannel = yield actionChannel(
    [
      TileCache.requestCaching.rejected,
      TileCache.deleteRepository.rejected,
      WellCache.requestCaching.rejected,
      WellCache.deleteRepository.rejected,
      RecordCache.requestCaching.rejected,
      RecordCache.deleteCache.rejected
    ],
    buffers.expanding()
  );

  const deleteFulfilledChannel = yield actionChannel(
    [TileCache.deleteRepository.fulfilled, WellCache.deleteRepository.fulfilled, RecordCache.deleteCache.fulfilled],
    buffers.expanding()
  );

  yield all([
    fork(createQueueWorker, pendingChannel, handleTripSubcacheDownloadPending),
    fork(createQueueWorker, fulfilledChannel, handleTripSubcacheDownloadSuccess),
    fork(createQueueWorker, rejectedChannel, handleTripSubcacheFailure),
    fork(createQueueWorker, deleteFulfilledChannel, handleTripSubcacheDeleteSuccess)
  ]);
}

export default planMyTripSaga;
