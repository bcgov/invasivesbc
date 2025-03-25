import { GeoJSONSourceSpecification } from 'maplibre-gl';
import booleanIntersects from '@turf/boolean-intersects';
import { Feature } from '@turf/helpers';
import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import UserRecord from 'interfaces/UserRecord';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import BaseCacheService from 'utils/base-classes/BaseCacheService';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import bboxToPolygon from 'utils/bboxToPolygon';
import FilterObjects from 'interfaces/FilterObjects';

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
  setName?: string;
  cacheTime: Date;
  cachedIds: string[];
  recordSetType: RecordSetType;
  cachedGeoJson?: GeoJSONSourceSpecification;
  cachedCentroid?: GeoJSONSourceSpecification;
  bbox?: RepositoryBoundingBoxSpec;
  status: UserRecordCacheStatus;
  filterObjects: FilterObjects;
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
  setName: string;
  API_BASE: string;
  recordSetType: RecordSetType;
  recordSetCacheStatus: UserRecordCacheStatus;
  pausedActivityIdx: number;
  processedActivities: number;
  filterObjects: FilterObjects;
}

abstract class RecordCacheService extends BaseCacheService<
  RepositoryMetadata,
  CacheDownloadSpec,
  RecordCacheProgressCallbackParameters,
  UserRecordCacheStatus
