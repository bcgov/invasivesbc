import { createAsyncThunk } from '@reduxjs/toolkit';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
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
      const args = {
        idsToCache,
        setId: spec.setId,
        API_BASE: state.Configuration.current.API_BASE
      };
      const bbox = await getBoundingBoxFromRecordsetFilters(recordSet);
      let responseData: Record<PropertyKey, any> = {
        cachedGeoJSON: null,
        cachedCentroid: null
      };

      await service.addOrUpdateRepository({
        setId: spec.setId,
        cacheTime: new Date(),
        cachedIds: idsToCache,
        recordSetType: recordSet.recordSetType,
        status: UserRecordCacheStatus.DOWNLOADING,
        bbox: bbox
      });

      if (recordSet.recordSetType === RecordSetType.Activity && (await service.download(args))) {
        Object.assign(responseData, await service.loadRecordsetSourceMetadata(idsToCache));
      } else if (recordSet.recordSetType === RecordSetType.IAPP && (await service.downloadIapp(args))) {
        Object.assign(responseData, await service.loadIappRecordsetSourceMetadata(idsToCache));
      } else {
        service.deleteRepository(spec.setId);
        throw Error('Early Exit');
      }

      await service.addOrUpdateRepository({
        setId: spec.setId,
        cacheTime: new Date(),
        cachedIds: idsToCache,
        recordSetType: recordSet.recordSetType,
        status: UserRecordCacheStatus.CACHED,
        cachedGeoJson: responseData.cachedGeoJson,
        cachedCentroid: responseData.cachedCentroid,
        bbox: bbox
      });

      // Will Refactor the current uses of Cache Metadata separately [Maintain only cache status]
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
