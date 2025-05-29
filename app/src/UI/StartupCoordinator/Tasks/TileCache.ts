import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { StartupTask } from 'UI/StartupCoordinator/StartupCoordinator';

const LOAD_TILE_CACHES: StartupTask = {
  name: 'Load Tile Caches',
  run: async ({ CONFIG }) => {
    if (CONFIG.build.MOBILE && CONFIG.features.CACHE_TILES.enabled) {
      const tileCache = await TileCacheServiceFactory.getPlatformInstance();
      return { tileService: tileCache };
    }
  }
};

export { LOAD_TILE_CACHES };
