import { SourceSpecification } from 'maplibre-gl/dist/maplibre-gl-dev';
import {
  InvasivesMapLayerDefinition,
  MapDefinitionEligibilityPredicatesBuilder
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';

/**
 * This file demonstrates how to statically add a downloaded (via capacitor plugin) layer to the map.
 *
 * After downloading a file (via the debug pane), adjust the filename here and rebuild to see it work
 */

// EDIT this to match
const DEMO_DOWNLOADED_FILENAME = 'vectors/protomaps-1756374660011.pmtiles';

const DEMO_SOURCES: { [key: string]: SourceSpecification } = {
  'Saved-Vector': {
    type: 'vector',
    url: `pmtiles://${DEMO_DOWNLOADED_FILENAME}`
  }
};

const DEMO_LAYERS: InvasivesMapLayerDefinition[] = [
  {
    name: 'Saved-Vector',
    selectionMode: 'primary-selector',
    displayName: 'Saved Vector Map (red)',
    mode: 'overlay',
    icon: 'OfflineVector',
    tooltip: 'Locally-saved public pmtiles map',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .mobileOnly(true)
      .requiresNetwork(false)
      .requiresAuthentication(false)
      .requiresFeature('OFFLINE_PROTOMAPS')
      .requiresDebug(true)
      .directlySelectable(true)
      .build(),
    layers: [
      {
        id: 'sv-invasivesbc-pmtile-vector',
        source: 'Saved-Vector',
        'source-layer': 'invasives',
        type: 'fill',
        paint: {
          'fill-color': 'purple'
        },
        minzoom: 0,
        maxzoom: 24
      },
      {
        id: 'sv-iapp-pmtile-vector',
        source: 'Saved-Vector',
        'source-layer': 'iapp',
        type: 'circle',
        paint: {
          'circle-color': 'crimson'
        },
        minzoom: 0,
        maxzoom: 24
      },
      {
        id: 'sv-invasivesbc-pmtile-vector-label',
        source: 'Saved-Vector',
        'source-layer': 'invasives',
        type: 'symbol',
        layout: {
          //                'icon-image': 'dog-park-11',
          'text-field': [
            'format',
            ['upcase', ['get', 'id']],
            { 'font-scale': 0.9 },
            '\n',
            {},
            ['get', 'map_symbol'],
            { 'font-scale': 0.9 }
          ], // the actual font names that work are here https://github.com/openmaptiles/fonts/blob/gh-pages/fontstacks.json
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': 'black',
          'text-halo-color': 'white',
          'text-halo-width': 1,
          'text-halo-blur': 1
        },
        minzoom: 0,
        maxzoom: 24
      },
      {
        id: 'sv-iapp-pmtile-vector-label',
        source: 'Saved-Vector',
        'source-layer': 'iapp',
        type: 'symbol',
        layout: {
          'text-field': [
            'format',
            ['concat', 'IAPP Site: ', ['get', 'site_id']],
            { 'font-scale': 0.9 },
            '\n',
            {},
            ['get', 'map_symbol'],
            { 'font-scale': 0.9 }
          ], // the actual font names that work are here https://github.com/openmaptiles/fonts/blob/gh-pages/fontstacks.json
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': 'black',
          'text-halo-color': 'white',
          'text-halo-width': 1,
          'text-halo-blur': 1
        },
        minzoom: 0,
        maxzoom: 24
      }
    ]
  }
];

export { DEMO_SOURCES, DEMO_LAYERS, DEMO_DOWNLOADED_FILENAME };
