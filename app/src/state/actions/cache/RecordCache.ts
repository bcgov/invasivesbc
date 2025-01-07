import { createAsyncThunk } from '@reduxjs/toolkit';
import { RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import { RootState } from 'state/reducers/rootReducer';
import getBoundingBoxFromRecordsetFilters from 'utils/getBoundingBoxFromRecordsetFilters';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';

class RecordCache {
  static readonly PREFIX = 'RecordCache';

  /**
   * @desc Deletes cached records for a recordset.
   *       determines duplicates with a frequency map to avoid duplicating records contained elsewhere
   */
  static readonly deleteCache = createAsyncThunk(
    `${this.PREFIX}/deleteCache`,
    async (spec: { setId: string }, { getState }) => {
      const service = await RecordCacheServiceFactory.getPlatformInstance();
      const state = getState() as RootState;
      const { recordSets } = state.UserSettings;
      const deleteList = recordSets[spec.setId].cacheMetadata.idList ?? [];
      const ids: Record<PropertyKey, number> = {};
      Object.keys(recordSets)
        .flatMap((key) => recordSets[key].cacheMetadata.idList ?? [])
        .forEach((id) => {
          ids[id] ??= 0;
          ids[id]++;
        });

      const recordsToErase = deleteList.filter((id) => ids[id] === 1);
      await service.deleteCachedRecordsFromIds(recordsToErase, spec.setId, recordSets[spec.setId].recordSetType);
    }
  );

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
      const { recordSetType, tableFilters }: UserRecordSet = state.UserSettings.recordSets[spec.setId];
      const args = {
        idsToCache,
        setId: spec.setId,
        API_BASE: state.Configuration.current.API_BASE
      };
      const bbox = await getBoundingBoxFromRecordsetFilters(tableFilters);
      let responseData: Record<PropertyKey, any> = {
        cachedGeoJSON: [],
        cachedCentroid: []
      };

      if (recordSetType === RecordSetType.Activity) {
        await service.download(args);
        responseData = await service.loadRecordsetSourceMetadata(idsToCache);
      } else if (recordSetType === RecordSetType.IAPP) {
        await service.downloadIapp(args);
        responseData = await service.loadIappRecordsetSourceMetadata(idsToCache);
      }
      return {
        cachedIds: idsToCache,
        setId: spec.setId,
        bbox,
        cachedGeoJson: responseData.cachedGeoJson,
        cachedCentroid: responseData.cachedCentroid ?? []
      };
    }
  );
}

export default RecordCache;
