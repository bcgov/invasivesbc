import localForage from 'localforage';
import centroid from '@turf/centroid';
import { Feature } from '@turf/helpers';
import { GeoJSONSourceSpecification } from 'maplibre-gl';
import {
  IappRecordMode,
  RepositoryMetadata,
  RecordCacheService,
  RecordSetSourceMetadata,
  CacheDownloadMode
} from 'utils/record-cache/index';
import UserRecord from 'interfaces/UserRecord';
import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import { UserRecordCacheStatus } from 'interfaces/UserRecordSet';

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

  async isCached(repositoryId: string): Promise<boolean> {
    try {
      return (await this.getRepository(repositoryId)).status === UserRecordCacheStatus.CACHED;
    } catch (e) {
      return false;
    }
  }

  async getRepository(repositoryId: string): Promise<RepositoryMetadata> {
    const repos = await this.listRepositories();
    const foundIndex = repos.findIndex((p) => p.setId === repositoryId);
    if (foundIndex === -1) throw Error(`Repository ${repositoryId} not found`);

    return repos[foundIndex];
  }

  async getIdList(repositoryId: string): Promise<string[]> {
    return (await this.getRepository(repositoryId)).cachedIds ?? [];
  }

  async saveActivity(id: string, data: unknown): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    await this.store.setItem(id, data);
  }

  async setRepositoryStatus(cacheId: string, status: UserRecordCacheStatus) {
    if (this.store == null) {
      throw Error('Cache not available');
    }
    const cachedSets = await this.listRepositories();
    const foundIndex = cachedSets.findIndex((p) => p.setId === cacheId);
    if (foundIndex !== -1) {
      Object.assign(cachedSets[foundIndex], { status });
      await this.store.setItem(LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY, cachedSets);
    }
  }

  async checkPauseOrAbort(id: string): Promise<CacheDownloadMode> {
    const sets = await this.listRepositories();
    const index = sets.findIndex((p) => p.setId === id);
    if (index !== -1) {
      if (sets[index].status === UserRecordCacheStatus.DELETING) return CacheDownloadMode.ABORT;
      else if (sets[index].status === UserRecordCacheStatus.PAUSED) return CacheDownloadMode.PAUSE;
    }
    return CacheDownloadMode.DEFAULT;
  }

  async saveIapp(id: string, iappRecord: IappRecord, iappTableRow: IappTableRow): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }
    const data = { record: iappRecord, row: iappTableRow };
    await this.store.setItem(id.toString(), data);
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

    const data = await this.store.getItem(id);

    if (!data) {
      throw new Error(`activity ${id} not found in cache`);
    }

    return data;
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
      const features = data.geometry ?? [];
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
      } catch (e) {
        // Item may not exist if a cache was quit while in progress.
      }
    }
  }

  async deleteRepository(repositoryId: string) {
    if (this.store == null) {
      throw new Error('cache not available');
    }
    const cachedSets = await this.listRepositories();
    const foundIndex = cachedSets.findIndex((p) => p.setId === repositoryId);

    if (foundIndex === -1) return;

    await this.setRepositoryStatus(repositoryId, UserRecordCacheStatus.DELETING);
    const deleteList = cachedSets[foundIndex].cachedIds;
    const ids: Record<PropertyKey, number> = {};

    cachedSets
      .flatMap((set) => set.cachedIds)
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
    const foundIndex = cachedSets.findIndex((p) => p.setId === newSet.setId);

    if (foundIndex === -1) {
      cachedSets.push(newSet);
    } else {
      Object.assign(cachedSets[foundIndex], newSet);
    }
    await this.store.setItem(LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY, cachedSets);
  }

  async listRepositories(): Promise<RepositoryMetadata[]> {
    if (this.store == null) {
      return [];
    }

    const metadata: RepositoryMetadata[] =
      (await this.store.getItem(LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY)) ?? [];
    if (metadata == null) {
      console.error('expected key not found');
      return [];
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
