import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import NetworkActions from 'state/actions/network/NetworkActions';

const HEARTBEATS_TO_FAILURE = 4;

/**
 * @desc Network State properties
 * @property { boolean } administrativeStatus user opt-in status for connecting to network
 * @property { boolean } connected Combination variable for User wanting network connection, and connection being available
 * @property { number }  consecutiveHeartbeatFailures current number of concurrent failed health checks
 * @property { boolean } operationalStatus status of connection to the API
 */
interface NetworkState {
  administrativeStatus: boolean;
  connected: boolean;
  consecutiveHeartbeatFailures: number;
  operationalStatus: boolean;
}

const initialState: NetworkState = {
  administrativeStatus: true,
  connected: true,
  consecutiveHeartbeatFailures: 0,
  operationalStatus: true
};

function createNetworkReducer() {
  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<NetworkState>) => {
      if (NetworkActions.setAdministrativeStatus.match(action)) {
        draftState.administrativeStatus = action.payload;
        draftState.consecutiveHeartbeatFailures = HEARTBEATS_TO_FAILURE;
      } else if (NetworkActions.updateConnectionStatus.match(action)) {
        if (action.payload) {
          draftState.consecutiveHeartbeatFailures = 0;
        } else {
          draftState.consecutiveHeartbeatFailures++;
        }
        draftState.operationalStatus = draftState.consecutiveHeartbeatFailures < HEARTBEATS_TO_FAILURE;
      } else if (NetworkActions.online.match(action)) {
        draftState.connected = true;
      } else if (NetworkActions.offline.match(action)) {
        draftState.connected = false;
      }
    });
  };
}

const selectNetworkConnected: (state) => boolean = (state) => state.Network.connected;
const selectNetworkState: (state) => NetworkState = (state) => state.Network;
export { createNetworkReducer, selectNetworkConnected, selectNetworkState };
export type { NetworkState };
