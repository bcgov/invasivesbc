import { DrawCustomMode } from '@mapbox/mapbox-gl-draw';
import { GeoJSON } from 'geojson';

interface DoNothingModeState {}

interface DoNothingModeOptions {}

const DoNothing: DrawCustomMode<DoNothingModeState, DoNothingModeOptions> = {
  onSetup: function (_opts: DoNothingModeOptions): DoNothingModeState {
    return {};
  },

  toDisplayFeatures: (state: DoNothingModeState, geojson: GeoJSON, display: (geojson: GeoJSON) => void) => {
    display(geojson);
  }
};

export { DoNothing };
