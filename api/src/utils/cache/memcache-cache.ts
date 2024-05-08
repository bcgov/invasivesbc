import { getLogger } from 'utils/logger';
import { AbstractCache, AbstractCacheService } from './cache-utils';
import { MemcacheClient } from 'memcache-client';

const defaultLog = getLogger('cache');

class MemcacheCache extends AbstractCache {
  client: MemcacheClient;

  constructor() {
    super();
    this.client = new MemcacheClient({
      server: process.env.MEMCACHE_SERVER || 'localhost:11211',
      ignoreNotStored: true,
      lifetime: 3600 * 4 // default TTL = 4 hours
    });
  }

  async get(key: string): Promise<any | null> {
    try {
      const result = await this.client.get(key);
      return result?.value;
    } catch {
      return null;
    }
  }

  async put(key, data): Promise<void> {
    await this.client.set(key, data);
  }
}

export class MemcacheCacheService extends AbstractCacheService {
  cache: MemcacheCache;

  constructor() {
    super();
    this.cache = new MemcacheCache();
  }

  getCache(cacheName: string): MemcacheCache {
    return this.cache;
  }
}
