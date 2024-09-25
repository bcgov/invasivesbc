import { createAction } from '@reduxjs/toolkit';
import GeoShapes from 'constants/geoShapes';
import {
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_START,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP
} from 'state/actions';

/**
 * @desc Action Creator for starting the GeoTracking feature
 * @param {GeoShapes} type Feature type being created
 */
export const startGeoTracking = createAction(MAP_TOGGLE_TRACK_ME_DRAW_GEO_START, (type: GeoShapes) => ({
  payload: { type }
}));

/**
 * @desc Action Creator for completing GeoTracking feature
 */
export const stopGeoTracking = createAction(MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP);

/**
 * @desc Action Creator for pausing Geotracking, stopping points from being plotted
 */
export const pauseGeoTracking = createAction(MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE);

/**
 * @desc Action Creator for resuming Geotracking, allowing points to start being placed again
 */
export const resumeGeoTracking = createAction(MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME);

/**
 * @desc Action Creator for premature exit of GeoTracking Feature
 */
export const closeGeoTracking = createAction(MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE);
