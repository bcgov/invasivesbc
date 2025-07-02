import type { DrawCustomMode } from '@mapbox/mapbox-gl-draw';
import type { Position, Feature, LineString, GeoJSON, Polygon } from 'geojson';
import { GEO_TRACKING_FEATURE } from './constants';
import GeoShapes from 'constants/geoShapes';

type GeoTrackingFeature = Feature<LineString | Polygon>;

type GeoTrackingState = {
  shape: GeoTrackingFeature;
};

type SetupOptions = {
  initialCoordinates?: Position;
};

const GeoTrackingContext = (() => {
  let state: GeoTrackingState | null = null;

  return {
    getState: () => state,
    setState: (newState: GeoTrackingState) => {
      state = newState;
    }
  };
})();

function handleClick(this: any, state: GeoTrackingState) {
  const featureId = state.shape.id;
  if (state.shape.properties?.active === 'false') {
    this.changeMode('direct_select', { featureId });
  }
}

const GeoTrackingMode: DrawCustomMode<GeoTrackingState, SetupOptions> = {
  onSetup(_opts: SetupOptions): GeoTrackingState {
    const shape: Feature<LineString> = {
      id: GEO_TRACKING_FEATURE,
      type: 'Feature',
      geometry: {
        type: GeoShapes.LineString,
        coordinates: []
      },
      properties: { _updated: Date.now() }
    };

    this.clearSelectedFeatures();
    this.updateUIClasses({ mouse: 'add' });

    const drawFeature = this.newFeature(shape);
    this.addFeature(drawFeature);

    return { shape };
  },

  onClick(state: GeoTrackingState) {
    handleClick.call(this, state);
  },

  onTap(state: GeoTrackingState) {
    handleClick.call(this, state);
  },

  toDisplayFeatures(state, _, display: (_: GeoJSON) => void) {
    try {
      GeoTrackingContext.setState(state);

      const { shape } = state;
      const { geometry, properties } = shape;

      const baseProperties = {
        ...properties,
        active: properties.user_error === 'false' ? 'true' : 'false'
      };

      if (geometry.type === GeoShapes.LineString && geometry.coordinates.length > 1) {
        display({ ...shape, properties: baseProperties });
      } else if (geometry.type === GeoShapes.Polygon) {
        display({ ...shape, properties: { ...baseProperties, active: 'false' } });
      }
    } catch (e) {
      console.error('Error in toDisplayFeatures:', e);
    }
  },

  onTrash(state: GeoTrackingState) {
    this.deleteFeature('' + state.shape.id, { silent: true });
    this.changeMode('simple_select');
  },

  onStop(state: GeoTrackingState) {
    if (state.shape) {
      this.map.fire('draw.create', {
        features: [state.shape]
      });
    }
  }
};

export { GeoTrackingMode };

/**
 * Updates the GPS coordinates of the current LineString feature.
 * @param coord - New coordinates array.
 * @param error - Error string used to trigger visual feedback
 */
export function updateGPSCoordinate(coord: Position[], error: string) {
  const state = GeoTrackingContext.getState();
  if (!state || state.shape.geometry.type !== GeoShapes.LineString) return;

  state.shape.geometry.coordinates = coord;
  state.shape.properties = {
    ...state.shape.properties,
    error,
    user_error: error,
    _updated: Date.now()
  };
}

/**
 * Converts the current LineString feature into a Polygon.
 * @param coords - Polygon coordinates.
 * @param error - Error string used to trigger visual feedback
 */
export function convertLineToPolygon(coords: Position[], error: string) {
  const state = GeoTrackingContext.getState();
  if (!state || !state.shape || !state.shape.geometry) return;
  console.log('Before', state.shape);

  state.shape = {
    ...state.shape,
    geometry: {
      type: GeoShapes.Polygon,
      coordinates: coords
    },
    properties: {
      ...state.shape.properties,
      error,
      user_error: error,
      fromTracking: true,
      _updated: Date.now()
    }
  };
  console.log('After', state.shape);
}
