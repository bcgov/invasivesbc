import { GeoJSONSourceSpecification } from 'maplibre-gl';
import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import UserRecord from 'interfaces/UserRecord';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { getSelectColumnsByRecordSetType } from 'state/sagas/map/dataAccess';
import BaseCacheService from 'utils/base-classes/BaseCacheService';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';

export enum IappRecordMode {
  Record = 'record',
  Row = 'row'
}

export enum CacheDownloadMode {
  DEFAULT = '',
  PAUSE = 'pause',
  ABORT = 'abort'
}
export interface RecordCacheDownloadRequestSpec {
  setId: string;
  API_BASE: string;
  idsToCache: string[];
  pausedActivityIdx: number;
  processedActivities: number;
}
/**
 * @desc Cached Metadata for Recordsets
 * @property { string } setID Recordset ID
 * @property { string[] } cachedIds collection of activity_ids in Recordset
 * @property { Date } cacheTime Timestamp of cache
 * @property { GeoJSONSourceSpecification } cachedGeoJSON  Cached Features for low map layers
 * @property { GeoJSONSourceSpecification } cachedCentroid Cached Points for high map layers
 * @property { UserRecordCacheStatus } status Cache Status.
 */
export interface RepositoryMetadata {
  setId: string;
  cacheTime: Date;
  cachedIds: string[];
  recordSetType: RecordSetType;
  cachedGeoJson?: GeoJSONSourceSpecification;
  cachedCentroid?: GeoJSONSourceSpecification;
  bbox?: RepositoryBoundingBoxSpec;
  status: UserRecordCacheStatus;
}

export interface RecordSetSourceMetadata {
  cachedGeoJson: GeoJSONSourceSpecification;
  cachedCentroid?: GeoJSONSourceSpecification;
}

export interface RecordCacheProgressCallbackParameters {
  setId: string;
  message: string;
  pausedActivityIdx: number;
  downloadMode: CacheDownloadMode;
  normalizedProgress: number;
  totalActivities: number;
  processedActivities: number;
}

export interface CacheDownloadSpec {
  bbox: RepositoryBoundingBoxSpec;
  idsToCache: string[];
  setId: string;
  API_BASE: string;
  recordSetType: RecordSetType;
  recordSetCacheStatus: UserRecordCacheStatus;
  pausedActivityIdx: number;
  processedActivities: number;
}

abstract class RecordCacheService extends BaseCacheService<
  RepositoryMetadata,
  CacheDownloadSpec,
  RecordCacheProgressCallbackParameters,
  UserRecordCacheStatus
