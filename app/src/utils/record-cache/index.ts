import { Feature } from '@turf/helpers';
import UserRecord from 'interfaces/UserRecord';
import { getCurrentJWT } from 'state/sagas/auth/auth';

export interface RecordCacheDownloadRequestSpec {
  setId: string;
  API_BASE: string;
  idsToCache: string[];
}

export interface RecordCacheAddSpec {
  setId: string;
  idsToCache: string[];
}

/**
 * @desc Map source metadata
 * @property {string} label short_id to display under points
 * @property {Feature} feature Shape data to display.
 */
export interface RecordSetCachedShape {
  label: string;
  feature: Feature;
}

/**
 * @desc Cached Metadata for Recordsets
 * @property { string } setID Recordset ID
 * @property { string[] } cachedIds collection of activity_ids in Recordset
 * @property { RecordSetCachedShape[] } cachedGeoJSON  Cached Features for low map layers
 * @property { RecordSetCachedShape[] } cachedCentroid Cached Points for high map layers
 */
export interface RecordSetCacheMetadata {
  setId: string;
  cachedIds?: string[];
  cachedGeoJson: RecordSetCachedShape[];
  cachedCentroid: RecordSetCachedShape[];
}

export interface RecordSetSourceMetadata {
  cachedGeoJson: RecordSetCachedShape[];
  cachedCentroid: RecordSetCachedShape[];
}

export interface RecordCacheProgressCallbackParameters {
  setId: string;
  message: string;
  aborted: boolean;
  normalizedProgress: number;
  totalActivities: number;
  processedActivities: number;
}

abstract class RecordCacheService {
  protected constructor() {}

  static async getInstance(): Promise<RecordCacheService> {
    throw new Error('unimplemented in abstract base class');
  }

  abstract saveActivity(id: string, data: unknown): Promise<void>;

  abstract loadActivity(id: string): Promise<unknown>;

  abstract addCachedSet(spec: RecordCacheAddSpec): Promise<void>;

  abstract listCachedSets(): Promise<RecordSetCacheMetadata[]>;

  abstract deleteCachedSet(id: string): Promise<void>;

  abstract fetchPaginatedCachedRecords(recordSetIdList: string[], page: number, limit: number): Promise<UserRecord[]>;

  abstract loadRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata>;

  async download(
    spec: RecordCacheDownloadRequestSpec,
    progressCallback?: (currentProgress: RecordCacheProgressCallbackParameters) => void
  ): Promise<void> {
    for (const id of spec.idsToCache) {
      const rez = await fetch(`${spec.API_BASE}/api/activity/${id}`, {
        headers: {
          Authorization: await getCurrentJWT()
        }
      });
      await this.saveActivity(id, await rez.json());
    }
  }
}

export { RecordCacheService };
