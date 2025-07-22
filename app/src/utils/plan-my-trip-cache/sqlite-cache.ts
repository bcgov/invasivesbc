import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import {
  PlanMyTripCacheDownloadSpec,
  PlanMyTripCacheProgressCallbackParameters,
  PlanMyTripCacheService,
  PlanMyTripCacheStatus,
  PlanMyTripRepositoryMetadata
} from '.';
import { CacheDownloadMode } from 'utils/record-cache';

class SQLitePlanMyTripCacheService extends PlanMyTripCacheService {
  private readonly CACHE_DB_NAME = 'plan_my_trip.db';
  private static _instance: SQLitePlanMyTripCacheService;

  private cacheDB: SQLiteDBConnection | null = null;

  protected constructor() {
    super();
  }

  protected addOrUpdateRepository(spec: PlanMyTripRepositoryMetadata): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public deleteRepository(repositoryId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public getRepository(repositoryId: string): Promise<PlanMyTripRepositoryMetadata | null>;
  public getRepository(
    repositoryId: string,
    fields: (keyof PlanMyTripRepositoryMetadata)[]
  ): Promise<PlanMyTripRepositoryMetadata | Partial<PlanMyTripRepositoryMetadata> | null>;
  public getRepository(
    repositoryId: unknown,
    fields?: unknown
  ):
    | Promise<PlanMyTripRepositoryMetadata | null>
    | Promise<PlanMyTripRepositoryMetadata | Partial<PlanMyTripRepositoryMetadata> | null> {
    throw new Error('Method not implemented.');
  }
  public listRepositories(): Promise<PlanMyTripRepositoryMetadata[]>;
  public listRepositories(
    fields: (keyof PlanMyTripRepositoryMetadata)[]
  ): Promise<Partial<PlanMyTripRepositoryMetadata>[]>;
  public listRepositories(
    fields?: unknown
  ): Promise<PlanMyTripRepositoryMetadata[]> | Promise<Partial<PlanMyTripRepositoryMetadata>[]> {
    throw new Error('Method not implemented.');
  }
  public setRepositoryStatus(repositoryId: string, status: PlanMyTripCacheStatus): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public download(
    spec: PlanMyTripCacheDownloadSpec,
    progressCallback?: ((currentProgress: PlanMyTripCacheProgressCallbackParameters) => void) | undefined
  ): Promise<CacheDownloadMode | void> {
    throw new Error('Method not implemented.');
  }
}

export default SQLitePlanMyTripCacheService;
