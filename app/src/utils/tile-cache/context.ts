import { TileCacheService } from 'utils/tile-cache/index';
import { Platform, PLATFORM } from 'state/build-time-config';
import { SQLiteTileCacheService } from 'utils/tile-cache/sqlite-cache';
import { LocalForageCacheService } from 'utils/tile-cache/localforage-cache';

class TileCacheServiceFactory {
  static async getPlatformInstance(): Promise<TileCacheService> {
    if ([Platform.IOS, Platform.ANDROID].includes(PLATFORM)) {
      return SQLiteTileCacheService.getInstance();
    }
    return LocalForageCacheService.getInstance();
  }
}

export { TileCacheServiceFactory };
