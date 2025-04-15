import { createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { RootState } from 'state/reducers/rootReducer';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import { WellCacheServiceFactory } from 'utils/well-cache/context';
import DownloadActions from 'state/actions/downloads/DownloadActions';

/**
 * @desc Action Members for WellCaching
 *       Used for Caching Well Metadata for use in offline Chemical treatment forms.
 */
class WellCache {
  private static readonly PREFIX = 'WellCache';

  static readonly requestCaching = createAsyncThunk(
    `${this.PREFIX}/requestCaching`,
    async (spec: { bounds: RepositoryBoundingBoxSpec; id?: string }, { getState, dispatch }) => {
      await dispatch(DownloadActions.request());
      const id = spec.id ?? `well-records-${nanoid()}`;
      const state: RootState = getState() as RootState;
      const wellService = await WellCacheServiceFactory.getPlatformInstance();

      await wellService.download({
        API_BASE: state.Configuration.current.API_BASE,
        bounds: spec.bounds,
        id: id
      });
    }
  );

  static readonly deleteRepository = createAsyncThunk(`${this.PREFIX}/requestCaching`, async (repository: string) => {
    const wellService = await WellCacheServiceFactory.getPlatformInstance();
    await wellService.deleteRepository(repository);
  });
}

export default WellCache;
