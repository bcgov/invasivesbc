import { LAYER_Z_FOREGROUND } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

const drawControlLayerStyles = [
  {
    id: 'gl-edited-line.hot',
    type: 'line',
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    filter: ['all', ['==', 'active', 'true']],
    paint: {
      'line-color': '#FCBA19',
      'line-dasharray': [0.2, 2],
      'line-width': 3
    },
    slot: LAYER_Z_FOREGROUND
  },
  {
    id: 'gl-drawn-line.hot',
    type: 'line',
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    filter: ['all', ['==', 'active', 'false'], ['!=', 'user_error', 'true']],
    paint: {
      'line-color': '#FCBA19',
      'line-width': 3
    },
    slot: LAYER_Z_FOREGROUND
  },
  {
    id: 'gl-drawn-fill.hot',
    type: 'fill',
    layout: {},
    filter: ['all', ['==', 'active', 'false'], ['!=', 'user_error', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': 'white',
      'fill-opacity': 0.002
    },
    slot: LAYER_Z_FOREGROUND
  },
  {
    id: 'gl-error-line.hot',
    type: 'line',
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': ['match', ['get', 'user_error'], 'true', '#B00020', 'false', '#FCBA19', '#FCBA19'],
      'line-dasharray': [1, 2],
      'line-width': 3
    },
    slot: LAYER_Z_FOREGROUND
  },
  {
    id: 'gl-draw-polygon-point.hot',
    type: 'circle',
    paint: {
      'circle-radius': 3,
      'circle-color': ['match', ['get', 'user_error'], 'true', '#B00020', 'false', '#FCBA19', '#FCBA19'],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    },
    slot: LAYER_Z_FOREGROUND
  },
  {
    id: 'whats-here-box-start-point-marker',
    filter: ['all', ['==', 'mode', 'whats_here_box_mode'], ['==', 'meta:type', 'Point']],
    type: 'circle',
    paint: {
      'circle-radius': 4,
      'circle-color': '#FCBA19',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    },
    slot: LAYER_Z_FOREGROUND
  }
];

export default drawControlLayerStyles;
