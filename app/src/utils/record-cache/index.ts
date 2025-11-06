import { GeoJSONSourceSpecification } from 'maplibre-gl';
import { Feature } from 'geojson';
import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import UserRecord from 'interfaces/UserRecord';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import BaseCacheService from 'utils/base-classes/BaseCacheService';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import FilterObjects from 'interfaces/FilterObjects';
import { EFilterType } from 'state/actions/userSettings/RecordSet';

const config = await import('state/configuration/runtime-config');
const API_BASE = config.runtimeConfig.API_BASE;

enum IappRecordMode {
  Record = 'record',
  Row = 'row'
}

enum CacheDownloadMode {
  DEFAULT = '',
  PAUSE = 'pause',
  ABORT = 'abort'
}

interface RecordCacheDownloadRequestSpec {
  setId: string;
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
 *
 * cached_ids VS ids_to_filter
 *
 *  cached_ids:
 *    Cached IDs are all the IDS applied to a recordset during time of caching
 *    Their focus is maintenance of the client database by removing duplicates / not losing cached records between recordsets
 *    Cached ids are created based on the results of a recordset. If two recordsets have the same id, it won't get deleted.
 *  ids_to_filter:
 *    Binding constraint used when creating a cached recordset. Lets us set specific records to a recordset with(out) the use of filters.
 *     - Locks in Server side shape boundaries
 *     - Lets us create a recordset using a Sitelist
 *     - In majority of use cases, ids_to_filter is undefined.
 */
interface RepositoryMetadata {
  bbox?: RepositoryBoundingBoxSpec;
  cache_time: Date;
  cached_centroid?: GeoJSONSourceSpecification;
  cached_geojson?: GeoJSONSourceSpecification;
  cached_ids: string[];
  filter_objects: FilterObjects;
  ids_to_filter?: string[];
  record_set_type: RecordSetType;
  set_id: string;
  set_name?: string;
  status: UserRecordCacheStatus;
}

interface RecordSetSourceMetadata {
  cachedGeoJson: GeoJSONSourceSpecification;
  cachedCentroid?: GeoJSONSourceSpecification;
}

interface RecordCacheProgressCallbackParameters {
  setId: string;
  message: string;
  pausedActivityIdx: number;
  downloadMode: CacheDownloadMode;
  normalizedProgress: number;
  totalActivities: number;
  processedActivities: number;
}

interface CacheDownloadSpec {
  bbox: RepositoryBoundingBoxSpec;
  idsToCache: string[];
  setId: string;
  setName: string;
  recordSetType: RecordSetType;
  ids_to_filter?: string[];
  recordSetCacheStatus: UserRecordCacheStatus;
  pausedActivityIdx: number;
  processedActivities: number;
  filterObjects: FilterObjects;
}

interface IQueryParams extends FilterObjects {
  sort?: {
    order?: 'ASC' | 'DESC';
    by: string;
  };
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

  public abstract query(params: IQueryParams): Promise<UserRecord[] | IappRecord[]>;

  protected abstract addOrUpdateRepository(spec: RepositoryMetadata): Promise<void>;

  protected abstract deleteCachedRecordsFromIds(idsToDelete: string[], recordSetType: RecordSetType): Promise<void>;

  public abstract getRecordIdsOverlappingFeature(geom: Feature): Promise<string[]>;

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
      pausedActivityIdx: spec.pausedActivityIdx,
      processedActivities: spec.processedActivities,
      filterObjects: spec.filterObjects
    };

    const responseData: Record<PropertyKey, any> = {
      cachedGeoJSON: null,
      cachedCentroid: null
    };
    const containsServerFilterShape = spec.filterObjects?.tableFilters.some(
      (shape) => shape.filterType === EFilterType.Uploaded
    );
    const filtersSubsetOfData = spec.filterObjects.tableFilters.some(
      (f) => f.filterType === EFilterType.MostRecentObservation
    );

