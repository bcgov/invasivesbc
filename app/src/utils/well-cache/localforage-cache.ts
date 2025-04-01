import localForage from 'localforage';
import {
  IWellCacheProgressCallbackParameters,
  IWellRepositoryMetadata,
  WellCacheService,
  WellRepositoryStatus
} from '.';
import WellData from 'interfaces/WellData';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import { Feature, FeatureCollection } from '@turf/helpers';

class LocalForageWellCacheService extends WellCacheService {
  private static _instance: LocalForageWellCacheService;
  private static readonly REPOSITORY_METADATA_KEY = 'well-repositories';
  private store: LocalForage | null = null;

  protected constructor() {
    super();
  }

  static override async getInstance(): Promise<LocalForageWellCacheService> {
    if (LocalForageWellCacheService._instance == null) {
      LocalForageWellCacheService._instance = new LocalForageWellCacheService();
      await LocalForageWellCacheService._instance.initializeCache();
    }
    return LocalForageWellCacheService._instance;
  }

  async deleteRepository(repository: string | RepositoryBoundingBoxSpec) {
    if (this.store == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    const repositories = await this.listRepositories();
    let foundIndex: number;
    if (typeof repository === 'string') {
      foundIndex = repositories.findIndex((r) => r.id === repository);
    } else {
      foundIndex = repositories.findIndex((r) => this.compareBounds(r.bounds, repository));
    }

    if (foundIndex === -1) return;

    await this.setRepositoryStatus(repositories[foundIndex].id, WellRepositoryStatus.DELETING);

    const deleteList = repositories[foundIndex].wellTagNumbers;
    const ids: Record<PropertyKey, number> = {};

    repositories
      .flatMap((set) => set.wellTagNumbers)
      .forEach((id) => {
        ids[id] ??= 0;
        ids[id]++;
      });

    const wellsToDelete = deleteList.filter((id) => ids[id] === 1);
    await this.deleteWellsFromIds(wellsToDelete);
    repositories.splice(foundIndex, 1);
    await this.store.setItem(LocalForageWellCacheService.REPOSITORY_METADATA_KEY, repositories);
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
    wellData.geometry.properties = { WELL_TAG_NUMBER: wellData.properties.WELL_TAG_NUMBER };
    // converts to String due to IndexDB Constraint requiring string keys
    const cleanedWellData: WellData = {
      id: id,
      geometry: wellData.geometry
    };

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

  protected async createFeatureCollectionFromMetadata(
    repository: string | RepositoryBoundingBoxSpec
  ): Promise<FeatureCollection> {
    const repo = await this.getRepository(repository);
    const features: Feature[] = [];
    for (const wtn of repo.wellTagNumbers) {
      const well: WellData = (await this.store?.getItem(wtn.toString())) as WellData;
      well.geometry.properties = {
        WELL_TAG_NUMBER: well.id
      };
      features.push(well.geometry);
    }
    return {
      type: 'FeatureCollection',
      features: features
    };
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
      version: 20241030
    });
  }
}

export { LocalForageWellCacheService };
