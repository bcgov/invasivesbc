import { createAction, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { GeoJSON } from 'geojson';
import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { ProgressCallbackParameters, RepositoryBoundingBoxSpec } from 'utils/tile-cache';

class TileCache {
  // used to tell the map we are on a page where we might want to draw a rectangle
  static readonly setMapTileCacheMode = createAction<boolean>('SET_MAP_TILE_CACHE_MODE');

  static readonly setTileCacheShape = createAction<{ geometry: GeoJSON }>('SET_TILE_CACHE_SHAPE');
  static readonly clearTileCacheShape = createAction('CLEAR_TILE_CACHE_SHAPE');

  static readonly downloadProgressEvent = createAction<ProgressCallbackParameters>(
    'TILE_CACHE_DOWNLOAD_PROGRESS_EVENT'
  );

  static readonly repositoryList = createAsyncThunk('TILE_CACHE_REPOSITORY_LIST', async () => {
    return await (await TileCacheServiceFactory.getPlatformInstance()).listRepositories();
  });
  static readonly deleteRepository = createAsyncThunk('TILE_CACHE_REPOSITORY_DELETE', async (repository: string) => {
    const service = await TileCacheServiceFactory.getPlatformInstance();
    await service.deleteRepository(repository);
    return await service.listRepositories();
  });
  static readonly requestCaching = createAsyncThunk(
    'TILE_CACHE_NEW_REQUEST',
    async (
      spec: {
        description: string;
        maxZoom: number;
        bounds: RepositoryBoundingBoxSpec;
      },
      { dispatch }
    ) => {
      const service = await TileCacheServiceFactory.getPlatformInstance();
      const name = `cache-${nanoid()}`;

      await service.download(
        {
          id: name,
          maxZoom: spec.maxZoom,
          bounds: spec.bounds,
          description: spec.description,
          tileURL: (x, y, z) =>
            `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
        },
        (p) => {
          dispatch(TileCache.downloadProgressEvent(p));
        }
      );

      return await service.listRepositories();
    }
  );
}

export default TileCache;
