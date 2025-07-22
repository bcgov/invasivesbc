import { createNextState } from '@reduxjs/toolkit';
import { GeoJSON } from 'geojson';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';

interface PlanMyTripState {
  drawnShape?: GeoJSON;
}

function createPlanMyTripReducer(): (AlertsAndPromptsState, AnyAction) => PlanMyTripState {
  return (state: PlanMyTripState = {}, action) => {
    return createNextState(state, (draftState) => {
      if (PlanMyTrip.setShape.match(action)) {
        draftState.drawnShape = action.payload.geometry;
      } else if (PlanMyTrip.clearShape.match(action)) {
        delete draftState.drawnShape;
      }
    });
  };
}

const selectPlanMyTrip = (state) => state.planMyTrip;

export { createPlanMyTripReducer, selectPlanMyTrip };
export type { PlanMyTripState };
