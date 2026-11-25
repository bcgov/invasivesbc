import { DrawCustomMode } from '@mapbox/mapbox-gl-draw';
import { GeoJSON } from 'geojson';

type DoNothingModeState = Record<PropertyKey, never>;

type DoNothingModeOptions = Record<PropertyKey, never>;

const DoNothing: DrawCustomMode<DoNothingModeState, DoNothingModeOptions> = {
  onSetup: function (_opts: DoNothingModeOptions): DoNothingModeState {
    return {};
  },

  toDisplayFeatures: (state: DoNothingModeState, geojson: GeoJSON, display: (geojson: GeoJSON) => void) => {
    display(geojson);
  }
};

export { DoNothing };
