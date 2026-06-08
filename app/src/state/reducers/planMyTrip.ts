import { createNextState } from '@reduxjs/toolkit';
import { buffer } from '@turf/turf';
import { GeoJSON } from 'geojson';
import { RootState } from 'state/reducers/rootReducer';
import GeoShapes from 'constants/geoShapes';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';

/**
 * @property {GeoJSON} [drawnShape] Current Drawing created for a Trips creation
 * @property {number}   number      Timestamp of the last time a trip's data was refreshed.
 *                                  Used to keep trip pages updated (while viewing) without storing all trip data in memory.
 */
interface PlanMyTripState {
  drawnShape: GeoJSON.Polygon | GeoJSON.MultiPolygon | undefined;
  lastUpdate: number;
}

const defaultState: PlanMyTripState = {
  drawnShape: undefined,
  lastUpdate: 0
};

function createPlanMyTripReducer(): (AlertsAndPromptsState, AnyAction) => PlanMyTripState {
  return (state: PlanMyTripState = defaultState, action) => {
    return createNextState(state, (draftState) => {
      if (PlanMyTrip.setShape.match(action)) {
        const { geometry } = action.payload;
        draftState.drawnShape = (() => {
          if (geometry.type === GeoShapes.Point || geometry.type === GeoShapes.LineString) {
            return buffer(geometry, 1, { units: 'meters' })?.geometry;
          } else if (geometry.type === GeoShapes.Polygon || geometry.type === GeoShapes.MultiPolygon) {
            return geometry;
          } else {
            throw new Error(`Unexpected geojson type: ${geometry.type}`);
          }
        })();
      } else if (PlanMyTrip.clearShape.match(action)) {
        delete draftState.drawnShape;
      } else if (PlanMyTrip.refresh.match(action)) {
        draftState.lastUpdate = Date.now();
      }
    });
  };
}

const selectPlanMyTrip = (state: RootState) => state.PlanMyTrip;

export { createPlanMyTripReducer, selectPlanMyTrip };
export type { PlanMyTripState };
