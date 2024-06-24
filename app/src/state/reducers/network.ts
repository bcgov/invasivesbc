import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { NETWORK_GO_OFFLINE, NETWORK_GO_ONLINE } from '../actions';

interface Network {
  connected: boolean;
}

function createNetworkReducer(initialStatus: Network) {
  const initialState: Network = {
    ...initialStatus
  };

  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<Network>) => {
      switch (action.type) {
        case NETWORK_GO_ONLINE: {
          draftState.connected = true;
          break;
        }
        case NETWORK_GO_OFFLINE: {
          draftState.connected = false;
          break;
        }
        default:
          break;
      }
    });
  };
}

const selectNetworkConnected: (state) => boolean = (state) => state.Network.connected;

export { selectNetworkConnected, createNetworkReducer };