> {
  private readonly CONCURRENCY_LIMIT = 3;
  private readonly BATCH_AMOUNT = 20;
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

  protected abstract saveActivity(data: unknown): Promise<void>;

  protected abstract dateOfMostRecentRecord();

  protected abstract saveIapp(data: Record<PropertyKey, IappRecord | IappTableRow>): Promise<void>;

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
      processedActivities: spec.processedActivities,
      filterObjects: spec.filterObjects
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
      bbox: spec.bbox,
      filterObjects: spec.filterObjects
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
        setName: spec.setName,
        cachedIds: spec.idsToCache,
        recordSetType: spec.recordSetType,
        status: UserRecordCacheStatus.CACHED,
        cachedGeoJson: responseData.cachedGeoJson,
        cachedCentroid: responseData.cachedCentroid,
        bbox: spec.bbox,
        filterObjects: spec.filterObjects
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
    const executing: Set<Promise<void>> = new Set();
    const uncachedRecords = await this.filterIds('exclusive', spec.idsToCache);
    let pauseOrAbort: CacheDownloadMode = CacheDownloadMode.DEFAULT;
    let processedCaches = spec.idsToCache.length - uncachedRecords.length;
    let lastProgressCallback: null | number = null;
    const totalRecordsToCache = spec.idsToCache.length;

    for (let i = 0; i < uncachedRecords.length && pauseOrAbort === CacheDownloadMode.DEFAULT; i += this.BATCH_AMOUNT) {
      if (executing.size >= this.CONCURRENCY_LIMIT) {
        await Promise.race(executing);
      }

      const ids = uncachedRecords.slice(i, i + this.BATCH_AMOUNT);

      this.processNext(executing, async () => {
        const url = `${spec.API_BASE}/api/v2/iapp/batch-request?idList=${JSON.stringify(ids)}`;
        const rez = await fetch(url, {
          headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
        });
        if (rez.ok) {
          const response = await rez.json();
          await this.saveIapp(response);
        }
      });

      processedCaches += ids.length;
      const currentProgress = processedCaches / totalRecordsToCache;

      // trigger a callback on the first run, on the last run, every 3%
      if (
        lastProgressCallback == null ||
        processedCaches - lastProgressCallback > 400 ||
        processedCaches == totalRecordsToCache
      ) {
        pauseOrAbort = await this.checkPauseOrAbort(spec.setId);
        lastProgressCallback = processedCaches;
        if (progressCallback) {
          progressCallback({
            setId: spec.setId,
            message: !pauseOrAbort
              ? `${processedCaches.toLocaleString()}/${totalRecordsToCache.toLocaleString()} Records`
              : `Mode: ${pauseOrAbort.toLocaleString().toUpperCase()} Caching`,
            downloadMode: pauseOrAbort,
            pausedActivityIdx: pauseOrAbort !== CacheDownloadMode.PAUSE ? -1 : i + 1,
            normalizedProgress: currentProgress,
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
    let pauseOrAbort: CacheDownloadMode = CacheDownloadMode.DEFAULT;
    let processedCaches = spec.idsToCache.length - uncachedRecords.length;
    let lastProgressCallback: null | number = null;
    const totalRecordsToCache = spec.idsToCache.length;

    for (let i = 0; i < uncachedRecords.length && pauseOrAbort === CacheDownloadMode.DEFAULT; i += this.BATCH_AMOUNT) {
      if (executing.size >= this.CONCURRENCY_LIMIT) {
        await Promise.race(executing);
      }
      const ids = uncachedRecords.slice(i, i + this.BATCH_AMOUNT);

      this.processNext(executing, async () => {
        const url = `${spec.API_BASE}/api/v2/activities/batch-request?idList=${JSON.stringify(ids)}`;
        const rez = await fetch(url, {
          headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
        });
        if (rez.ok) {
          const response = await rez.json();
          await this.saveActivity(response);
        }
      });

      processedCaches += ids.length;
      const currentProgress = processedCaches / totalRecordsToCache;

      // trigger a callback on the first run, on the last run, every 3%
      if (
        lastProgressCallback == null ||
        processedCaches - lastProgressCallback > 450 ||
        processedCaches === totalRecordsToCache
      ) {
        pauseOrAbort = await this.checkPauseOrAbort(spec.setId);
        lastProgressCallback = processedCaches;
        const normalizedProgress = currentProgress;
        const progressLabel = `${processedCaches.toLocaleString()}/${totalRecordsToCache.toLocaleString()} Records`;

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
      [UserRecordCacheStatus.DOWNLOADING, UserRecordCacheStatus.PAUSED, UserRecordCacheStatus.QUEUED].includes(
        repositories[foundIndex].status
      )
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

  /**
   * @desc Get repositories filtered to a geographic area
   * @param geom Area of target
   * @returns Repositories overlapping with target area
   */
  public async getOverlappingRepositories(geom: Feature): Promise<RepositoryMetadata[]> {
    return (await this.listRepositories()).filter(
      (r) =>
        r.status === UserRecordCacheStatus.CACHED && r.cachedGeoJson && booleanIntersects(bboxToPolygon(r.bbox!), geom)
    );
  }

  /**
   * @desc Returns list of IDs that overlap with a GeoJSON Object
   * @param {Feature} geom GeoJSON Object to find overlaps
   * @returns { string[] } Overlapping record Ids
   */
  public async getRecordIdsOverlappingFeature(geom: Feature): Promise<string[]> {
    const repos = await this.getOverlappingRepositories(geom);
    const featureMap: Record<PropertyKey, Feature> = {};
    const overlappingRecords: string[] = [];

    // Multiple Repos could contain the same record, so iterate them into an object to filter the duplicates
    repos.forEach((repo) => {
      (repo.cachedGeoJson?.data as any).features.forEach(
        (feature: Feature, i: number) => (featureMap[feature?.properties?.name + i] ??= feature)
      );
    });

    Object.values(featureMap).forEach((feature) => {
      if (booleanIntersects(geom, feature)) {
        overlappingRecords.push(feature?.properties?.description);
      }
    });

    return overlappingRecords;
  }
  /**
   * @desc Get list of IDs that have had updates or been created since last update.
   * @param filterObjects Filters used at time of Cache
   * @param cacheTime Time of last Cache
   * @returns { string[] } new Records or IDs updated since provided date.
   */
  private async getListOfNewIds(filterObjects: FilterObjects, cacheTime: Date): Promise<string[]> {
    const rez = await fetch(
      `${CONFIGURATION_API_BASE}/api/v2/activities/cache-update-ids?filterObjects=${JSON.stringify([filterObjects])}&lastUpdated=${cacheTime.toISOString()}`,
      { headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' } }
    );
    return (await rez.json()) ?? [];
  }

  /**
   * @desc Iterate Record repositories and update/download any new or changed records.
   * @returns {boolean} New records were added / updated
   */
  public async updateActivityCaches(): Promise<boolean> {
    const currentTime = new Date();
    const [newestRecordDate, repositories] = await Promise.all([
      this.dateOfMostRecentRecord(),
      this.listRepositories()
    ]);
    const updatedRecords: string[] = []; // don't re-download records that crossover other recordsets
    for (const r of repositories) {
      if (r.recordSetType === RecordSetType.Activity && r.status === UserRecordCacheStatus.CACHED) {
        const idList = (await this.getListOfNewIds(r.filterObjects, newestRecordDate)).filter(
          (id) => !updatedRecords.includes(id)
        );
        const newIds = idList.filter((id) => !r.cachedIds.includes(id)); // Filter out IDs not already in cache to add later
        for (let i = 0; i < idList.length; i += this.BATCH_AMOUNT) {
          const ids = idList.slice(i, i + this.BATCH_AMOUNT);
          const url = `${CONFIGURATION_API_BASE}/api/v2/activities/batch-request?idList=${JSON.stringify(ids)}`;
          const rez = await fetch(url, {
            headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
          });
          const newRecords = (await rez.json()) ?? {};
          await this.saveActivity(newRecords);
        }
        const updatedShapes = await this.createActivityRecordsetSourceMetadata([...r.cachedIds, ...newIds]);
        this.addOrUpdateRepository({
          ...r,
          ...updatedShapes,
          cachedIds: [...r.cachedIds, ...newIds],
          cacheTime: currentTime
        });
        updatedRecords.push(...newIds);
      }
    }
    return updatedRecords.length > 0;
  }
}

export { RecordCacheService };
