import React from 'react';
import { Platform, PLATFORM } from 'state/build-time-config';
// import { SQLiteWellCacheService } from 'utils/well-cache/sqlite-cache';
import { LocalForageWellCacheService } from 'utils/well-cache/localforage-cache';
import { WellCacheService } from '.';

class WellCacheServiceFactory {
  static async getPlatformInstance(): Promise<WellCacheService> {
    if ([Platform.IOS, Platform.ANDROID].includes(PLATFORM)) {
      // return SQLiteTileCacheService.getInstance();
    }
    return LocalForageWellCacheService.getInstance();
  }
}

const Context = React.createContext<WellCacheService | null>(null);

export { WellCacheServiceFactory, Context };
