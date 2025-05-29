import { RecordCacheService } from 'utils/record-cache';
import { StartupTask } from 'UI/StartupCoordinator/StartupCoordinator';

const LOAD_RECORDSET_CACHES: StartupTask = {
  name: 'Load Recordset Caches',
  run: async ({ CONFIG }) => {
    if (CONFIG.build.MOBILE && CONFIG.features.CACHE_RECORDSETS.enabled) {
      await RecordCacheService.getInstance();
    }
  }
};

export { LOAD_RECORDSET_CACHES };
