import { createAction, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { GeoJSON } from 'geojson';
import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { ProgressCallbackParameters, RepositoryBoundingBoxSpec } from 'utils/tile-cache';

class TileCache {
  static readonly PREFIX = 'TileCache';

  // used to tell the map we are on a page where we might want to draw a rectangle
  static readonly setMapTileCacheMode = createAction<boolean>(`${this.PREFIX}/setDrawMode`);

  static readonly setTileCacheShape = createAction<{ geometry: GeoJSON }>(`${this.PREFIX}/setShape`);
  static readonly clearTileCacheShape = createAction(`${this.PREFIX}/clearShape`);

  static readonly downloadProgressEvent = createAction<ProgressCallbackParameters>(
    'TILE_CACHE_DOWNLOAD_PROGRESS_EVENT'
  );

  static readonly repositoryList = createAsyncThunk(`${this.PREFIX}/repoList`, async () => {
    return await (await TileCacheServiceFactory.getPlatformInstance()).listRepositories();
  });
  static readonly deleteRepository = createAsyncThunk(`${this.PREFIX}/repoDelete`, async (repository: string) => {
    const service = await TileCacheServiceFactory.getPlatformInstance();
    await service.deleteRepository(repository);
    return await service.listRepositories();
  });
  static readonly updateDescription = createAsyncThunk(
    `${this.PREFIX}/repoUpdateDescription`,
    async (spec: { repository: string; newDescription: string }) => {
      const service = await TileCacheServiceFactory.getPlatformInstance();
      await service.updateDescription(spec.repository, spec.newDescription);
      return await service.listRepositories();
    }
  );
  static readonly requestCaching = createAsyncThunk(
    `${this.PREFIX}/requestCaching`,
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
