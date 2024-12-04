import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserRecordSet } from 'interfaces/UserRecordSet';
import { RootState } from 'state/reducers/rootReducer';
import getBoundingBoxFromRecordsetFilters from 'utils/getBoundingBoxFromRecordsetFilters';
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

      const idsToCache: string[] = state.Map.layers.find((l) => l.recordSetID == spec.setId).IDList;
      const recordSet: UserRecordSet = state.UserSettings.recordSets[spec.setId]?.tableFilters;
      const bbox = await getBoundingBoxFromRecordsetFilters(recordSet);

      await service.download({
        idsToCache,
        setId: spec.setId,
        API_BASE: state.Configuration.current.API_BASE
      });

      const { cachedCentroid, cachedGeoJson } = await service.loadRecordsetSourceMetadata(idsToCache);

      return {
        cachedIds: idsToCache,
        bbox,
        cachedGeoJson,
        cachedCentroid
      };
    }
  );
}

export default RecordCache;
