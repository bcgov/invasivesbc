import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import DownloadActions from '../downloads/DownloadActions';
import { UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { RootState } from 'state/reducers/rootReducer';
import { getRecordFilterObjectFromStateForAPI } from 'state/sagas/map/dataAccess';
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
    `${this.PREFIX}/downloadProgressEvent`
  );

  static readonly pauseDownload = createAsyncThunk(`${this.PREFIX}/pauseDownload`, async (spec: { setId: string }) => {
    await (await RecordCacheServiceFactory.getPlatformInstance()).pauseDownload(spec.setId);
  });

  static readonly startDownload = createAction<string | number>(`${this.PREFIX}/startDownload`);

  static readonly requestCaching = createAsyncThunk(
    `${this.PREFIX}/requestCaching`,
    async (
      spec: {
        setId: string;
      },
      { getState, dispatch }
    ) => {
      await dispatch(DownloadActions.request());
      const state: RootState = getState() as RootState;
      const currStatus = state.UserSettings.recordSets?.[spec.setId].cacheMetadataStatus;
      // Check if cancelled while in queue
      if (currStatus !== UserRecordCacheStatus.QUEUED) {
        return {
          status: UserRecordCacheStatus.NOT_CACHED,
          setId: spec.setId
        };
      }
      dispatch(RecordCache.startDownload(spec.setId));

      const service = await RecordCacheServiceFactory.getPlatformInstance();
      const idsToCache: string[] =
        state.Map.layers.find((l) => l.recordSetID == spec.setId)?.IDList.map((id: string | number) => id.toString()) ??
        [];
      const recordSet = JSON.parse(JSON.stringify(state.UserSettings.recordSets[spec.setId]));

      recordSet.tableFilters = getRecordFilterObjectFromStateForAPI(
        spec.setId,
        state.UserSettings,
        state.Map.clientBoundaries
      );

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
        },
        (p) => {
          dispatch(RecordCache.downloadProgressEvent(p));
        }
      );

      return {
        setId: spec.setId,
        status: (() => {
          if (downloadMode === CacheDownloadMode.ABORT) {
            return UserRecordCacheStatus.NOT_CACHED;
          } else if (downloadMode === CacheDownloadMode.PAUSE) {
            return UserRecordCacheStatus.PAUSED;
          } else {
            return UserRecordCacheStatus.CACHED;
          }
        })()
      };
    }
  );
}

export default RecordCache;
