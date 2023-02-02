// naive in-memory cache. reimplement this with something more robust (weakrefs, memcache, redis, in-database caching).

class Cache {
  data: Map<string, { data: any; ttl: number }> = new Map();

  expireEntries() {
    for (const [key, ce] of this.data.entries()) {
      ce.ttl = ce.ttl - 1;
      if (ce.ttl <= 0) {
        this.data.delete(key);
      }
    }
  }

  get(key: string): any | null {
    try {
      return this.data.get(key);
    } catch {
      return null;
    }
  }

  put(key, data) {
    // ttl is number of expirations it will survive (eg expiry = initialTTL * interval)
    this.data.set(key, { data, ttl: 10 });
  }
}

export class CacheService {
  caches: Map<string, Cache> = new Map();

  constructor(interval?: number) {
    setInterval(() => {
      this.cleanCaches();
    }, interval? interval: 600000);
  }

  private cleanCaches() {
    console.debug('expiring old cache entries');
    for (const c of this.caches.values()) {
      c.expireEntries();
    }
  }

  getCache(cacheName: string): Cache {
    if (!this.caches.has(cacheName)) {
      this.caches.set(cacheName, new Cache());
    }
    return this.caches.get(cacheName);
  }
}

const cacheInstance = new CacheService();

export default cacheInstance;
