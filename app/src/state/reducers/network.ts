import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import NetworkActions from 'state/actions/network/NetworkActions';

interface Network {
  connected: boolean;
}

function createNetworkReducer(initialStatus: Network) {
  const initialState: Network = {
    ...initialStatus
  };

  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<Network>) => {
      if (NetworkActions.online.match(action)) {
        draftState.connected = true;
      } else if (NetworkActions.offline.match(action)) {
        draftState.connected = false;
      }
    });
  };
}

const selectNetworkConnected: (state) => boolean = (state) => state.Network.connected;

export { selectNetworkConnected, createNetworkReducer };
