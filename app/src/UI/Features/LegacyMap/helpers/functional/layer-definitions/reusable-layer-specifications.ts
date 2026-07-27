import { ColorSpecification, ExpressionSpecification, FilterSpecification } from 'maplibre-gl/dist/maplibre-gl-dev';
import { LAYER_Z_FOREGROUND, LayerSpecificationWithStackingOrder } from './types';
import { FALLBACK_COLOR } from 'UI/Features/LegacyMap/helpers/functional/constants';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';
import recordsetColourScheme from 'constants/recordsetColourScheme';
import { white } from 'constants/colors';

interface LayerOptions {
  layerId: string;
  sourceId: string;
  minzoom?: number;
  maxzoom?: number;
  'source-layer'?: string | undefined;
  filters?: FilterSpecification;
}

interface PaintLayerOptions extends LayerOptions {
  color: ColorSpecification | ExpressionSpecification;
}

interface LabelOptions extends LayerOptions {
  get_tag?: string;
  visibility: 'visible' | 'none';
}

const createFillLayer = (options: PaintLayerOptions): LayerSpecificationWithStackingOrder => ({
  id: 'fill-' + options.layerId,
  source: options.sourceId,
  ...(options['source-layer'] ? { 'source-layer': options['source-layer'] } : {}), // If not exist, don't have the key at all
  ...(options?.filters ? { filter: options.filters } : {}),
  type: 'fill',
  paint: {
    'fill-color': options.color,
    'fill-outline-color': options.color,
    'fill-opacity': 0.5
  },
  minzoom: options?.minzoom ?? 0,
  maxzoom: options?.maxzoom ?? 24,
  stackLayer: LAYER_Z_FOREGROUND
});

const createBorderLayer = (options: PaintLayerOptions): LayerSpecificationWithStackingOrder => ({
  id: 'polygon-border-' + options.layerId,
  source: options.sourceId,
  ...(options['source-layer'] ? { 'source-layer': options['source-layer'] } : {}), // If not exist, don't have the key at all
  ...(options?.filters ? { filter: options.filters } : {}),
  type: 'line',
  paint: {
    'line-color': options.color,
    'line-opacity': 1,
    'line-width': 3
  },
  minzoom: options?.minzoom ?? 0,
  maxzoom: options?.maxzoom ?? 24,
  stackLayer: LAYER_Z_FOREGROUND
});

const createCircleLayer = (options: PaintLayerOptions): LayerSpecificationWithStackingOrder => {
  // Block Drawing Vertices on Polygons in addition to global filters. Points still render as normal.
  const filter: FilterSpecification = options?.filters
    ? (['all', ['!=', '$type', 'Polygon'], options.filters] as FilterSpecification)
    : ['all', ['!=', '$type', 'Polygon']];

  return {
    id: 'polygon-circle-' + options.layerId,
    source: options.sourceId,
    ...(options['source-layer'] ? { 'source-layer': options['source-layer'] } : {}), // If not exist, don't have the key at all
    filter: filter,
    type: 'circle',
    paint: {
      'circle-color': options.color,
      'circle-radius': 4
    },
    minzoom: options?.minzoom ?? 0,
    maxzoom: options?.maxzoom ?? 24,
    stackLayer: LAYER_Z_FOREGROUND
  };
};

const createLabelLayer = (options: LabelOptions): LayerSpecificationWithStackingOrder => ({
  id: 'label-' + options.layerId,
  source: options.sourceId,
  ...(options['source-layer'] ? { 'source-layer': options['source-layer'] } : {}), // If not exist, don't have the key at all
  ...(options?.filters ? { filter: options.filters } : {}),
  type: 'symbol',
  layout: {
    'text-field': [
      'format',
      ...(options.get_tag
        ? [['get', options.get_tag], { 'font-scale': 0.9 }]
        : [['get', 'short_id'], { 'font-scale': 0.9 }, ['get', 'site_id'], { 'font-scale': 0.9 }]),
      '\n',
      {},
      ['get', 'map_symbol'],
      { 'font-scale': 0.9 }
    ],
    // the actual font names that work are here https://github.com/openmaptiles/fonts/blob/gh-pages/fontstacks.json
    'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
    'text-offset': [0, 0.6],
    'text-anchor': 'top',
    visibility: options.visibility
  },
  paint: {
    'text-color': 'black',
    'text-halo-color': 'white',
    'text-halo-width': 1,
    'text-halo-blur': 1
  },
  minzoom: options?.minzoom ?? 0,
  maxzoom: options?.maxzoom ?? 24,
  stackLayer: LAYER_Z_FOREGROUND
});

const getPaintBySchemeOrColor = (color: string): ColorSpecification | ExpressionSpecification => {
  if (color === white) {
    const activitySubtypeColours = Object.entries(recordsetColourScheme).flatMap(([activity, colour]) => [
      activity,
      colour ?? FALLBACK_COLOR
    ]);
    return [
      'match',
      ['get', 'activity_subtype'],
      ...activitySubtypeColours,
      color ?? FALLBACK_COLOR
    ] as unknown as ExpressionSpecification;
  }
  return color ?? FALLBACK_COLOR;
};

export { createLabelLayer, createCircleLayer, createBorderLayer, createFillLayer, getPaintBySchemeOrColor };
export type { LayerOptions };
