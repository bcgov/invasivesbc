import localForage from 'localforage';
import centroid from '@turf/centroid';
import { GeoJSONSourceSpecification } from 'maplibre-gl';
import booleanIntersects from '@turf/boolean-intersects';
import { Feature } from 'geojson';
import {
  IappRecordMode,
  RepositoryMetadata,
  RecordCacheService,
  RecordSetSourceMetadata,
  CacheDownloadMode,
  IQueryParams
} from 'utils/record-cache/index';
import UserRecord from 'interfaces/UserRecord';
import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import { UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import bboxToPolygon from 'utils/bboxToPolygon';
import { getUnnestedFieldsForActivity } from 'UI/Features/Records/RecordSet/RecordTableHelpers';

class LocalForageRecordCacheService extends RecordCacheService {
  private static _instance: LocalForageRecordCacheService;

  private static readonly CACHED_SETS_METADATA_KEY = 'cached-sets';

  private store: LocalForage | null = null;

  protected constructor() {
    super();
  }

  static async getInstance(): Promise<LocalForageRecordCacheService> {
    if (LocalForageRecordCacheService._instance == null) {
      LocalForageRecordCacheService._instance = new LocalForageRecordCacheService();
      await LocalForageRecordCacheService._instance.initializeCache();
    }
    return LocalForageRecordCacheService._instance;
  }

  /**
   * @desc Query cached recordsets for results, orderable, filterable, limitable
   *       LocalForage has no querying capabilities, but this is only used for Development.
   */
  async query(params: IQueryParams): Promise<UserRecord[] | IappRecord[]> {
    if (this.store == null) {
      throw new Error('Cache not available');
    }
    let records: Array<UserRecord | IappRecord> = [];
    await this.store.iterate((value: Record<PropertyKey, any>, key: PropertyKey) => {
      if (key === LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY) return;
      if (
        params.tableFilters.every((filter) => {
          if (filter.filterType === 'spatialFilterDrawn') {
            const shape = value?.record?.geom?.geometry ?? value?.geometry ?? null;
            if (Object.hasOwn(shape, 'length')) {
              return shape.some((cachedFeature: Feature) => booleanIntersects(cachedFeature, filter.geojson));
            } else if (shape) {
              return booleanIntersects(shape, filter.geojson);
            }
          }
          const pattern = new RegExp(filter.filter, 'i');
          const columnVal = (() => {
            if (value?.[filter.field]) {
              return value[filter.field];
            } else if (value?.row?.[filter.field]) {
              return value.row[filter.field];
            } else {
              return '';
            }
          })();
          return filter.operator === 'CONTAINS' ? pattern.test(columnVal) : !pattern.test(columnVal);
        })
      ) {
        records.push(value);
      }
    });
    if (params.sort) {
      const { by, order } = params.sort;
      records.sort((a, b) => {
        if (!a[by] && !b[by]) {
          return 0;
        } else if (!a[by]) {
          return 1;
        } else if (!b[by]) {
          return -1;
        } else {
          return a[by]?.localeCompare(b[by]);
        }
      });
      if (order === 'DESC') {
        records.reverse();
      }
    }
    if (params?.page != undefined && params?.limit != undefined) {
      const startPos = params.page * params.limit;
      const endPos = Math.min((params.page + 1) * params.limit, records.length);
      records = records.slice(startPos, endPos);
    }
    if (params.selectColumns) {
      return records.map((record) => {
        const resObj: Record<PropertyKey, any> = {};
        params.selectColumns.forEach((column) => {
          if (column.toLowerCase() === 'table_data') {
            resObj.table_data = record['row'];
          } else if (column.toLowerCase() === 'record_data') {
            resObj.record_data = record['record'];
          } else if (column.toLowerCase() === 'id') {
            resObj.id = record.activity_id ?? record['row'].site_id ?? '';
          } else {
            resObj[column] = record[column];
          }
        });
        return resObj;
      });
    }
    return records;
  }

  async isCached(repositoryId: string): Promise<boolean> {
    try {
      return (await this.getRepository(repositoryId, ['status'])).status === UserRecordCacheStatus.CACHED;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  getRepository(repositoryId: string, columns: Array<keyof RepositoryMetadata>): Promise<Partial<RepositoryMetadata>>;
  getRepository(repositoryId: string): Promise<RepositoryMetadata>;
  async getRepository(
    repositoryId: string,
    columns?: Array<keyof RepositoryMetadata>
  ): Promise<RepositoryMetadata | Partial<RepositoryMetadata>> {
    const repos = await this.listRepositories();
    const foundIndex = repos.findIndex((p) => p.set_id == repositoryId);
    if (foundIndex === -1) throw Error(`Repository ${repositoryId} not found`);
    if (columns) {
      const res: Partial<Record<keyof RepositoryMetadata, any>> = {};
      columns.forEach((column) => {
        res[column] = repos[foundIndex]?.[column];
      });
      return res;
    }
    return repos[foundIndex];
  }

  async saveActivity(data: Record<PropertyKey, UserRecord>): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }
    await Promise.all(
      Object.keys(data).map((key) => {
        const parsed = getUnnestedFieldsForActivity(data[key]);
        (parsed as Record<PropertyKey, any>).data = data[key];
        this.store?.setItem(key, parsed);
      })
    );
  }

  /**
   * @desc Returns list of IDs that overlap with a GeoJSON Object
   * @param {Feature} geom GeoJSON Object to find overlaps
   * @returns { string[] } Overlapping record Ids
   */
  public async getRecordIdsOverlappingFeature(geom: Feature): Promise<string[]> {
    const reposInBoundingBox = ((await this.listRepositories(['set_id', 'status', 'bbox'])) ?? [])?.filter(
      (r) => r?.status === UserRecordCacheStatus.CACHED && booleanIntersects(bboxToPolygon(r.bbox!), geom)
    );

    const featureMap: Record<PropertyKey, Feature> = {};
    const overlappingRecords: string[] = [];

    // Multiple Repos could contain the same record, so iterate them into an object to filter the duplicates
    for (const r of reposInBoundingBox) {
      const repo = await this.getRepository(r.set_id!, ['cached_geojson']);
      (repo?.cached_geojson?.data as any)?.features.forEach((feature: Feature, i: number) => {
        featureMap[feature?.properties?.name + i] ??= feature;
      });
    }
    Object.values(featureMap).forEach((feature) => {
      if (booleanIntersects(geom, feature)) {
        overlappingRecords.push(feature?.properties?.description);
      }
    });
    return overlappingRecords;
  }

  async setRepositoryStatus(cacheId: string, status: UserRecordCacheStatus) {
    if (this.store == null) {
      throw Error('Cache not available');
    }
    const cachedSets = await this.listRepositories();
    const foundIndex = cachedSets.findIndex((p) => p.set_id === cacheId);
    if (foundIndex !== -1) {
      Object.assign(cachedSets[foundIndex], { status });
      await this.store.setItem(LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY, cachedSets);
    }
  }

  async checkPauseOrAbort(id: string): Promise<CacheDownloadMode> {
    const sets = await this.listRepositories();
    const index = sets.findIndex((p) => p.set_id === id);
    if (index !== -1) {
      if (sets[index].status === UserRecordCacheStatus.DELETING) return CacheDownloadMode.ABORT;
      else if (sets[index].status === UserRecordCacheStatus.PAUSED) return CacheDownloadMode.PAUSE;
    }
    return CacheDownloadMode.DEFAULT;
  }

  async saveIapp(data: Record<PropertyKey, IappRecord | IappTableRow>): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }
    await Promise.all(Object.keys(data).map((id) => this.store?.setItem(id.toString(), data[id])));
  }

  async loadIapp(id: string, type: IappRecordMode): Promise<IappRecord | IappTableRow> {
    if (this.store == null) {
      throw new Error('cache not available');
    }
    const data = await this.store.getItem(id.toString());
    if (!data) {
      throw new Error(`Iapp ${id} not found in cache`);
    }
    return data[type];
  }

  async getPaginatedCachedIappRecords(
    recordSetIdList: string[],
    page: number,
    limit: number,
    type: IappRecordMode = IappRecordMode.Row
  ): Promise<IappRecord[]> {
    if (recordSetIdList?.length === 0) {
      return [];
    }
    const startPos = page * limit;
    const results: any[] = [];
    const endPos = Math.min((page + 1) * limit, recordSetIdList.length);
    for (let i = startPos; i < endPos; i++) {
      const entry: IappRecord = await this.loadIapp(recordSetIdList[i], type);
      results.push(entry);
    }
    return results;
  }

  async loadActivity(id: string): Promise<unknown> {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    const data = (await this.store.getItem(id)) as UserRecord;

    if (!data) {
      throw new Error(`activity ${id} not found in cache`);
    }

    return data?.data;
  }

  /**
   * @desc fetch `n` records for a given recordset, supporting pagination
   * @param recordSetID Recordset to filter from
   * @param page Page to start pagination on
   * @param limit Maximum results per page
   * @returns { UserRecord[] } Filter Objects
   */
  async getPaginatedCachedActivityRecords(
    recordSetIdList: string[],
    page: number = 0,
    limit: number = recordSetIdList.length
  ): Promise<UserRecord[]> {
    if (recordSetIdList?.length === 0) {
      return [];
    }
    const startPos = page * limit;
    const results: any[] = [];
    const endPos = Math.min((page + 1) * limit, recordSetIdList.length);
    for (let i = startPos; i < endPos; i++) {
      const entry: UserRecord = (await this.loadActivity(recordSetIdList[i])) as UserRecord;
      results.push(entry);
    }
    return results;
  }

  /**
   * @desc Iterate ids to produce list of values to populate in the map.
   *       The values only change with the recordsets, so we create the list at cache-ception to avoid querying
   * @param ids ids to filter
   * @returns { RecordSetSourceMetadata } Returns cached GeoJson, all IAPP Sites are Points.
   */
  async createIappRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata> {
    const geoJsonArr: any[] = [];
    for (const id of ids) {
      const data: IappRecord = await this.loadIapp(id, IappRecordMode.Row);
      const label = `${id}\n${data.geojson.properties.map_symbol ?? ''}`;
      const feature = data.geojson;
      feature.properties = { name: label, description: id };
      geoJsonArr.push(feature);
    }
    const cachedGeoJson: GeoJSONSourceSpecification = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geoJsonArr
      }
    };
    return { cachedGeoJson };
  }

  /**
   * @desc Iterate ids to produce list of values to populate in the map.
   *       The values only change with the recordsets, so we create the list at cache-ception to avoid querying
   * @param ids ids to filter
   * @returns { RecordSetSourceMetadata } Two formatted queries for High/Low zoom layers
   */
  async createActivityRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata> {
    const centroidArr: any[] = [];
    const geoJsonArr: any[] = [];

    for (const id of ids) {
      const data: UserRecord = (await this.loadActivity(id)) as UserRecord;
      const label = data.short_id;
      const features = (data.geometry as Feature[]) ?? [];
      features.forEach((feature: Feature) => {
        feature.properties = { name: label + '\n' + data.map_symbol, description: id };
        centroidArr.push(centroid(feature));
        geoJsonArr.push(feature);
      });
    }
    const cachedCentroid: GeoJSONSourceSpecification = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: centroidArr
      }
    };
    const cachedGeoJson: GeoJSONSourceSpecification = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geoJsonArr
      }
    };
    return { cachedCentroid, cachedGeoJson };
  }

  override async deleteCachedRecordsFromIds(idsToDelete: string[]): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    for (const id of idsToDelete) {
      try {
        await this.store.removeItem(id.toString());
      } catch (_e) {
        // Item may not exist if a cache was quit while in progress.
      }
    }
  }

  async deleteRepository(repositoryId: string) {
    if (this.store == null) {
      throw new Error('cache not available');
    }
    const cachedSets = await this.listRepositories(['cached_ids', 'set_id']);
    const foundIndex = cachedSets.findIndex((p) => p.set_id === repositoryId);

    if (foundIndex === -1) return;

    await this.setRepositoryStatus(repositoryId, UserRecordCacheStatus.DELETING);
    const deleteList = cachedSets[foundIndex].cached_ids ?? [];
    const ids: Record<PropertyKey, number> = {};

    cachedSets
      .flatMap((set) => set?.cached_ids ?? [])
      .forEach((id) => {
        ids[id] ??= 0;
        ids[id]++;
      });
    const recordsToErase = deleteList.filter((id) => ids[id] === 1);
    this.deleteCachedRecordsFromIds(recordsToErase);
    cachedSets.splice(foundIndex, 1);
    await this.store.setItem(LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY, cachedSets);
  }

  protected async dateOfMostRecentRecord() {
    if (this.store == null) {
      throw new Error('cache not available');
    }
    let maxDate = new Date(0);
    await this.store.iterate((value: Record<PropertyKey, any>) => {
      const recordDate = new Date(value?.date_created);
      if (recordDate > maxDate) {
        maxDate = recordDate;
      }
    });
    return maxDate;
  }

  protected async getAllCachedIds(): Promise<string[]> {
    if (this.store == null) {
      throw new Error('cache not available');
    }
    const keys = (await this.store.keys()) ?? [];
    return keys.filter((key) => key !== LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY);
  }

  /**
   * @desc Create or Update an entry in the cachedSet Repository
   * @param newSet Data to update
   */
  async addOrUpdateRepository(newSet: RepositoryMetadata): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    const cachedSets = (await this.listRepositories()) ?? [];
    const foundIndex = cachedSets.findIndex((p) => p.set_id === newSet.set_id);

    if (foundIndex === -1) {
      cachedSets.push(newSet);
    } else {
      Object.assign(cachedSets[foundIndex], newSet);
    }
    await this.store.setItem(LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY, cachedSets);
  }

  listRepositories(columns: Array<keyof RepositoryMetadata>): Promise<Partial<RepositoryMetadata>[]>;
  listRepositories(): Promise<RepositoryMetadata[]>;
  async listRepositories(
    columns?: Array<keyof RepositoryMetadata>
  ): Promise<RepositoryMetadata[] | Partial<RepositoryMetadata>[]> {
    if (this.store == null) {
      return [];
    }

    const metadata: RepositoryMetadata[] =
      (await this.store.getItem(LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY)) ?? [];
    if (metadata == null) {
      console.error('expected key not found');
      return [];
    }
    if (columns) {
      return metadata.map((repo) => {
        const res: Partial<Record<keyof RepositoryMetadata, any>> = {};
        columns.forEach((field) => {
          res[field] = repo?.[field];
        });
        return res;
      });
    }
    return metadata;
  }

  private async initializeCache() {
    this.store = localForage.createInstance({
      storeName: 'record-cache',
      version: 20241030
    });
  }
}

export { LocalForageRecordCacheService };
