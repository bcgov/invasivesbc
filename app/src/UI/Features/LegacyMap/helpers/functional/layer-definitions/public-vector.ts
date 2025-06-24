import {
  MapDefinitionEligibilityPredicatesBuilder,
  InvasivesMapLayerDefinition
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';

const PUBLIC_VECTOR_LAYERS: InvasivesMapLayerDefinition[] = [
  {
    name: 'Public-Vector',

    displayName: 'Public Map',
    icon: 'Map',
    tooltip: 'Publicly Available Invasives Species Sites',

    mode: 'overlay',

    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresAnonymous(true)
      .requiresFeature('MAP_PUBLIC_VECTOR_LAYER')
      .build(),
    layers: [
      {
        id: 'invasivesbc-pmtile-vector',
        source: 'Public-Vector',
        'source-layer': 'invasives',
        type: 'fill',
        paint: {
          'fill-color': 'lightskyblue'
        },
        minzoom: 0,
        maxzoom: 24
      },
      {
        id: 'iapp-pmtile-vector',
        source: 'Public-Vector',
        'source-layer': 'iapp',
        type: 'circle',
        paint: {
          'circle-color': 'limegreen'
        },
        minzoom: 0,
        maxzoom: 24
      },
      {
        id: 'invasivesbc-pmtile-vector-label',
        source: 'Public-Vector',
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
        id: 'iapp-pmtile-vector-label',
        source: 'Public-Vector',
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

export { PUBLIC_VECTOR_LAYERS };
