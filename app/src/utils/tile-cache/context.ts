import React from 'react';
import { TileCacheService } from 'utils/tile-cache/index';
import { Platform, PLATFORM } from 'state/build-time-config';
import { SQLiteTileCacheService } from 'utils/tile-cache/sqlite-cache';
import { LocalForageCacheService } from 'utils/tile-cache/localforage-cache';

class TileCacheServiceFactory {
  static async getPlatformInstance() {
    if (PLATFORM == Platform.IOS) {
      return SQLiteTileCacheService.getInstance();
    }
    return LocalForageCacheService.getInstance();
  }
}

const Context = React.createContext<TileCacheService | null>(null);

export { TileCacheServiceFactory, Context };
