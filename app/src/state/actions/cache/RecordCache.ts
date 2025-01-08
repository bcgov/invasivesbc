import { createAsyncThunk } from '@reduxjs/toolkit';
import { RecordSetType, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
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
    const sets = await service.listCachedSets();
    const deleteTarget = sets.find((p) => p.setId === spec.setId);
    if (!deleteTarget) {
      throw Error(`set ${spec.setId} was not found in Cache`);
    }

    const deleteList = deleteTarget?.cachedIds ?? [];
    const ids: Record<PropertyKey, number> = {};
    sets
      .flatMap((set) => set.cachedIds)
      .forEach((id) => {
        ids[id] ??= 0;
        ids[id]++;
      });

    const recordsToErase = deleteList.filter((id) => ids[id] === 1);
    await service.deleteCachedRecordsFromIds(recordsToErase, spec.setId, deleteTarget.recordSetType);
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
      const { recordSetType, tableFilters }: UserRecordSet = state.UserSettings.recordSets[spec.setId];
      const args = {
        idsToCache,
        setId: spec.setId,
        API_BASE: state.Configuration.current.API_BASE
      };
      const bbox = await getBoundingBoxFromRecordsetFilters(tableFilters);
      let responseData: Record<PropertyKey, any> = {
        cachedGeoJSON: null,
        cachedCentroid: null
      };

      await service.addOrUpdateCachedSet({
        setId: spec.setId,
        cacheTime: new Date(),
        cachedIds: idsToCache,
        recordSetType: RecordSetType.IAPP,
        status: UserRecordCacheStatus.DOWNLOADING,
        bbox: bbox
      });

      if (recordSetType === RecordSetType.Activity) {
        await service.download(args);
        Object.assign(responseData, await service.loadRecordsetSourceMetadata(idsToCache));
      } else if (recordSetType === RecordSetType.IAPP) {
        await service.downloadIapp(args);
        Object.assign(responseData, await service.loadIappRecordsetSourceMetadata(idsToCache));
      }

      await service.addOrUpdateCachedSet({
        setId: spec.setId,
        cacheTime: new Date(),
        cachedIds: idsToCache,
        recordSetType: RecordSetType.IAPP,
        status: UserRecordCacheStatus.CACHED,
        cachedGeoJson: responseData.cachedGeoJson,
        cachedCentroid: responseData.cachedCentroid,
        bbox: bbox
      });

      // Will Refactor the current uses of Cache Metadata separately
      return {
        status: UserRecordCacheStatus.CACHED,
        idList: idsToCache,
        bbox: bbox,
        setId: spec.setId,
        cachedGeoJson: responseData.cachedGeoJson,
        cachedCentroid: responseData.cachedCentroid
      };
    }
  );
}

export default RecordCache;
