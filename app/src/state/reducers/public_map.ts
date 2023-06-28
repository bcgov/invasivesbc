import { AppConfig } from 'state/config';
import { PUBLIC_MAP_LOAD_ALL_REQUEST, PUBLIC_MAP_LOAD_ALL_REQUEST_COMPLETE, PUBLIC_MAP_LOAD_ERROR } from '../actions';

class PublicMapLayers {
  initialized: boolean;
  layers: object;
  error: boolean;

  constructor() {
    this.initialized = false;
    this.error = false;
    this.layers = {};
  }
}

const initialState = new PublicMapLayers();

function createPublicMapReducer(configuration: AppConfig): (PublicMapLayers, AnyAction) => { PublicMapLayers } {
  return (state = initialState, action) => {
    switch (action.type) {
      case PUBLIC_MAP_LOAD_ALL_REQUEST:
        return {
          ...state,
          initialized: false,
          layers: {},
          error: false
        };
      case PUBLIC_MAP_LOAD_ERROR:
        return {
          ...state,
          initialized: false,
          layers: {},
          error: true
        };
      case PUBLIC_MAP_LOAD_ALL_REQUEST_COMPLETE:
        return {
          ...state,
          initialized: true,
          layers: {
            ...action.payload
          },
          error: false
        };
      default:
        return state;
    }
  };
}

const selectPublicMapState: (state) => PublicMapLayers = (state) => state.PublicMap;

export { createPublicMapReducer, selectPublicMapState };
