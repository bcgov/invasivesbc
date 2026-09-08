import ControlOptions from '@mapbox-controls/ruler';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';

const DRAW_COLOR = '#CCFC19';
const CIRCLE_FILL = '#000';
const FONT_SIZE = 14;

/**
 * @desc Format distance values in m/km
 * @param n Incoming distance for points
 * @returns {string} e.g.: "10.2km"
 */
const distanceFormatter = (n: number) => {
  const _formatDistanceMeasurement = (val: number) =>
    val.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  const KM_IN_METERS = 1000;
  if (n / KM_IN_METERS > 1) {
    n /= KM_IN_METERS;
    return `${_formatDistanceMeasurement(n)}km`;
  }
  return `${_formatDistanceMeasurement(n)}m`;
};

const rulerConfig: ControlOptions['options'] = {
  units: 'meters',
  invisible: true,
  labelFormat: distanceFormatter,
  lineLayout: {
    'line-cap': 'round',
    'line-join': 'round',
    visibility: 'visible'
  },
  linePaint: {
    'line-color': DRAW_COLOR,
    'line-width': 3
  },
  markerLayout: {
    visibility: 'visible'
  },
  markerPaint: {
    'circle-color': CIRCLE_FILL,
    'circle-radius': 3,
    'circle-stroke-width': 2,
    'circle-stroke-color': DRAW_COLOR
  },
  labelLayout: {
    'text-field': ['get', 'distance'],
    'text-size': FONT_SIZE,
    'text-font': [VECTOR_MAP_FONT_FACE],
    'text-offset': [0, 1.2],
    'text-anchor': 'top'
  },
  labelPaint: {
    'text-color': '#222222',
    'text-halo-color': '#ffffff',
    'text-halo-width': 2
  }
};

export default rulerConfig;
