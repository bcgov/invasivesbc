import localForage from 'localforage';
import { PlanMyTripCacheService } from '.';
import type { IPlanMyTripCacheStatus, IPlanMyTripCacheStatuses, IPlanMyTripRepositoryMetadata } from '.';

class LocalForagePlanMyTripCacheService extends PlanMyTripCacheService {
  public syncStatus(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  public setRepositoryStatus(_id: string, _status: IPlanMyTripCacheStatus): Promise<void> {
    throw new Error('setRepositoryStatus not implemented for PlanMyTripCacheService.');
  }

  private static _instance: LocalForagePlanMyTripCacheService;
  private store: LocalForage | null = null;

  static async getInstance(): Promise<LocalForagePlanMyTripCacheService> {
    if (LocalForagePlanMyTripCacheService._instance == null) {
      LocalForagePlanMyTripCacheService._instance = new LocalForagePlanMyTripCacheService();
      await LocalForagePlanMyTripCacheService._instance.initializeCache();
    }
    return LocalForagePlanMyTripCacheService._instance;
  }

  public async addOrUpdateRepository(spec: IPlanMyTripRepositoryMetadata): Promise<void> {
    if (this.store == null) throw new Error(this.CACHE_UNAVAILABLE);
    await this.store.setItem(spec.id, spec);
  }

  public async deleteRepository(repositoryId: string): Promise<void> {
    if (this.store == null) throw new Error(this.CACHE_UNAVAILABLE);
    await this.store.removeItem(repositoryId);
  }

  public async updateSubCacheStatus(
    repositoryId: string,
    type: keyof IPlanMyTripCacheStatuses,
    newStatus: IPlanMyTripCacheStatus
  ): Promise<void> {
    if (this.store == null) throw new Error(this.CACHE_UNAVAILABLE);

    const repo = (await this.store.getItem(repositoryId)) as IPlanMyTripRepositoryMetadata;

    if (!repo) throw new Error('Plan My Trip repository not found');

    repo.cacheStatuses[type] = newStatus;
    await this.store.setItem(repositoryId, repo);
  }

  public async getRepository(repositoryId: string): Promise<IPlanMyTripRepositoryMetadata | null> {
    if (this.store == null) throw new Error(this.CACHE_UNAVAILABLE);
    try {
      const repository = await this.store.getItem(repositoryId);
      return repository as IPlanMyTripRepositoryMetadata;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public async listRepositories(): Promise<IPlanMyTripRepositoryMetadata[]> {
    if (this.store == null) throw new Error(this.CACHE_UNAVAILABLE);
    const response: IPlanMyTripRepositoryMetadata[] = [];
    await this.store.iterate((cachedRepo: IPlanMyTripRepositoryMetadata, _: PropertyKey) => {
      response.push(cachedRepo);
    });
    return response;
  }

  private async initializeCache() {
    this.store = localForage.createInstance({
      name: 'plan-my-trip',
      storeName: 'plan-my-trip',
      version: 1
    });
  }
}

export default LocalForagePlanMyTripCacheService;
