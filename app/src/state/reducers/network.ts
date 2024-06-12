import { NETWORK_GO_OFFLINE, NETWORK_GO_ONLINE } from 'state/actions';

interface Network {
  connected: boolean;
}

function createNetworkReducer(initialStatus: Network) {
  const initialState: Network = {
    ...initialStatus
  };

  return (state = initialState, action) => {
    if (NETWORK_GO_ONLINE.match(action)) {
      return {
        ...state,
        connected: true
      };
    }
    if (NETWORK_GO_OFFLINE.match(action)) {
      return {
        ...state,
        connected: false
      };
    }
    return state;
  };
}

const selectNetworkConnected: (state) => boolean = (state) => state.Network.connected;

export { selectNetworkConnected, createNetworkReducer };
