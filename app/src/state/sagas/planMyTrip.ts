import { all, takeEvery } from 'redux-saga/effects';
import RecordCache from 'state/actions/cache/RecordCache';
import TileCache from 'state/actions/cache/TileCache';
import WellCache from 'state/actions/cache/WellCache';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import { IPlanMyTripCacheStatus, IPlanMyTripCacheStatuses, PlanMyTripCacheService } from 'utils/plan-my-trip-cache';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';

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

const handleUpdateSubcacheStatus = async (action, status: IPlanMyTripCacheStatus) => {
  const shortened = action?.meta?.arg;
  const setId = shortened?.id ?? shortened?.setId ?? '';
  if (setId.includes(PlanMyTrip.TRIP_ID_PREFIX)) {
    const cleanedSetId = setId
      .replace(PlanMyTrip.Recordset.ACTIVITY_PRE, '')
      .replace(PlanMyTrip.Recordset.IAPP_PRE, '');
    const cacheKey = actionToCacheKey(action.type, setId);
    const service: PlanMyTripCacheService = await PlanMyTripCacheServiceFactory.getPlatformInstance();
    await service.updateSubCacheStatus(cleanedSetId, cacheKey, status);
  }
};
const handleTripSubcacheDownloadSuccess = async (action) =>
  await handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.CACHED);

const handleTripSubcacheFailure = async (action) =>
  await handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.FAILED);

const handleTripSubcacheDeleteSuccess = async (action) =>
  await handleUpdateSubcacheStatus(action, IPlanMyTripCacheStatus.NOT_CACHED);

function* planMyTripSaga() {
  yield all([
    takeEvery(
      [TileCache.requestCaching.fulfilled, WellCache.requestCaching.fulfilled, RecordCache.requestCaching.fulfilled],
      handleTripSubcacheDownloadSuccess
    ),
    takeEvery(
      [
        TileCache.requestCaching.rejected,
        TileCache.deleteRepository.rejected,
        WellCache.requestCaching.rejected,
        WellCache.deleteRepository.rejected,
        RecordCache.requestCaching.rejected,
        RecordCache.deleteCache.rejected
      ],
      handleTripSubcacheFailure
    ),
    takeEvery(
      [TileCache.deleteRepository.fulfilled, WellCache.deleteRepository.fulfilled, RecordCache.deleteCache.fulfilled],
      handleTripSubcacheDeleteSuccess
    )
  ]);
}

export default planMyTripSaga;
