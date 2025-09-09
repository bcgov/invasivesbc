import {
  CircleLayerSpecification,
  ColorSpecification,
  ExpressionSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification
} from 'maplibre-gl';
import { FALLBACK_COLOR } from '../constants';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';
import recordsetColourScheme from 'constants/recordsetColourScheme';
import { white } from 'constants/colors';

interface LayerOptions {
  layerId: string;
  sourceId: string;
  minzoom?: number;
  maxzoom?: number;
  visibility: 'visible' | 'none';
  'source-layer'?: string | undefined;
}

interface PaintLayerOptions extends LayerOptions {
  color: ColorSpecification | ExpressionSpecification;
}

interface LabelOptions extends LayerOptions {
  get_tag?: string;
}

const createFillLayer = (options: PaintLayerOptions): FillLayerSpecification => ({
  id: 'fill-' + options.layerId,
  source: options.sourceId,
  'source-layer': options?.['source-layer'],
  type: 'fill',
  paint: {
    'fill-color': options.color,
    'fill-outline-color': options.color,
    'fill-opacity': 0.5
  },
  minzoom: options?.minzoom ?? 0,
  maxzoom: options?.maxzoom ?? 24
});

const createBorderLayer = (options: PaintLayerOptions): LineLayerSpecification => ({
  id: 'polygon-border-' + options.layerId,
  source: options.sourceId,
  'source-layer': options?.['source-layer'],
  type: 'line',
  paint: {
    'line-color': options.color,
    'line-opacity': 1,
    'line-width': 3
  },
  minzoom: options?.minzoom ?? 0,
  maxzoom: options?.maxzoom ?? 24
});

const createCircleLayer = (options: PaintLayerOptions): CircleLayerSpecification => ({
  id: 'polygon-circle-' + options.layerId,
  source: options.sourceId,
  'source-layer': options?.['source-layer'],
  type: 'circle',
  paint: {
    'circle-color': options.color,
    'circle-radius': 4
  },
  minzoom: options?.minzoom ?? 0,
  maxzoom: options?.maxzoom ?? 24
});

const createLabelLayer = (options: LabelOptions): SymbolLayerSpecification => ({
  id: 'label-' + options.layerId,
  source: options.sourceId,
  'source-layer': options?.['source-layer'],
  type: 'symbol',
  layout: {
    'text-field': [
      'format',
      ['get', options.get_tag ?? 'short_id'],
      { 'font-scale': 0.9 },
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
  maxzoom: options?.maxzoom ?? 24
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
