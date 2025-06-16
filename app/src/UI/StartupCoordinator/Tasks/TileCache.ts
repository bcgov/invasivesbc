import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { StartupTask } from 'UI/StartupCoordinator/StartupCoordinator';

const LOAD_TILE_CACHES: StartupTask = {
  name: 'Load Tile Caches',
  run: async ({ CONFIG }) => {
    if (CONFIG.build.MOBILE && CONFIG.features.CACHE_TILES.enabled) {
      try {
        const tileCache = await TileCacheServiceFactory.getPlatformInstance();
        await tileCache.waitForStore();
        return { tileService: tileCache };
      } catch (e) {
        console.error(e);
        // don't add it to the context if it's not ready
        return {};
      }
    }
  }
};
export { LOAD_TILE_CACHES };
