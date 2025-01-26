import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import UserRecord from 'interfaces/UserRecord';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { GeoJSONSourceSpecification } from 'maplibre-gl';
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
  aborted: boolean;
  pausedActivityIdx: number;
  downloadMode: CacheDownloadMode;
  normalizedProgress: number;
  totalActivities: number; // is this needed?
  processedActivities: number; // is this needed?
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
  private readonly RECORDS_BETWEEN_PROGRESS_UPDATES = 10;

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

  public abstract isCached(repositoryId: string): Promise<boolean>;

  public abstract getIdList(repositoryId: string): Promise<string[]>;

  protected abstract createIappRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata>;

  protected abstract createActivityRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata>;

  abstract checkForAbort(id: string): Promise<boolean>;

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

    let responseData: Record<PropertyKey, any> = {
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

    let downloadCompleted = true;
    let downloadmode: CacheDownloadMode = CacheDownloadMode.DEFAULT;
    if (
      spec.recordSetType === RecordSetType.Activity &&
      !(downloadmode = await this.downloadActivity(args, progressCallback))
    ) {
      Object.assign(responseData, await this.createActivityRecordsetSourceMetadata(spec.idsToCache));
    } else if (spec.recordSetType === RecordSetType.IAPP && (await this.downloadIapp(args, progressCallback))) {
      Object.assign(responseData, await this.createIappRecordsetSourceMetadata(spec.idsToCache));
    } else {
      downloadCompleted = false;
      if (downloadmode == CacheDownloadMode.ABORT) {
        this.deleteRepository(spec.setId);
      }
    }

    if (downloadCompleted) {
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
    }
    return downloadmode;
  }
  /**
   * Download Records for IAPP Given a list of IDs
   * @returns { boolean } download was successful
   */
  private async downloadIapp(
    spec: RecordCacheDownloadRequestSpec,
    progressCallback?: (currentProgress: RecordCacheProgressCallbackParameters) => void
  ): Promise<boolean> {
    let abort = false;
    let processedCaches = 0;
    let totalRecordsToCache = spec.idsToCache.length;
    for (let i = 0; i < spec.idsToCache.length && !abort; i++) {
      const authorization = await getCurrentJWT();
      const [iappRecord, tableRow] = await Promise.all([
        fetch(
          `${spec.API_BASE}/api/points-of-interest/?query={"iappSiteID":"${spec.idsToCache[i]}","isIAPP":true,"site_id_only":false}`,
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
                    filter: spec.idsToCache[i],
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
      await this.saveIapp(spec.idsToCache[i].toString(), iappRecord, tableRow);
      processedCaches++;
      if (i % this.RECORDS_BETWEEN_PROGRESS_UPDATES === 0 || i === spec.idsToCache.length - 1) {
        abort = await this.checkForAbort(spec.setId);
        /*
          ProgressCallback Logic
        */
        console.log('IAPP', this.RECORDS_BETWEEN_PROGRESS_UPDATES, i, spec.idsToCache.length);
        if (progressCallback) {
          progressCallback({
            setId: spec.setId,
            message: '',
            aborted: abort,
            downloadMode: CacheDownloadMode.DEFAULT,
            pausedActivityIdx: -1,
            normalizedProgress: processedCaches / totalRecordsToCache,
            totalActivities: totalRecordsToCache,
            processedActivities: processedCaches
          });
        }
      }
    }
    return !abort;
  }

  /**
   * Download Records for Activities Given a list of IDs
   * @returns { boolean } download was successful
   */
  private async downloadActivity(
    spec: RecordCacheDownloadRequestSpec,
    progressCallback?: (currentProgress: RecordCacheProgressCallbackParameters) => void
  ): Promise<CacheDownloadMode> {
    let abort = false;
    let pauseOrAbort: CacheDownloadMode = CacheDownloadMode.DEFAULT;
    let processedCaches = spec.processedActivities == -1 ? 0 : spec.processedActivities; // 0 or the value in spec
    let lastProgressCallback: null | number = null;
    let totalRecordsToCache = spec.idsToCache.length;
    let startIdx = spec.pausedActivityIdx == -1 ? 0 : spec.pausedActivityIdx;
    for (let i = startIdx; i < spec.idsToCache.length && pauseOrAbort === CacheDownloadMode.DEFAULT; i++) {
      const rez = await fetch(`${spec.API_BASE}/api/activity/${spec.idsToCache[i]}`, {
        headers: {
          Authorization: await getCurrentJWT()
        }
      });
      await this.saveActivity(spec.idsToCache[i], await rez.json());
      processedCaches++;
      const currentProgress = processedCaches / totalRecordsToCache;

      if (
        lastProgressCallback == null ||
        currentProgress - lastProgressCallback > 0.01 ||
        processedCaches == totalRecordsToCache
      ) {
        pauseOrAbort = await this.checkPauseOrAbort(spec.setId);

        //if (isabortOrPaused == 'pause'){
        // update database with pause idx
        // await this.updateCachedRecordMetadata with pause idx
        //}

        if (progressCallback) {
          progressCallback({
            setId: spec.setId,
            message: '',
            aborted: abort,
            downloadMode: pauseOrAbort,
            pausedActivityIdx: pauseOrAbort !== CacheDownloadMode.PAUSE ? -1 : i + 1,
            normalizedProgress: processedCaches / totalRecordsToCache,
            totalActivities: totalRecordsToCache,
            processedActivities: processedCaches
          });
        }
      }
    }

    return pauseOrAbort;
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
      await this.setRepositoryStatus(repositoryId, UserRecordCacheStatus.PAUSED); // paused from what record?
    }
  }
}

export { RecordCacheService };
