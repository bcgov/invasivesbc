import { getLogger } from 'utils/logger';
import { AbstractCache, AbstractCacheService } from './cache-utils';

const defaultLog = getLogger('cache');

class MemoryCache extends AbstractCache {
  private data: Map<string, { data: any; ttl: number }>;

  constructor() {
    super();
    this.data = new Map();
  }

  expireEntries() {
    for (const [key, ce] of this.data.entries()) {
      ce.ttl = ce.ttl - 1;
      if (ce.ttl <= 0) {
        this.data.delete(key);
      }
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      return this.data.get(key).data;
    } catch {
      return null;
    }
  }

  async put(key, data): Promise<void> {
    // ttl is number of expirations it will survive (eg expiry = initialTTL * interval)
    this.data.set(key, { data, ttl: 10 });
  }
}

export class InMemoryCacheService extends AbstractCacheService {
  caches: Map<string, MemoryCache> = new Map();

  constructor(interval?: number) {
    super();
    setInterval(
      () => {
        this.cleanCaches();
      },
      interval ? interval : 600000
    );
  }

  private cleanCaches() {
    defaultLog.debug({ message: 'expiring old cache entries' });
    for (const c of this.caches.values()) {
      c.expireEntries();
    }
  }

  getCache(cacheName: string): AbstractCache {
    if (!this.caches.has(cacheName)) {
      this.caches.set(cacheName, new MemoryCache());
    }
    return this.caches.get(cacheName);
  }
}
