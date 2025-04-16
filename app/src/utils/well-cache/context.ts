import React from 'react';
import SQLiteWellCacheService from './sqlite-cache';
import { WellCacheService } from '.';
import { Platform, PLATFORM } from 'state/build-time-config';
import { LocalForageWellCacheService } from 'utils/well-cache/localforage-cache';

class WellCacheServiceFactory {
  static async getPlatformInstance(): Promise<WellCacheService> {
    if ([Platform.IOS, Platform.ANDROID].includes(PLATFORM)) {
      return SQLiteWellCacheService.getInstance();
    }
    return await LocalForageWellCacheService.getInstance();
  }
}

const Context = React.createContext<WellCacheService | null>(null);

export { WellCacheServiceFactory, Context };
