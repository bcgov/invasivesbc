import localForage from 'localforage';
import { RecordCacheAddSpec, RecordCacheService, RecordSetCacheMetadata } from 'utils/record-cache/index';

class LocalForageRecordCacheService extends RecordCacheService {
  private static _instance: LocalForageRecordCacheService;

  private static CACHED_SETS_METADATA_KEY = 'cached-sets';

  private store: LocalForage | null = null;

  protected constructor() {
    super();
  }

  static async getInstance(): Promise<LocalForageRecordCacheService> {
    if (LocalForageRecordCacheService._instance == null) {
      LocalForageRecordCacheService._instance = new LocalForageRecordCacheService();
      await LocalForageRecordCacheService._instance.initializeCache();
    }
    return LocalForageRecordCacheService._instance;
  }

  async saveActivity(id: string, data: unknown): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    await this.store.setItem(id, data);
  }

  async loadActivity(id: string): Promise<unknown> {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    const data = await this.store.getItem(id);

    if (!data) {
      throw new Error(`activity ${id} not found in cache`);
    }

    return data;
  }

  async addCachedSet(spec: RecordCacheAddSpec): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    const cachedSets = await this.listCachedSets();
    const foundIndex = cachedSets.findIndex((p) => p.setId == spec.setId);
    if (foundIndex !== -1) {
      throw new Error('cached set already exists');
    }

    cachedSets.push({
      setId: spec.setId,
      cachedIds: spec.idsToCache
    });

    await this.store.setItem(LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY, cachedSets);
  }

  async listCachedSets(): Promise<RecordSetCacheMetadata[]> {
    if (this.store == null) {
      return [];
    }

    const metadata = (await this.store.getItem(LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY)) as
      | RecordSetCacheMetadata[]
      | null;
    if (metadata == null) {
      console.error('expected key not found');
      return [];
    }
    return metadata;
  }

  async deleteCachedSet(id: string): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }

    const cachedSets = await this.listCachedSets();
    const foundIndex = cachedSets.findIndex((p) => p.setId == id);
    if (foundIndex !== -1) {
      cachedSets.splice(foundIndex, 1);
    }
    try {
      await this.cleanupOrphanActivities();
    } finally {
      await this.store.setItem(LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY, cachedSets);
    }
  }

  private async cleanupOrphanActivities(): Promise<void> {
    if (this.store == null) {
      throw new Error('cache not available');
    }
    const cachedSets = await this.listCachedSets();

    const allKeys = await this.store.keys();
    const deletionQueue: string[] = [];
    for (const k of allKeys) {
      if (k == LocalForageRecordCacheService.CACHED_SETS_METADATA_KEY) {
        continue;
      }
      let referenced = false;
      for (const set of cachedSets) {
        if (set.cachedIds?.includes(k)) {
          referenced = true;
        }
      }
      if (!referenced) {
        deletionQueue.push(k);
      }
    }
    for (const d of deletionQueue) {
      try {
        await this.store.removeItem(d);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private async initializeCache() {
    this.store = localForage.createInstance({
      storeName: 'record-cache',
      version: 20241030
    });
  }
}

export { LocalForageRecordCacheService };
