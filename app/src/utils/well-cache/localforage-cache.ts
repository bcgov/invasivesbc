import localForage from 'localforage';
import {
  IWellCacheProgressCallbackParameters,
  IWellRepositoryMetadata,
  WellCacheService,
  WellRepositoryStatus
} from '.';
import WellData from 'interfaces/WellData';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';

class LocalForageWellCacheService extends WellCacheService {
  private static _instance: LocalForageWellCacheService;
  private static readonly REPOSITORY_METADATA_KEY = 'well-repositories';
  private store: LocalForage | null = null;

  protected constructor() {
    super();
  }

  static async getInstance(): Promise<LocalForageWellCacheService> {
    if (LocalForageWellCacheService._instance == null) {
      LocalForageWellCacheService._instance = new LocalForageWellCacheService();
      await LocalForageWellCacheService._instance.initializeCache();
    }
    return LocalForageWellCacheService._instance;
  }

  async deleteRepository(repositoryId: string) {
    if (this.store == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    const cachedSets = await this.listRepositories();
    const foundIndex = cachedSets.findIndex((r) => r.id === repositoryId);

    if (foundIndex === -1) return;

    await this.setRepositoryStatus(repositoryId, WellRepositoryStatus.DELETING);

    const deleteList = cachedSets[foundIndex].wellTagNumbers;
    const ids: Record<PropertyKey, number> = {};

    cachedSets
      .flatMap((set) => set.wellTagNumbers)
      .forEach((id) => {
        ids[id] ??= 0;
        ids[id]++;
      });

    const wellsToDelete = deleteList.filter((id) => ids[id] === 1);
    await this.deleteWellsFromIds(wellsToDelete);
    cachedSets.splice(foundIndex, 1);
    await this.store.setItem(LocalForageWellCacheService.REPOSITORY_METADATA_KEY, cachedSets);
  }

  protected async deleteWellsFromIds(wellTagNumbers: number[]) {
    if (this.store == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    for (const wellTagNumber of wellTagNumbers) {
      await this.store.removeItem(wellTagNumber.toString());
    }
  }

  /**
   * @desc Compare two objects bounds to find a match
   * @returns Bounds hold the same value
   */
  private compareBounds(objA: RepositoryBoundingBoxSpec, objB: RepositoryBoundingBoxSpec): boolean {
    return Object.keys(objA).every((key) => objA[key] === objB[key]);
  }

  public async getRepository(repositoryId: string | RepositoryBoundingBoxSpec): Promise<IWellRepositoryMetadata> {
    const repos = await this.listRepositories();
    let foundIndex: number;
    if (typeof repositoryId === 'string') {
      foundIndex = repos.findIndex((p) => p.id === repositoryId);
    } else {
      foundIndex = repos.findIndex((p) => this.compareBounds(p.bounds, repositoryId));
    }
    if (foundIndex === -1) throw Error(`Repository ${repositoryId} not found`);

    return repos[foundIndex];
  }

  protected async saveWells(
    wellList: WellData[],
    progressCallback?: ((currentProgress: IWellCacheProgressCallbackParameters) => void) | undefined
  ): Promise<void> {
    if (this.store == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    for (const well of wellList) {
      await this.saveWell(well);
    }
  }

  protected async saveWell(wellData: WellData): Promise<void> {
    if (this.store == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    const id = wellData.properties.WELL_TAG_NUMBER;
    // converts to String due to IndexDB Constraint requiring string keys
    const cleanedWellData: WellData = {
      id: id,
      properties: { WELL_TAG_NUMBER: id },
      type: wellData.type,
      geometry: wellData.geometry
    };
    console.log(cleanedWellData);
    await this.store.setItem(cleanedWellData.id.toString(), cleanedWellData);
  }

  /**
   * @desc Get all Repository records in IndexDB
   * @returns { IWellRepositoryMetadata } All metadata for well sets.
   */
  async listRepositories(): Promise<IWellRepositoryMetadata[]> {
    if (this.store == null) {
      return [];
    }

    const metadata: IWellRepositoryMetadata[] =
      (await this.store.getItem(LocalForageWellCacheService.REPOSITORY_METADATA_KEY)) ?? [];
    if (metadata == null) {
      console.error('expected key not found');
      return [];
    }
    return metadata;
  }

  /**
   * @desc Update status of Well repository
   * @param repositoryId Repository to update
   * @param { WellRepositoryStatus } status New Status.
   */
  public async setRepositoryStatus(repositoryId: string, status: WellRepositoryStatus): Promise<void> {
    if (this.store == null) {
      throw Error(this.CACHE_UNAVAILABLE);
    }
    const cachedSets = await this.listRepositories();
    const foundIndex = cachedSets.findIndex((r) => r.id === repositoryId);
    if (foundIndex !== -1) {
      Object.assign(cachedSets[foundIndex], { status });
      await this.store.setItem(LocalForageWellCacheService.REPOSITORY_METADATA_KEY, cachedSets);
    }
  }

  /**
   * @desc Create or add new Repository to the repository metadata array
   * @param { IWellRepositoryMetadata } spec Details
   */
  protected async addOrUpdateRepository(spec: IWellRepositoryMetadata) {
    if (this.store == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }

    const repositories = await this.listRepositories();
    const foundIndex = repositories.findIndex((p) => p.id == spec.id);
    if (foundIndex !== -1) {
      repositories[foundIndex] = spec;
    } else {
      repositories.push(spec);
    }

    await this.store.setItem(LocalForageWellCacheService.REPOSITORY_METADATA_KEY, repositories);
  }
  private async initializeCache() {
    this.store = localForage.createInstance({
      storeName: 'well-cache',
      version: 20250120
    });
  }
}

export { LocalForageWellCacheService };