    if (containsServerFilterShape || filtersSubsetOfData) {
      spec.ids_to_filter ??= spec.idsToCache;
    }
    await this.addOrUpdateRepository({
      set_id: spec.setId,
      cache_time: new Date(),
      cached_ids: spec.idsToCache,
      record_set_type: spec.recordSetType,
      ids_to_filter: spec?.ids_to_filter,
      status: UserRecordCacheStatus.DOWNLOADING,
      bbox: spec.bbox,
      filter_objects: spec.filterObjects
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
        set_id: spec.setId,
        cache_time: new Date(),
        set_name: spec.setName,
        cached_ids: spec.idsToCache,
        record_set_type: spec.recordSetType,
        status: UserRecordCacheStatus.CACHED,
        cached_geojson: responseData.cachedGeoJson,
        cached_centroid: responseData.cachedCentroid,
        bbox: spec.bbox,
        filter_objects: spec.filterObjects
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
        const url = `${API_BASE}/api/v2/iapp/batch-request?idList=${JSON.stringify(ids)}`;
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
        const url = `${API_BASE}/api/v2/activities/batch-request?idList=${JSON.stringify(ids)}`;
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
    try {
      const repo = await this.getRepository(repositoryId, ['status']);
      if (repo !== null) {
        if (
          [UserRecordCacheStatus.DOWNLOADING, UserRecordCacheStatus.PAUSED, UserRecordCacheStatus.QUEUED].includes(
            repo.status!
          )
        ) {
          await this.setRepositoryStatus(repositoryId, UserRecordCacheStatus.DELETING);
        } else if (repo.status === UserRecordCacheStatus.CACHED) {
          await this.deleteRepository(repositoryId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  public async pauseDownload(repositoryId: string): Promise<void> {
    const repositories = await this.listRepositories(['set_id', 'status']);
    const foundIndex = repositories.findIndex((repo) => repo?.set_id === repositoryId);
    if (foundIndex === -1) throw Error(`Repository ${repositoryId} wasn't found`);

    if (repositories[foundIndex]?.status === UserRecordCacheStatus.DOWNLOADING) {
      await this.setRepositoryStatus(repositoryId, UserRecordCacheStatus.PAUSED);
    }
  }

  /**
   * @desc Get list of IDs that have had updates or been created since last update.
   * @param filterObjects Filters used at time of Cache
   * @param cacheTime Time of last Cache
   * @returns { string[] } new Records or IDs updated since provided date.
   */
  private async getListOfNewIds(filterObjects: FilterObjects, cacheTime: Date): Promise<string[]> {
    const filterObjs = structuredClone(filterObjects);
    filterObjs.tableFilters.forEach((filter, i) => {
      if (filter.filterType === EFilterType.Uploaded) {
        delete filterObjs?.tableFilters?.[i]?.geojson;
      }
    });
    const rez = await fetch(
      `${API_BASE}/api/v2/activities/cache-update-ids?filterObjects=${JSON.stringify([filterObjs])}&lastUpdated=${cacheTime.toISOString()}`,
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
      this.listRepositories(['record_set_type', 'status', 'filter_objects', 'cached_ids', 'set_id'])
    ]);
    const updatedRecords: string[] = []; // don't re-download records that crossover other recordsets
    for (const r of repositories) {
      if (r?.record_set_type === RecordSetType.Activity && r.status === UserRecordCacheStatus.CACHED) {
        const idList = (await this.getListOfNewIds(r.filter_objects!, newestRecordDate)).filter(
          (id) => !updatedRecords.includes(id)
        );
        const newIds = idList.filter((id) => !r.cached_ids?.includes(id)); // Filter out IDs not already in cache to add later
        for (let i = 0; i < idList.length; i += this.BATCH_AMOUNT) {
          const ids = idList.slice(i, i + this.BATCH_AMOUNT);
          const url = `${API_BASE}/api/v2/activities/batch-request?idList=${JSON.stringify(ids)}`;
          const rez = await fetch(url, {
            headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
          });
          const newRecords = (await rez.json()) ?? {};
          await this.saveActivity(newRecords);
        }
        const updatedShapes = await this.createActivityRecordsetSourceMetadata([...r.cached_ids!, ...newIds]);
        await this.addOrUpdateRepository({
          ...r,
          ...updatedShapes,
          cached_ids: [...r.cached_ids!, ...newIds],
          cache_time: currentTime
        } as RepositoryMetadata);
        updatedRecords.push(...newIds);
      }
    }
    return updatedRecords.length > 0;
  }
}

export { RecordCacheService, CacheDownloadMode, IappRecordMode };
export type {
  RecordCacheDownloadRequestSpec,
  IQueryParams,
  CacheDownloadSpec,
  RecordCacheProgressCallbackParameters,
  RecordSetSourceMetadata,
  RepositoryMetadata
};
