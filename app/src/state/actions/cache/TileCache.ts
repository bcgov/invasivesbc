import { createAction, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { GeoJSON } from 'geojson';
import DownloadActions from '../downloads/DownloadActions';
import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { TileCacheProgressCallbackParameters, RepositoryBoundingBoxSpec, RepositoryStatus } from 'utils/tile-cache';
import { RootState } from 'state/reducers/rootReducer';

class TileCache {
  static readonly PREFIX = 'TileCache';

  // used to tell the map we are on a page where we might want to draw a rectangle
  static readonly setMapTileCacheMode = createAction<boolean>(`${this.PREFIX}/setDrawMode`);

  static readonly setTileCacheShape = createAction<{ geometry: GeoJSON }>(`${this.PREFIX}/setShape`);
  static readonly clearTileCacheShape = createAction(`${this.PREFIX}/clearShape`);

  static readonly downloadProgressEvent = createAction<TileCacheProgressCallbackParameters>(
    `${this.PREFIX}/downloadProgressEvent`
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
        id?: string;
      },
      { dispatch, getState }
    ) => {
      const id = spec.id ?? `tile-cache-${nanoid()}`;
      dispatch(
        TileCache.downloadProgressEvent({
          repository: id,
          description: spec.description,
          message: RepositoryStatus.QUEUED,
          aborted: false,
          normalizedProgress: 0,
          totalTiles: 0,
          processedTiles: 0
        })
      );
      await dispatch(DownloadActions.request());
      const downloadInQueue = !!(getState() as RootState)?.TileCache?.downloadProgress?.[id];
      const service = await TileCacheServiceFactory.getPlatformInstance();
      if (downloadInQueue) {
        await service.download(
          {
            id: id,
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
      }
      return await service.listRepositories();
    }
  );
}

export default TileCache;
