import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import UserRecord from 'interfaces/UserRecord';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { GeoJSONSourceSpecification } from 'maplibre-gl';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { getSelectColumnsByRecordSetType } from 'state/sagas/map/dataAccess';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';

export enum IappRecordMode {
  Record = 'record',
  Row = 'row'
}
export interface RecordCacheDownloadRequestSpec {
  setId: string;
  API_BASE: string;
  idsToCache: string[];
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
export interface RecordCacheAddSpec {
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
}

abstract class RecordCacheService {
  private readonly RECORDS_BETWEEN_PROGRESS_UPDATES = 25;
  protected constructor() {}

  static async getInstance(): Promise<RecordCacheService> {
    throw new Error('unimplemented in abstract base class');
  }

  abstract saveActivity(id: string, data: unknown): Promise<void>;

  abstract saveIapp(id: string, iappRecord: unknown, iappTableRow: unknown): Promise<void>;

  abstract deleteCachedRecordsFromIds(idsToDelete: string[], recordSetType: RecordSetType): Promise<void>;

  abstract loadActivity(id: string): Promise<unknown>;

  abstract loadIapp(id: string, type: IappRecordMode): Promise<IappRecord | IappTableRow>;

  abstract fetchPaginatedCachedIappRecords(
    recordSetIdList: string[],
    page: number,
    limit: number
  ): Promise<IappRecord[]>;

  abstract fetchPaginatedCachedRecords(recordSetIdList: string[], page: number, limit: number): Promise<UserRecord[]>;

  abstract addOrUpdateRepository(spec: RecordCacheAddSpec): Promise<void>;

  abstract deleteRepository(repositoryId: string): Promise<void>;

  abstract fetchRepository(repositoryId: string): Promise<RecordCacheAddSpec>;

  abstract isCached(repositoryId: string): Promise<boolean>;

  abstract fetchIdList(repositoryId: string): Promise<string[]>;

  abstract listRepositories(): Promise<RecordCacheAddSpec[]>;

  abstract loadIappRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata>;

  abstract loadRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata>;

  abstract setRepositoryStatus(repositoryId: string, status: UserRecordCacheStatus): Promise<void>;

  abstract checkForAbort(id: string): Promise<boolean>;

  async downloadCache(spec: CacheDownloadSpec): Promise<boolean> {
    const args = {
      idsToCache: spec.idsToCache,
      setId: spec.setId,
      API_BASE: spec.API_BASE
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
    if (spec.recordSetType === RecordSetType.Activity && (await this.downloadActivity(args))) {
      Object.assign(responseData, await this.loadRecordsetSourceMetadata(spec.idsToCache));
    } else if (spec.recordSetType === RecordSetType.IAPP && (await this.downloadIapp(args))) {
      Object.assign(responseData, await this.loadIappRecordsetSourceMetadata(spec.idsToCache));
    } else {
      downloadCompleted = false;
      this.deleteRepository(spec.setId);
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
    return downloadCompleted;
  }
  /**
   * Download Records for IAPP Given a list of IDs
   * @returns { boolean } download was successful
   */
  async downloadIapp(
    spec: RecordCacheDownloadRequestSpec,
    progressCallback?: (currentProgress: RecordCacheProgressCallbackParameters) => void
  ): Promise<boolean> {
    let abort = false;
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
      if (i % this.RECORDS_BETWEEN_PROGRESS_UPDATES === 0 || i === spec.idsToCache.length - 1) {
        abort = await this.checkForAbort(spec.setId);
        /*
          ProgressCallback Logic
        */
      }
    }
    return !abort;
  }

  /**
   * Download Records for Activities Given a list of IDs
   * @returns { boolean } download was successful
   */
  async downloadActivity(
    spec: RecordCacheDownloadRequestSpec,
    progressCallback?: (currentProgress: RecordCacheProgressCallbackParameters) => void
  ): Promise<boolean> {
    let abort = false;
    for (let i = 0; i < spec.idsToCache.length && !abort; i++) {
      const rez = await fetch(`${spec.API_BASE}/api/activity/${spec.idsToCache[i]}`, {
        headers: {
          Authorization: await getCurrentJWT()
        }
      });
      await this.saveActivity(spec.idsToCache[i], await rez.json());
      if (i % this.RECORDS_BETWEEN_PROGRESS_UPDATES === 0 || i === spec.idsToCache.length - 1) {
        abort = await this.checkForAbort(spec.setId);
        /*
          ProgressCallback Logic
        */
      }
    }
    return !abort;
  }
  async stopDownload(repositoryId: string): Promise<void> {
    const repositories = await this.listRepositories();
    const foundIndex = repositories.findIndex((repo) => repo.setId === repositoryId);
    if (foundIndex === -1) throw Error(`Repository ${repositoryId} wasn't found`);

    if (repositories[foundIndex].status === UserRecordCacheStatus.DOWNLOADING) {
      await this.setRepositoryStatus(repositoryId, UserRecordCacheStatus.DELETING);
    } else if (repositories[foundIndex].status === UserRecordCacheStatus.CACHED) {
      await this.deleteRepository(repositoryId);
    }
  }
}

export { RecordCacheService };
