import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'state/reducers/rootReducer';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import { WellCacheServiceFactory } from 'utils/well-cache/context';

/**
 * @desc Action Members for WellCaching
 *       Used for Caching Well Metadata for use in offline Chemical treatment forms.
 */
class WellCache {
  private static readonly PREFIX = 'WellCache';

  static readonly requestCaching = createAsyncThunk(
    `${this.PREFIX}/requestCaching`,

    async (bounds: RepositoryBoundingBoxSpec, { getState }) => {
      const state: RootState = getState() as RootState;
      const wellService = await WellCacheServiceFactory.getPlatformInstance();
      await wellService.download({
        API_BASE: state.Configuration.current.API_BASE,
        bounds
      });
    }
  );

  static readonly deleteRepository = createAsyncThunk(`${this.PREFIX}/requestCaching`, async (repository: string) => {
    const wellService = await WellCacheServiceFactory.getPlatformInstance();
    await wellService.deleteRepository(repository);
  });

  static readonly fetchWellIdsInBounds = createAsyncThunk(
    `${this.PREFIX}/fetchWellIdsInBounds`,
    async (bounds: RepositoryBoundingBoxSpec) => {
      throw new Error('Not yet implemented');
    }
  );
}

export default WellCache;
