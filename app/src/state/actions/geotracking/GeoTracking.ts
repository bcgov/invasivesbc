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
   * @desc Action Creator for editing Geotracking shape
   */
  static readonly edit = createAction<boolean>(`${this.PREFIX}/edit`);

  /**
   * @desc Action Creator for resuming Geotracking, allowing points to start being placed again
   */
  static readonly resume = createAction(`${this.PREFIX}/resume`);

  /**
   * @desc Action Creator for clearing Geotracking feature and nothing else
   */
  static readonly exitDrawing = createAction(`${this.PREFIX}/exitDrawing`);

  /**
   * @desc Action Creator for exiting GeoTracking feature
   */
  static readonly exit = createAction(`${this.PREFIX}/exit`);

  /**
   * @desc Action creator that triggers a saga to evaluate and either end or exit Geotracking
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
