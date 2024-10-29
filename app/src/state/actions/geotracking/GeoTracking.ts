import { createAction } from '@reduxjs/toolkit';
import GeoShapes from 'constants/geoShapes';

class GeoTracking {
  private static readonly PREFIX = 'GeoTracking';
  /**
   * @desc Action Creator for premature exit of GeoTracking Feature
   */
  static readonly earlyExit = createAction(`${this.PREFIX}/earlyExit`);

  /**
   * @desc Action Creator for starting the GeoTracking feature
   * @param {GeoShapes} type Feature type being created
   */
  static readonly start = createAction(`${this.PREFIX}/start`, (type: GeoShapes) => ({
    payload: { type }
  }));

  /**
   * @desc Action Creator for resuming Geotracking, allowing points to start being placed again
   */
  static readonly resume = createAction(`${this.PREFIX}/resume`);

  /**
   * @desc Action Creator for completing GeoTracking feature
   */
  static readonly stop = createAction(`${this.PREFIX}/stop`);

  /**
   * @desc Action Creator for pausing Geotracking, stopping points from being plotted
   */
  static readonly pause = createAction(`${this.PREFIX}/pause`);
}

export default GeoTracking;
