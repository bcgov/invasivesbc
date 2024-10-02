import { createAction } from '@reduxjs/toolkit';
import GeoShapes from 'constants/geoShapes';
import {
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_START,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP
} from 'state/actions';

class GeoTracking {
  /**
   * @desc Action Creator for premature exit of GeoTracking Feature
   */
  static readonly earlyExit = createAction(MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE);

  /**
   * @desc Action Creator for starting the GeoTracking feature
   * @param {GeoShapes} type Feature type being created
   */
  static readonly start = createAction(MAP_TOGGLE_TRACK_ME_DRAW_GEO_START, (type: GeoShapes) => ({
    payload: { type }
  }));

  /**
   * @desc Action Creator for resuming Geotracking, allowing points to start being placed again
   */
  static readonly resume = createAction(MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME);

  /**
   * @desc Action Creator for completing GeoTracking feature
   */
  static readonly stop = createAction(MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP);

  /**
   * @desc Action Creator for pausing Geotracking, stopping points from being plotted
   */
  static readonly pause = createAction(MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE);
}

export default GeoTracking;
