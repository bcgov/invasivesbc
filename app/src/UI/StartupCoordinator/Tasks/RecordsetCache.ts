import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import { StartupTask } from 'UI/StartupCoordinator/StartupCoordinator';

const LOAD_RECORDSET_CACHES: StartupTask = {
  name: 'Load Recordset Caches',
  run: async ({ CONFIG }) => {
    if (CONFIG.build.MOBILE && CONFIG.features.CACHE_RECORDSETS.enabled) {
      await RecordCacheServiceFactory.getPlatformInstance();
    }
  }
};

export { LOAD_RECORDSET_CACHES };
