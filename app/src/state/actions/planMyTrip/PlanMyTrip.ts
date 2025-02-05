import { createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import TileCache from '../cache/TileCache';
import { RootState } from 'state/reducers/rootReducer';
import WellCache from '../cache/WellCache';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';

/**
 * @desc Parameters for a user planning their trip
 * @property { boolean } iapp include download for IAPP records
 * @property { string } name non-unique user friendly identifier
 */
export interface ICreateMyTrip {
  iapp?: boolean;
  name: string;
  records?: boolean;
  wellData?: boolean;
  wmsLayers?: boolean;
  zoom: number;
}

class PlanMyTrip {
  static readonly PREFIX = 'PlanMyTrip';

  static readonly create = createAsyncThunk(
    `${this.PREFIX}/create`,
    async (spec: ICreateMyTrip, { dispatch, getState }) => {
      const tripId = `pmt-${nanoid()}`;
      const state: RootState = getState() as RootState;

      if (!state.TileCache?.drawnShapeBounds) throw Error('No shape for Trip');

      const shape = state.TileCache.drawnShapeBounds as RepositoryBoundingBoxSpec;
      await dispatch(
        TileCache.requestCaching({
          description: spec.name,
          id: tripId,
          bounds: shape,
          maxZoom: spec.zoom
        })
      );
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

  static readonly delete = createAsyncThunk(`${this.PREFIX}/delete`, async (id: string, { dispatch }) => {
    await dispatch(WellCache.deleteRepository(id));
    await dispatch(TileCache.deleteRepository(id));
  });
}
export default PlanMyTrip;
