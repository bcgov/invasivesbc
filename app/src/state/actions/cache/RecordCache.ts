import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { RootState } from 'state/reducers/rootReducer';
import getBoundingBoxFromRecordsetFilters from 'utils/getBoundingBoxFromRecordsetFilters';
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

  static readonly requestCaching = createAsyncThunk(
    `${this.PREFIX}/requestCaching`,
    async (
      spec: {
        setId: string;
      },
      { getState }
    ) => {
      const service = await RecordCacheServiceFactory.getPlatformInstance();
      const state: RootState = getState() as RootState;

      const idsToCache: string[] = state.Map.layers
        .find((l) => l.recordSetID == spec.setId)
        .IDList.map((id: string | number) => id.toString());

      const recordSet = state.UserSettings.recordSets[spec.setId];
      const bbox = await getBoundingBoxFromRecordsetFilters(recordSet);

      const downloadCompleted = await service.downloadCache({
        API_BASE: state.Configuration.current.API_BASE,
        bbox,
        idsToCache,
        recordSetType: recordSet.recordSetType,
        setId: spec.setId
      });

      return {
        setId: spec.setId,
        status: downloadCompleted ? UserRecordCacheStatus.CACHED : UserRecordCacheStatus.NOT_CACHED
      };
    }
  );
}

export default RecordCache;
