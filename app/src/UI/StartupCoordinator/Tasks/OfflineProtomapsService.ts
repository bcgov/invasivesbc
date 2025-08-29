import { StartupTask } from 'UI/StartupCoordinator/StartupCoordinator';
import { OfflineProtomapsServiceFactory } from 'utils/offline-protomaps/context';

const LOAD_OFFLINE_PROTOMAPS: StartupTask = {
  name: 'Load Offline Protomaps Service',
  run: async ({ CONFIG }) => {
    if (CONFIG.build.MOBILE && CONFIG.features.OFFLINE_PROTOMAPS.enabled) {
      try {
        return {
          offlineProtomapsService: await OfflineProtomapsServiceFactory.getPlatformInstance()
        };
      } catch (e) {
        console.error(e);
        // don't add it to the context if it's not ready
        return {};
      }
    }
  }
};

export { LOAD_OFFLINE_PROTOMAPS };
