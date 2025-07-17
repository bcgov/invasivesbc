import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';
import {
  InvasivesMapLayerDefinition,
  MapDefinitionEligibilityPredicatesBuilder
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

const BAKED_VECTOR_LAYERS: InvasivesMapLayerDefinition[] = [
  {
    displayName: 'Simplified Offline Vector',
    selectionMode: 'primary-selector',
    name: 'Offline-Vector-Simplified',
    icon: 'OfflineVector',
    tooltip: 'Locally-stored high-resolution vector base map, simplified view',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresNetwork(false)
      .mobileOnly(true)
      .requiresFeature('MAP_SIMPLIFIED_BAKED_VECTOR_TILES')
      .build(),

    mode: 'basemap',
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': 'hsl(47, 26%, 88%)'
        }
      },
      {
        id: 'landuse-residential',
        type: 'fill',
        source: 'Offline-Vector',
        'source-layer': 'landuse',
        filter: ['all', ['==', '$type', 'Polygon'], ['in', 'class', 'residential', 'suburb', 'neighbourhood']],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'fill-color': 'hsl(47, 13%, 86%)',
          'fill-opacity': 0.7
        }
      },
      {
        id: 'landcover_grass',
        type: 'fill',
        source: 'Offline-Vector',
        'source-layer': 'landcover',
        filter: ['==', 'class', 'grass'],
        paint: {
          'fill-color': 'hsl(82, 46%, 72%)',
          'fill-opacity': 0.45
        }
      },
      {
        id: 'landcover_wood',
        type: 'fill',
        source: 'Offline-Vector',
        'source-layer': 'landcover',
        filter: ['==', 'class', 'wood'],
        paint: {
          'fill-color': 'hsl(82, 46%, 72%)',
          'fill-opacity': {
            type: 'exponential',
            stops: [
              [8, 0.6],
              [22, 1]
            ]
          }
        }
      },
      {
        id: 'water',
        type: 'fill',
        source: 'Offline-Vector',
        'source-layer': 'water',
        filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'intermittent', 1], ['!=', 'brunnel', 'tunnel']],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'fill-color': 'hsl(205, 56%, 73%)'
        }
      },
      {
        id: 'water_intermittent',
        type: 'fill',
        source: 'Offline-Vector',
        'source-layer': 'water',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'intermittent', 1]],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'fill-color': 'hsl(205, 56%, 73%)',
          'fill-opacity': 0.7
        }
      },
      {
        id: 'landcover-ice-shelf',
        type: 'fill',
        source: 'Offline-Vector',
        'source-layer': 'landcover',
        filter: ['==', 'subclass', 'ice_shelf'],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'fill-color': 'hsl(47, 26%, 88%)',
          'fill-opacity': 0.8
        }
      },
      {
        id: 'landcover-glacier',
        type: 'fill',
        source: 'Offline-Vector',
        'source-layer': 'landcover',
        filter: ['==', 'subclass', 'glacier'],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'fill-color': 'hsl(47, 22%, 94%)',
          'fill-opacity': {
            type: 'exponential',
            stops: [
              [0, 1],
              [8, 0.5]
            ]
          }
        }
      },
      {
        id: 'landcover_sand',
        type: 'fill',
        metadata: {},
        source: 'Offline-Vector',
        'source-layer': 'landcover',
        filter: ['all', ['in', 'class', 'sand']],
        paint: {
          'fill-antialias': false,
          'fill-color': 'rgba(232, 214, 38, 1)',
          'fill-opacity': 0.3
        }
      },
      {
        id: 'landuse',
        type: 'fill',
        source: 'Offline-Vector',
        'source-layer': 'landuse',
        filter: ['==', 'class', 'agriculture'],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'fill-color': '#eae0d0'
        }
      },
      {
        id: 'landuse_overlay_national_park',
        type: 'fill',
        source: 'Offline-Vector',
        'source-layer': 'landcover',
        filter: ['==', 'class', 'national_park'],
        paint: {
          'fill-color': '#E1EBB0',
          'fill-opacity': {
            type: 'exponential',
            stops: [
              [5, 0],
              [9, 0.75]
            ]
          }
        }
      },
      {
        id: 'waterway',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'waterway',
        filter: [
          'all',
          ['==', '$type', 'LineString'],
          ['!in', 'brunnel', 'tunnel', 'bridge'],
          ['!=', 'intermittent', 1]
        ],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'line-color': 'hsl(205, 56%, 73%)',
          'line-opacity': 1,
          'line-width': {
            type: 'exponential',
            stops: [
              [8, 1],
              [20, 8]
            ]
          }
        }
      },
      {
        id: 'waterway_intermittent',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'waterway',
        filter: [
          'all',
          ['==', '$type', 'LineString'],
          ['!in', 'brunnel', 'tunnel', 'bridge'],
          ['==', 'intermittent', 1]
        ],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'line-color': 'hsl(205, 56%, 73%)',
          'line-dasharray': [2, 1],
          'line-opacity': 1,
          'line-width': {
            type: 'exponential',
            stops: [
              [8, 1],
              [20, 8]
            ]
          }
        }
      },
      {
        id: 'housenumber',
        type: 'symbol',
        source: 'Offline-Vector',
        'source-layer': 'housenumber',
        minzoom: 17,
        filter: ['==', '$type', 'Point'],
        layout: {
          'text-field': '{housenumber}',
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-size': 10
        },
        paint: {
          'text-color': 'rgba(212, 177, 146, 1)'
        }
      },
      {
        id: 'road_path',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'path', 'track']],
        layout: {
          'line-cap': 'square',
          'line-join': 'bevel'
        },
        paint: {
          'line-color': 'hsl(0, 0%, 97%)',
          'line-dasharray': [1, 1],
          'line-width': {
            type: 'exponential',
            stops: [
              [4, 0.25],
              [20, 10]
            ]
          }
        }
      },
      {
        id: 'road_minor',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        minzoom: 13,
        filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'minor', 'service']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': 'hsl(0, 0%, 97%)',
          'line-width': {
            type: 'exponential',
            stops: [
              [4, 0.25],
              [20, 30]
            ]
          }
        }
      },
      {
        id: 'road_trunk_primary',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'trunk', 'primary']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#fff',
          'line-width': {
            type: 'exponential',
            stops: [
              [6, 0.5],
              [20, 30]
            ]
          }
        }
      },
      {
        id: 'road_secondary_tertiary',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'secondary', 'tertiary']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#fff',
          'line-width': {
            type: 'exponential',
            stops: [
              [6, 0.5],
              [20, 20]
            ]
          }
        }
      },
      {
        id: 'road_major_motorway',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'class', 'motorway']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': 'hsl(0, 0%, 100%)',
          'line-offset': 0,
          'line-width': {
            type: 'exponential',
            stops: [
              [8, 1],
              [16, 10]
            ]
          }
        }
      },
      {
        id: 'railway-transit',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', 'class', 'transit'], ['!=', 'brunnel', 'tunnel']],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'line-color': 'hsl(34, 12%, 66%)',
          'line-opacity': {
            type: 'exponential',
            stops: [
              [11, 0],
              [16, 1]
            ]
          }
        }
      },
      {
        id: 'railway',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['==', 'class', 'rail'],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'line-color': 'hsl(34, 12%, 66%)',
          'line-opacity': {
            type: 'exponential',
            stops: [
              [11, 0],
              [16, 1]
            ]
          }
        }
      },
      {
        id: 'waterway-bridge-case',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'waterway',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'bridge']],
        layout: {
          'line-cap': 'butt',
          'line-join': 'miter'
        },
        paint: {
          'line-color': '#bbbbbb',
          'line-gap-width': {
            type: 'exponential',
            stops: [
              [4, 0.25],
              [20, 30]
            ]
          },
          'line-width': {
            type: 'exponential',
            stops: [
              [12, 0.5],
              [20, 10]
            ]
          }
        }
      },
      {
        id: 'waterway-bridge',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'waterway',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'bridge']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': 'hsl(205, 56%, 73%)',
          'line-width': {
            type: 'exponential',
            stops: [
              [4, 0.25],
              [20, 30]
            ]
          }
        }
      },
      {
        id: 'admin_sub',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'boundary',
        filter: ['in', 'admin_level', 4, 6, 8],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'line-color': 'hsla(0, 0%, 60%, 0.5)',
          'line-dasharray': [2, 1]
        }
      },
      {
        id: 'admin_country_z0-4',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'boundary',
        minzoom: 0,
        maxzoom: 5,
        filter: ['all', ['<=', 'admin_level', 2], ['==', '$type', 'LineString'], ['!has', 'claimed_by']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: 'visible'
        },
        paint: {
          'line-color': 'hsl(0, 0%, 60%)',
          'line-width': {
            type: 'exponential',
            stops: [
              [3, 0.5],
              [22, 15]
            ]
          }
        }
      },
      {
        id: 'admin_country_z5-',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'boundary',
        minzoom: 5,
        filter: ['all', ['<=', 'admin_level', 2], ['==', '$type', 'LineString']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: 'visible'
        },
        paint: {
          'line-color': 'hsl(0, 0%, 60%)',
          'line-width': {
            type: 'exponential',
            stops: [
              [3, 0.5],
              [22, 15]
            ]
          }
        }
      },
      {
        id: 'poi_label',
        type: 'symbol',
        source: 'Offline-Vector',
        'source-layer': 'poi',
        minzoom: 14,
        filter: ['all', ['==', '$type', 'Point'], ['==', 'rank', 1]],
        layout: {
          'icon-size': 1,
          'text-anchor': 'top',
          'text-field': '{name:latin}\n{name:nonlatin}',
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-max-width': 8,
          'text-offset': [0, 0.5],
          'text-size': 11,
          visibility: 'visible'
        },
        paint: {
          'text-color': '#666',
          'text-halo-blur': 1,
          'text-halo-color': 'rgba(255,255,255,0.75)',
          'text-halo-width': 1
        }
      },
      {
        id: 'airport-label',
        type: 'symbol',
        source: 'Offline-Vector',
        'source-layer': 'aerodrome_label',
        minzoom: 10,
        filter: ['all', ['has', 'iata']],
        layout: {
          'icon-size': 1,
          'text-anchor': 'top',
          'text-field': '{name:latin}\n{name:nonlatin}',
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-max-width': 8,
          'text-offset': [0, 0.5],
          'text-size': 11,
          visibility: 'visible'
        },
        paint: {
          'text-color': '#666',
          'text-halo-blur': 1,
          'text-halo-color': 'rgba(255,255,255,0.75)',
          'text-halo-width': 1
        }
      },
      {
        id: 'road_major_label',
        type: 'symbol',
        source: 'Offline-Vector',
        'source-layer': 'transportation_name',
        minzoom: 13,
        filter: ['==', '$type', 'LineString'],
        layout: {
          'symbol-placement': 'line',
          'text-field': '{name:latin} {name:nonlatin}',
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-letter-spacing': 0.1,
          'text-rotation-alignment': 'map',
          'text-size': {
            type: 'exponential',
            stops: [
              [10, 8],
              [20, 14]
            ]
          },
          'text-transform': 'uppercase',
          visibility: 'visible'
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': 'hsl(0, 0%, 100%)',
          'text-halo-width': 2
        }
      },
      {
        id: 'place_label_other',
        type: 'symbol',
        source: 'Offline-Vector',
        'source-layer': 'place',
        minzoom: 8,
        filter: ['all', ['==', '$type', 'Point'], ['!in', 'class', 'city', 'state', 'country', 'continent']],
        layout: {
          'text-anchor': 'center',
          'text-field': '{name:latin}\n{name:nonlatin}',
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-max-width': 6,
          'text-size': {
            type: 'interval',
            stops: [
              [6, 10],
              [12, 14]
            ]
          },
          visibility: 'visible'
        },
        paint: {
          'text-color': 'hsl(0, 0%, 25%)',
          'text-halo-blur': 0,
          'text-halo-color': 'hsl(0, 0%, 100%)',
          'text-halo-width': 2
        }
      },
      {
        id: 'place_label_city',
        type: 'symbol',
        source: 'Offline-Vector',
        'source-layer': 'place',
        maxzoom: 16,
        filter: ['all', ['==', '$type', 'Point'], ['==', 'class', 'city']],
        layout: {
          'text-field': '{name:latin}\n{name:nonlatin}',
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-max-width': 10,
          'text-size': {
            type: 'interval',
            stops: [
              [3, 12],
              [8, 16]
            ]
          }
        },
        paint: {
          'text-color': 'hsl(0, 0%, 0%)',
          'text-halo-blur': 0,
          'text-halo-color': 'hsla(0, 0%, 100%, 0.75)',
          'text-halo-width': 2
        }
      }
    ]
  }
];
export { BAKED_VECTOR_LAYERS };
