import { getLogger } from './logger';
import { InMemoryCacheService } from './cache/in-memory-cache';

const defaultLog = getLogger('cache');

export abstract class AbstractCache {
  abstract async get(key: string): Promise<any | null>;

  abstract async put(key, data): Promise<void>;
}

export abstract class AbstractCacheService {
  abstract getCache(cacheName: string): AbstractCache;
}

function createCacheInstance(): AbstractCacheService {
  if (process.env['MEMCACHE_ENABLED']) {
    defaultLog.info({ message: 'Memcache support enabled' });
  } else {
    defaultLog.info({ message: 'Using fallback (local) cache' });
    return new InMemoryCacheService();
  }
}

const cacheInstance: AbstractCacheService = createCacheInstance();

export default cacheInstance;
