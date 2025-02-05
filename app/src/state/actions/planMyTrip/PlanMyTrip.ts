import { createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import TileCache from '../cache/TileCache';
import { RootState } from 'state/reducers/rootReducer';
import WellCache from '../cache/WellCache';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';

/**
 * @desc Parameters for a user planning their trip
 * @property { boolean } [activities] include download for Activity records
 * @property { boolean } [iapp] include download for IAPP records
 * @property { string } name non-unique user friendly identifier
 * @property { number } [zoom] Zoom level for caching Map tile data
 * @property { boolean } [wellData] include Well Data for area.
 * @property { boolean } [wmsLayers] include currently toggled WMS layers in dataset.
 */
export interface ICreateMyTrip {
  activities?: boolean;
  iapp?: boolean;
  name: string;
  zoom?: number;
  wellData?: boolean;
  wmsLayers?: boolean;
}

class PlanMyTrip {
  static readonly PREFIX = 'PlanMyTrip';

  /**
   * @desc Calls the caching mechanisms synchronously to avoid overloading our concurrent calls.
   *       Creates and uses a common ID to track all sub-caches during the delete.
   * @param { ICreateMyTrip } spec Trip details with boolean flags for datasets requested.
   */
  static readonly create = createAsyncThunk(
    `${this.PREFIX}/create`,
    async (spec: ICreateMyTrip, { dispatch, getState }) => {
      const tripId = `pmt-${nanoid()}`;
      const state: RootState = getState() as RootState;
      if (!state.TileCache?.drawnShapeBounds) throw Error('No shape for Trip');

      const shape = state.TileCache.drawnShapeBounds as RepositoryBoundingBoxSpec;
      if (spec?.zoom) {
        await dispatch(
          TileCache.requestCaching({
            description: spec.name,
            id: tripId,
            bounds: shape,
            maxZoom: spec.zoom
          })
        );
      }
      if (spec?.wellData) {
        await dispatch(
          WellCache.requestCaching({
            bounds: shape,
            id: tripId
          })
        );
      }
    }
  );

  /**
   * @desc Delete a Planned Trip and all of its subcaches synchronously.
   */
  static readonly delete = createAsyncThunk(`${this.PREFIX}/delete`, async (id: string, { dispatch }) => {
    dispatch(WellCache.deleteRepository(id));
    dispatch(TileCache.deleteRepository(id));
  });
}
export default PlanMyTrip;
