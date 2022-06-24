import { NETWORK_GO_OFFLINE, NETWORK_GO_ONLINE } from '../actions';

interface Network {
  connected: boolean;
}

function createNetworkReducer(initialStatus: Network) {
  const initialState: Network = {
    ...initialStatus
  };

  return (state = initialState, action) => {
    switch (action.type) {
      case NETWORK_GO_ONLINE: {
        return {
          ...state,
          connected: true
        };
      }
      case NETWORK_GO_OFFLINE: {
        return {
          ...state,
          connected: false
        };
      }
      default:
        return state;
    }
  };
}

const selectNetworkConnected: (state) => boolean = (state) => state.Network.connected;

export { selectNetworkConnected, createNetworkReducer };
