import SQLitePlanMyTripCacheService from './sqlite-cache';
import LocalForagePlanMyTripCacheService from './localforage-cache';
import { PlanMyTripCacheService } from '.';
import { Platform, buildTimeConfig } from 'state/configuration/build-time-config';

class PlanMyTripCacheServiceFactory {
  static async getPlatformInstance(): Promise<PlanMyTripCacheService> {
    if ([Platform.IOS, Platform.ANDROID].includes(buildTimeConfig.PLATFORM)) {
      return SQLitePlanMyTripCacheService.getInstance();
    }
    return LocalForagePlanMyTripCacheService.getInstance();
  }
}

export { PlanMyTripCacheServiceFactory };
