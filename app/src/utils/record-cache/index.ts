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

export interface RecordSetCacheMetadata {
  setId: string;
  cachedIds?: string[];
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
