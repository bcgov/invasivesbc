import localForage from 'localforage';
import {
  RepositoryMetadata,
  RepositoryStatistics,
  RepositoryStatus,
  TileCacheService,
  TileData
} from 'utils/tile-cache/index';

interface SerializedTileData {
  data: Uint8Array;
}

interface TileKey {
  repository: string;
  z: number;
  x: number;
  y: number;
}

class LocalForageCacheService extends TileCacheService {
  private static _instance: LocalForageCacheService;

  private static REPOSITORY_METADATA_KEY = 'repositories';

  private store: LocalForage | null = null;

  protected constructor() {
    super();
  }

  static async getInstance(): Promise<LocalForageCacheService> {
    if (LocalForageCacheService._instance == null) {
      LocalForageCacheService._instance = new LocalForageCacheService();
      await LocalForageCacheService._instance.initializeCache();
    }
    return LocalForageCacheService._instance;
  }

  private static serializeTileKey(key: TileKey) {
    // serialize the object so we can deserialize later for (inefficient) index-like operations
    // in utility method in case we want to change the mechanism
    return JSON.stringify(key);
  }

  private static deserializeTileKey(key: string): TileKey {
    // rehydrate
    return JSON.parse(key) as TileKey;
  }

  async setTile(repository: string, z: number, x: number, y: number, tileData: Uint8Array) {
    const key = LocalForageCacheService.serializeTileKey({ repository, z, x, y });

    if (this.store == null) {
      throw new Error('cache not available');
    }

    await this.store.setItem(key, {
      data: tileData
    });
  }

  async getTile(repository: string, z: number, x: number, y: number): Promise<TileData> {
    if (this.store == null) {
      return TileCacheService.generateTransparentFallbackTile();
    }

    const key = LocalForageCacheService.serializeTileKey({ repository, z, x, y });

    const result: SerializedTileData | null = await this.store.getItem(key);
    if (result != null) {
      return {
        data: result.data
      };
    }

    return TileCacheService.generateTransparentFallbackTile();
  }

  async getRepository(id: string): Promise<RepositoryMetadata | null> {
    if (this.store == null) {
      return null;
    }
    const repositoryMetadata = (await this.store.getItem(LocalForageCacheService.REPOSITORY_METADATA_KEY)) as
      | RepositoryMetadata[]
      | null;

    if (repositoryMetadata == null) {
      console.error('expected key not found');
      return null;
    }

    return repositoryMetadata.find((m) => m.id == id) || null;
  }

  async listRepositories(): Promise<RepositoryMetadata[]> {
    if (this.store == null) {
      return [];
    }

    const repositoryMetadata = (await this.store.getItem(LocalForageCacheService.REPOSITORY_METADATA_KEY)) as
      | RepositoryMetadata[]
      | null;
    if (repositoryMetadata == null) {
      console.error('expected key not found');
      return [];
    }
    return repositoryMetadata;
  }

  async setRepositoryStatus(repository: string, status: RepositoryStatus) {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    const repositories = await this.listRepositories();
    for (const r of repositories) {
      if (r.id == repository) {
        r.status = status;
      }
    }

    await this.store.setItem(LocalForageCacheService.REPOSITORY_METADATA_KEY, repositories);
  }

  async deleteRepository(repository: string): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    await this.setRepositoryStatus(repository, RepositoryStatus.DELETING);

    const repositories = await this.listRepositories();
    const foundIndex = repositories.findIndex((p) => p.id == repository);
    if (foundIndex !== -1) {
      repositories.splice(foundIndex, 1);
    }
    try {
      await this.cleanupOrphanTiles();
    } finally {
      await this.store.setItem(LocalForageCacheService.REPOSITORY_METADATA_KEY, repositories);
    }
  }

  async getRepositoryStatistics(id: string): Promise<RepositoryStatistics> {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    const metadata = await this.getRepository(id);
    if (!metadata) {
      throw new Error('repository not available');
    }

    let sizeInBytes = 0;
    let numberOfTiles = 0;

    await this.store.iterate((value, key, i) => {
      if (key == LocalForageCacheService.REPOSITORY_METADATA_KEY) return;
      try {
        const tileMetadata = LocalForageCacheService.deserializeTileKey(key);
        if (tileMetadata.repository == metadata.id) {
          numberOfTiles++;
          sizeInBytes += (value as SerializedTileData).data.length;
        }
      } catch (e) {
        // it might not be parseable if it's not a tile record
        return;
      }
    });
    return {
      sizeInBytes,
      tileCount: numberOfTiles
    };
  }

  protected async cleanupOrphanTiles(): Promise<void> {
    if (this.store == null) {
      return;
    }

    const validRepositories = (await this.listRepositories())
      .filter((r) => {
        return [RepositoryStatus.READY, RepositoryStatus.DOWNLOADING].includes(r.status);
      })
      .map((r) => r.id);

    console.debug(`Deleting tiles not matching repository: [${validRepositories.join(',')}]`);

    const deletionQueue: string[] = (await this.store.keys()).filter((k) => {
      if (k == LocalForageCacheService.REPOSITORY_METADATA_KEY) return false;

      try {
        const tileMetadata = LocalForageCacheService.deserializeTileKey(k);
        return !validRepositories.includes(tileMetadata.repository);
      } catch (e) {
        // it might not be parseable if it's not a tile record
        return false;
      }
    });

    console.debug(`${deletionQueue.length} orphaned tiles to purge`);

    for (const toDelete of deletionQueue) {
      try {
        await this.store.removeItem(toDelete);
      } catch (e) {
        console.error(e);
      }
    }
  }

  protected async addRepository(spec: RepositoryMetadata) {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    const repositories = await this.listRepositories();
    const foundIndex = repositories.findIndex((p) => p.id == spec.id);
    if (foundIndex !== -1) {
      throw new Error('repository already exists');
    }

    repositories.push(spec);

    await this.store.setItem(LocalForageCacheService.REPOSITORY_METADATA_KEY, repositories);
  }

  private async initializeCache() {
    this.store = localForage.createInstance({
      storeName: 'tile-cache',
      version: 20241014
    });
  }
}

export { LocalForageCacheService };
