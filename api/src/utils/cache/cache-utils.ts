import { getLogger } from '../logger.js';

const defaultLog = getLogger('cache');

export abstract class AbstractCache {
  abstract get(key: string): Promise<any | null>;

  abstract put(key, data): Promise<void>;
}

export abstract class AbstractCacheService {
  abstract getCache(cacheName: string): AbstractCache;
}

export function versionedKey(key: string) {
  const commit = process.env['OPENSHIFT_BUILD_COMMIT'];
  let computedKey;

  if (commit) {
    computedKey = `${commit}-${key}`;
  } else {
    //fallback if not running in OCP environment
    computedKey = `${process.pid}-${key}`;
  }

  defaultLog.debug({ message: `computed cache key: ${computedKey}` });

  return computedKey;
}
