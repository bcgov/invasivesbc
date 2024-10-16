import { createAction, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { ProgressCallbackParameters } from 'utils/tile-cache';

class TileCache {
  static readonly updateNotify = createAction('TILE_CACHE_UPDATE_NOTIFY');
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
  static readonly requestCaching = createAsyncThunk('TILE_CACHE_NEW_REQUEST', async (_: never, { dispatch }) => {
    const service = await TileCacheServiceFactory.getPlatformInstance();
    const name = `test-${nanoid()}`;

    await service.download(
      {
        id: name,
        maxZoom: 18,
        bounds: {
          minLongitude: -127,
          maxLongitude: -126.95,
          minLatitude: 55.24,
          maxLatitude: 55.25
        },
        description: 'Cached Layer',
        tileURL: (x, y, z) =>
          `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
      },
      (p) => {
        dispatch(TileCache.downloadProgressEvent(p));
      }
    );

    return await service.listRepositories();
  });
}

export default TileCache;
