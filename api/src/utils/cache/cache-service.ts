import { getLogger } from '../logger.js';
import { InMemoryCacheService } from './in-memory-cache.js';
import { MemcacheCacheService } from './memcache-cache.js';
import { AbstractCacheService } from './cache-utils.js';

const defaultLog = getLogger('cache');

function createCacheInstance(): AbstractCacheService {
  if (process.env['MEMCACHE_ENABLED']) {
    defaultLog.info({ message: 'Memcache support enabled' });
    return new MemcacheCacheService();
  } else {
    defaultLog.info({
      message:
        'Using fallback (local) cache. To use memcached, set MEMCACHE_ENABLED and MEMCACHE_SERVER=<host>:<port> in your environment'
    });
    return new InMemoryCacheService();
  }
}

const cacheInstance: AbstractCacheService = createCacheInstance();

export default cacheInstance;
