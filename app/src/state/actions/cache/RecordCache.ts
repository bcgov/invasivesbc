import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'state/reducers/rootReducer';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';

class RecordCache {
  static readonly PREFIX = 'RecordCache';

  static readonly deleteCache = createAsyncThunk(`${this.PREFIX}/deleteCache`, async (spec: { setId: string }) => {
    const service = await RecordCacheServiceFactory.getPlatformInstance();

    await service.deleteCachedSet(spec.setId);
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

      const idsToCache = state.Map.layers.find((l) => l.recordSetID == spec.setId).IDList;

      await service.download({
        idsToCache,
        setId: spec.setId,
        API_BASE: state.Configuration.current.API_BASE
      });
    }
  );
}

export default RecordCache;
