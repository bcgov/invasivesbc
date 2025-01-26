import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { RootState } from 'state/reducers/rootReducer';
import getBoundingBoxFromRecordsetFilters from 'utils/getBoundingBoxFromRecordsetFilters';
import { CacheDownloadMode, RecordCacheProgressCallbackParameters } from 'utils/record-cache';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';

class RecordCache {
  static readonly PREFIX = 'RecordCache';

  /**
   * @desc Deletes cached records for a recordset.
   *       determines duplicates with a frequency map to avoid duplicating records contained elsewhere
   */
  static readonly deleteCache = createAsyncThunk(`${this.PREFIX}/deleteCache`, async (spec: { setId: string }) => {
    const service = await RecordCacheServiceFactory.getPlatformInstance();
    await service.deleteRepository(spec.setId);
  });

  static readonly stopDownload = createAsyncThunk(`${this.PREFIX}/stopDownload`, async (spec: { setId: string }) => {
    await (await RecordCacheServiceFactory.getPlatformInstance()).stopDownload(spec.setId);
  });

  static readonly downloadProgressEvent = createAction<RecordCacheProgressCallbackParameters>(
    'RECORD_CACHE_DOWNLOAD_PROGRESS_EVENT'
  );

  static readonly pauseOrResumeCache = createAction(`${this.PREFIX}/pauseOrResumeCache`, (setId: string) => ({
    payload: { setId }
  }));

  static readonly pauseDownload = createAsyncThunk(`${this.PREFIX}/pauseDownload`, async (spec: { setId: string }) => {
    await (await RecordCacheServiceFactory.getPlatformInstance()).pauseDownload(spec.setId);
  });

  static readonly requestCaching = createAsyncThunk(
    `${this.PREFIX}/requestCaching`,
    async (
      spec: {
        setId: string;
      },
      { getState, dispatch }
    ) => {
      const service = await RecordCacheServiceFactory.getPlatformInstance();
      const state: RootState = getState() as RootState;
      const idsToCache: string[] =
        state.Map.layers.find((l) => l.recordSetID == spec.setId)?.IDList.map((id: string | number) => id.toString()) ??
        [];

      const recordSet = state.UserSettings.recordSets[spec.setId];
      const bbox = await getBoundingBoxFromRecordsetFilters(recordSet);

      const downloadMode: CacheDownloadMode = await service.download(
        {
          API_BASE: state.Configuration.current.API_BASE,
          bbox,
          idsToCache,
          recordSetType: recordSet.recordSetType,
          recordSetCacheStatus: recordSet.cacheMetadataStatus,
          setId: spec.setId,
          pausedActivityIdx: recordSet.cacheDownloadProgress.pausedActivityIdx,
          processedActivities: recordSet.cacheDownloadProgress.processedActivities
          // pauseidx -1 if nothing, else the actual idx
          //processed caches, 0 if nothing, else the actual value
        },
        (p) => {
          dispatch(RecordCache.downloadProgressEvent(p));
        }
      );

      return {
        setId: spec.setId,
        status:
          downloadMode == CacheDownloadMode.ABORT
            ? UserRecordCacheStatus.NOT_CACHED
            : downloadMode == CacheDownloadMode.PAUSE
              ? UserRecordCacheStatus.PAUSED
              : UserRecordCacheStatus.CACHED
      };
    }
  );
}

export default RecordCache;