> {
  private readonly CONCURRENCY_LIMIT = 4;

  protected constructor() {
    super();
  }

  static async getInstance(): Promise<RecordCacheService> {
    throw new Error('unimplemented in abstract base class');
  }
  protected abstract addOrUpdateRepository(spec: RepositoryMetadata): Promise<void>;

  protected abstract deleteCachedRecordsFromIds(idsToDelete: string[], recordSetType: RecordSetType): Promise<void>;

  /** */
  public abstract loadActivity(id: string): Promise<unknown>;

  public abstract loadIapp(id: string, type: IappRecordMode): Promise<IappRecord | IappTableRow>;

  protected abstract saveActivity(id: string, data: unknown): Promise<void>;

  protected abstract saveIapp(id: string, iappRecord: unknown, iappTableRow: unknown): Promise<void>;

  public abstract getPaginatedCachedActivityRecords(
    recordSetIdList: string[],
    page: number,
    limit: number
  ): Promise<UserRecord[]>;

  public abstract getPaginatedCachedIappRecords(
    recordSetIdList: string[],
    page: number,
    limit: number
  ): Promise<IappRecord[]>;

  protected abstract getAllCachedIds(): Promise<string[]>;

  public abstract isCached(repositoryId: string): Promise<boolean>;

  public abstract getIdList(repositoryId: string): Promise<string[]>;

  protected abstract createIappRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata>;

  protected abstract createActivityRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata>;

  abstract checkPauseOrAbort(id: string): Promise<CacheDownloadMode>;

  public async download(
    spec: CacheDownloadSpec,
    progressCallback?: (currentProgress: RecordCacheProgressCallbackParameters) => void
  ): Promise<CacheDownloadMode> {
    const args = {
      idsToCache: spec.idsToCache,
      setId: spec.setId,
      API_BASE: spec.API_BASE,
      pausedActivityIdx: spec.pausedActivityIdx,
      processedActivities: spec.processedActivities
    };

    const responseData: Record<PropertyKey, any> = {
      cachedGeoJSON: null,
      cachedCentroid: null
    };

    await this.addOrUpdateRepository({
      setId: spec.setId,
      cacheTime: new Date(),
      cachedIds: spec.idsToCache,
      recordSetType: spec.recordSetType,
      status: UserRecordCacheStatus.DOWNLOADING,
      bbox: spec.bbox
    });

    let downloadMode: CacheDownloadMode = CacheDownloadMode.DEFAULT;
    if (spec.recordSetType === RecordSetType.Activity) {
      downloadMode = await this.downloadActivity(args, progressCallback);
      if (!downloadMode) {
        Object.assign(responseData, await this.createActivityRecordsetSourceMetadata(spec.idsToCache));
      }
    } else if (spec.recordSetType === RecordSetType.IAPP) {
      downloadMode = await this.downloadIapp(args, progressCallback);
      if (!downloadMode) {
        Object.assign(responseData, await this.createIappRecordsetSourceMetadata(spec.idsToCache));
      }
    }

    if (!downloadMode) {
      await this.addOrUpdateRepository({
        setId: spec.setId,
        cacheTime: new Date(),
        cachedIds: spec.idsToCache,
        recordSetType: spec.recordSetType,
        status: UserRecordCacheStatus.CACHED,
        cachedGeoJson: responseData.cachedGeoJson,
        cachedCentroid: responseData.cachedCentroid,
        bbox: spec.bbox
      });
    } else if (downloadMode == CacheDownloadMode.ABORT) {
      this.deleteRepository(spec.setId);
    }
    return downloadMode;
  }

  /**
   * Download Records for IAPP Given a list of IDs
   * @returns { boolean } download was successful
   */
  private async downloadIapp(
    spec: RecordCacheDownloadRequestSpec,
    progressCallback?: (currentProgress: RecordCacheProgressCallbackParameters) => void
  ): Promise<CacheDownloadMode> {
    // IAPP Records use O(n*2) Requests compared to activities.
    const IAPP_CONCURRENCY_LIMIT = Math.ceil(this.CONCURRENCY_LIMIT / 2);
    const executing: Set<Promise<void>> = new Set();
    const uncachedRecords = await this.filterIds('exclusive', spec.idsToCache);
    const lengthDifference = spec.idsToCache.length - uncachedRecords.length;
    let pauseOrAbort: CacheDownloadMode = CacheDownloadMode.DEFAULT;
    let processedCaches = lengthDifference;
    const lastProgressCallback: null | number = null;
    const totalRecordsToCache = uncachedRecords.length;

    for (let i = 0; i < uncachedRecords.length && pauseOrAbort === CacheDownloadMode.DEFAULT; i++) {
      if (executing.size >= IAPP_CONCURRENCY_LIMIT) {
        await Promise.race(executing);
      }
      this.processNext(executing, async () => {
        const authorization = await getCurrentJWT();
        const [iappRecord, tableRow] = await Promise.all([
          fetch(
            `${spec.API_BASE}/api/points-of-interest/?query={"iappSiteID":"${uncachedRecords[i]}","isIAPP":true,"site_id_only":false}`,
            { headers: { authorization } }
          ).then(async (data) => await data.json()),
          fetch(`${spec.API_BASE}/api/v2/IAPP/`, {
            method: 'POST',
            headers: { authorization, 'Content-type': 'application/json' },
            body: JSON.stringify({
              filterObjects: [
                {
                  limit: 1,
                  recordSetType: RecordSetType.IAPP,
                  selectColumns: getSelectColumnsByRecordSetType(RecordSetType.IAPP),
                  tableFilters: [
                    {
                      field: 'site_id',
                      filter: uncachedRecords[i],
                      filterType: 'tableFilter',
                      operator: 'CONTAINS',
                      operator2: 'AND'
                    }
                  ]
                }
              ]
            })
          }).then(async (data) => await data.json())
        ]);
        await this.saveIapp(uncachedRecords[i].toString(), iappRecord, tableRow);
      });
      processedCaches++;
      const currentProgress = processedCaches / totalRecordsToCache;

      // trigger a callback on the first run, on the last run, every 3%
      if (
        lastProgressCallback == null ||
        currentProgress - lastProgressCallback > 0.03 ||
        processedCaches == totalRecordsToCache
      ) {
        pauseOrAbort = await this.checkPauseOrAbort(spec.setId);

        if (progressCallback) {
          progressCallback({
            setId: spec.setId,
            message: !pauseOrAbort
              ? `${processedCaches.toLocaleString()}/${(totalRecordsToCache + lengthDifference).toLocaleString()} Records`
              : `Mode: ${pauseOrAbort.toLocaleString().toUpperCase()} Caching`,
            downloadMode: pauseOrAbort,
            pausedActivityIdx: pauseOrAbort !== CacheDownloadMode.PAUSE ? -1 : i + 1,
            normalizedProgress: processedCaches / (totalRecordsToCache + lengthDifference),
            totalActivities: totalRecordsToCache,
            processedActivities: processedCaches
          });
        }
      }
    }
    await Promise.all(executing);
    return pauseOrAbort;
  }

  /**
   * Download Records for Activities Given a list of IDs
   * @returns { boolean } download was successful
   */
  private async downloadActivity(
    spec: RecordCacheDownloadRequestSpec,
    progressCallback?: (currentProgress: RecordCacheProgressCallbackParameters) => void
  ): Promise<CacheDownloadMode> {
    const executing: Set<Promise<void>> = new Set();
    const uncachedRecords = await this.filterIds('exclusive', spec.idsToCache);
    const lengthDifference = spec.idsToCache.length - uncachedRecords.length;
    let pauseOrAbort: CacheDownloadMode = CacheDownloadMode.DEFAULT;
    let processedCaches = lengthDifference;
    const lastProgressCallback: null | number = null;
    const totalRecordsToCache = uncachedRecords.length;

    for (let i = 0; i < uncachedRecords.length && pauseOrAbort === CacheDownloadMode.DEFAULT; i++) {
      if (executing.size >= this.CONCURRENCY_LIMIT) {
        await Promise.race(executing);
      }

      this.processNext(executing, async () => {
        const rez = await fetch(`${spec.API_BASE}/api/activity/${uncachedRecords[i]}`, {
          headers: { Authorization: await getCurrentJWT() }
        });
        await this.saveActivity(uncachedRecords[i], await rez.json());
      });
      processedCaches++;
      const currentProgress = processedCaches / totalRecordsToCache;

      // trigger a callback on the first run, on the last run, every 3%
      if (
        lastProgressCallback == null ||
        currentProgress - lastProgressCallback > 0.03 ||
        processedCaches == totalRecordsToCache
      ) {
        pauseOrAbort = await this.checkPauseOrAbort(spec.setId);

        const normalizedProgress = processedCaches / (totalRecordsToCache + lengthDifference);
        const progressLabel =
          normalizedProgress * 100 < 1
            ? `${processedCaches.toLocaleString()}/${(totalRecordsToCache + lengthDifference).toLocaleString()} Records`
            : `${Math.round(normalizedProgress * 100)}% completed`;

        if (progressCallback) {
          progressCallback({
            setId: spec.setId,
            message: !pauseOrAbort ? progressLabel : `Mode: ${pauseOrAbort.toLocaleString().toUpperCase()} Caching`,
            downloadMode: pauseOrAbort,
            pausedActivityIdx: pauseOrAbort !== CacheDownloadMode.PAUSE ? -1 : i + 1,
            normalizedProgress: normalizedProgress,
            totalActivities: totalRecordsToCache,
            processedActivities: processedCaches
          });
        }
      }
    }
    await Promise.all(executing);
    return pauseOrAbort;
  }

  /**
   * @desc compare list of Ids against currently stored keys
   * @param filterMode if response should contain list of supplied Ids
   * @param idsToCache Ids to be measured against the database
   * @returns List of IDs [not] currently contained stored the local database
   */
  protected async filterIds(filterMode: 'inclusive' | 'exclusive', idsToCache: Array<string>) {
    const ids: Record<PropertyKey, number> = {};
    (await this.getAllCachedIds()).forEach((id) => {
      ids[id] ??= 0;
      ids[id]++;
    });

    if (filterMode === 'inclusive') {
      return idsToCache.filter((id) => !!ids[id]);
    }
    return idsToCache.filter((id) => !ids[id]);
  }

  public async stopDownload(repositoryId: string): Promise<void> {
    const repositories = await this.listRepositories();
    const foundIndex = repositories.findIndex((repo) => repo.setId === repositoryId);
    if (foundIndex === -1) throw Error(`Repository ${repositoryId} wasn't found`);

    if (
      repositories[foundIndex].status === UserRecordCacheStatus.DOWNLOADING ||
      repositories[foundIndex].status === UserRecordCacheStatus.PAUSED
    ) {
      await this.setRepositoryStatus(repositoryId, UserRecordCacheStatus.DELETING);
    } else if (repositories[foundIndex].status === UserRecordCacheStatus.CACHED) {
      await this.deleteRepository(repositoryId);
    }
  }

  public async pauseDownload(repositoryId: string): Promise<void> {
    const repositories = await this.listRepositories();
    const foundIndex = repositories.findIndex((repo) => repo.setId === repositoryId);
    if (foundIndex === -1) throw Error(`Repository ${repositoryId} wasn't found`);

    if (repositories[foundIndex].status === UserRecordCacheStatus.DOWNLOADING) {
      await this.setRepositoryStatus(repositoryId, UserRecordCacheStatus.PAUSED);
    }
  }
}

export { RecordCacheService };
