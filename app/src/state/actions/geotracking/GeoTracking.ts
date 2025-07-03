import { createAction } from '@reduxjs/toolkit';
import GeoShapes from 'constants/geoShapes';

class GeoTracking {
  private static readonly PREFIX = 'GeoTracking';

  /**
   * @desc Action Creator for starting the GeoTracking feature
   * @param {GeoShapes} type Feature type being created
   */
  static readonly start = createAction(`${this.PREFIX}/start`, (type: GeoShapes) => ({
    payload: { type }
  }));

  /**
   * @desc Action Creator for pausing Geotracking, stopping points from being plotted
   */
  static readonly pause = createAction(`${this.PREFIX}/pause`);

  /**
   * @desc Action Creator for resuming Geotracking, allowing points to start being placed again
   */
  static readonly resume = createAction(`${this.PREFIX}/resume`);

  /**
   * @desc Action Creator for premature exit of GeoTracking Feature on activity
   */
  static readonly earlyExit = createAction(`${this.PREFIX}/earlyExit`);

  /**
   * @desc Action Creator for clearing Geotracking feature and nothing else
   */
  static readonly exitDrawing = createAction(`${this.PREFIX}/exitDrawing`);

  /**
   * @desc Action Creator for exiting GeoTracking feature on map
   */
  static readonly exit = createAction(`${this.PREFIX}/exit`);

  /**
   * @desc Action Creator for triggering saga to evaluate and end geotracking
   */
  static readonly stop = createAction(`${this.PREFIX}/stop`);

  /**
   * @desc Action Creator for completing GeoTracking feature
   */
  static readonly end = createAction(`${this.PREFIX}/end`);

  /**
   * @desc Action creator to notify users that the Geo-tracking feature must be stopped before using other draw tools
   */
  static readonly modeLocked = createAction(`${this.PREFIX}/modeLocked`);
}

export default GeoTracking;
