import { Platform, PLATFORM } from 'state/build-time-config';
import { RecordCacheService } from 'utils/record-cache/index';
import { SQLiteRecordCacheService } from 'utils/record-cache/sqlite-cache';
import { LocalForageRecordCacheService } from 'utils/record-cache/localforage-cache';

class RecordCacheServiceFactory {
  static async getPlatformInstance(): Promise<RecordCacheService> {
    if (PLATFORM == Platform.IOS) {
      return SQLiteRecordCacheService.getInstance();
    }
    return LocalForageRecordCacheService.getInstance();
  }
}

export { RecordCacheServiceFactory };
