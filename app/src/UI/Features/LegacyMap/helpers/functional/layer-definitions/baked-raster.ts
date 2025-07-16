import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';
import {
  MapDefinitionEligibilityPredicatesBuilder,
  InvasivesMapLayerDefinition
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

const BAKED_RASTER_LAYERS: InvasivesMapLayerDefinition[] = [
  {
    displayName: 'Offline',
    selectionMode: 'primary-selector',
    name: 'offline_base_map',
    icon: 'OfflineSatellite',
    tooltip: 'Locally-stored low-resolution base map',
    mode: 'basemap',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresNetwork(false)
      .mobileOnly(true)
      .requiresFeature('MAP_BAKED_RASTER_TILES')
      .build(),
    layers: [
      {
        id: `Offline-Raster`,
        type: 'raster',
        source: 'Baked-Raster',
        minzoom: 0
      },
      {
        id: 'overlay_tunnel_railway_transit',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        minzoom: 0,
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'tunnel'], ['==', 'class', 'transit']],
        layout: {
          'line-cap': 'butt',
          'line-join': 'miter'
        },
        paint: {
          'line-color': 'hsl(34, 12%, 66%)',
          'line-dasharray': [3, 3],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 16, 0.5]
        }
      },
      {
        id: 'overlay_housenumber',
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
        id: 'overlay_road_area_pier',
        type: 'fill',
        metadata: {},
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'class', 'pier']],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'fill-antialias': true,
          'fill-color': 'hsl(47, 26%, 88%)',
          'fill-opacity': 0.5
        }
      },
      {
        id: 'overlay_road_pier',
        type: 'line',
        metadata: {},
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'pier']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': 'hsl(47, 26%, 88%)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 15, 1, 17, 4.0],
          'line-opacity': 0.5
        }
      },
      {
        id: 'overlay_road_bridge_area',
        type: 'fill',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'Polygon'], ['in', 'brunnel', 'bridge']],
        layout: {},
        paint: {
          'fill-color': 'hsl(47, 26%, 88%)',
          'fill-opacity': 0.5
        }
      },
      {
        id: 'overlay_road_path',
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
          'line-opacity': 0.5,
          'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.25, 20, 9.0]
        }
      },
      {
        id: 'overlay_road_minor',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        minzoom: 13,
        filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'minor', 'service']],
        paint: {
          'line-color': 'hsl(0, 0%, 97%)',
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.8, 20, 0.15],
          'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.25, 20, 10.0]
        }
      },
      {
        id: 'overlay_tunnel_minor',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'tunnel'], ['==', 'class', 'minor_road']],
        layout: {
          'line-cap': 'butt',
          'line-join': 'miter'
        },
        paint: {
          'line-color': '#efefef',
          'line-dasharray': [0.36, 0.18],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.25, 14, 20.0]
        }
      },
      {
        id: 'overlay_tunnel_major',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: [
          'all',
          ['==', '$type', 'LineString'],
          ['==', 'brunnel', 'tunnel'],
          ['in', 'class', 'primary', 'secondary', 'tertiary', 'trunk']
        ],
        layout: {
          'line-cap': 'butt',
          'line-join': 'miter'
        },
        paint: {
          'line-color': '#fff',
          'line-dasharray': [0.28, 0.14],
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.5, 20, 30.0]
        }
      },
      {
        id: 'overlay_road_trunk_primary',
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
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.25, 14, 20.0]
        }
      },
      {
        id: 'overlay_road_secondary_tertiary',
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
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.25, 14, 10.0]
        }
      },
      {
        id: 'overlay_road_major_motorway',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'class', 'motorway']],
        layout: {},
        paint: {
          'line-color': '#B2F5D2',
          'line-offset': 0,
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.25, 14, 20.0]
        }
      },
      {
        id: 'overlay_railway-transit',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', 'class', 'transit'], ['!=', 'brunnel', 'tunnel']],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'line-color': 'hsl(34, 12%, 66%)',
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-width': 0.5
        }
      },
      {
        id: 'overlay_railway',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['==', 'class', 'rail'],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'line-color': 'hsl(34, 12%, 66%)',
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15]
        }
      },
      {
        id: 'overlay_waterway-bridge-case',
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
          'line-gap-width': ['interpolate', ['linear'], ['zoom'], 4, 0.25, 20, 30.0],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.25, 14, 20.0]
        }
      },
      {
        id: 'overlay_waterway-bridge',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'waterway',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'bridge']],
        layout: {},
        paint: {
          'line-color': '#5977d7',
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.25, 14, 20.0]
        }
      },
      {
        id: 'overlay_bridge_minor case',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'bridge'], ['==', 'class', 'minor_road']],
        layout: {
          'line-cap': 'butt',
          'line-join': 'miter'
        },
        paint: {
          'line-color': '#5977d7',
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-gap-width': ['interpolate', ['linear'], ['zoom'], 4, 0.25, 20, 30.0],
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.25, 20, 10.0]
        }
      },
      {
        id: 'overlay_bridge_major case',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: [
          'all',
          ['==', '$type', 'LineString'],
          ['==', 'brunnel', 'bridge'],
          ['in', 'class', 'primary', 'secondary', 'tertiary', 'trunk']
        ],
        layout: {
          'line-cap': 'butt',
          'line-join': 'miter'
        },
        paint: {
          'line-color': '#dedede',
          'line-gap-width': ['interpolate', ['linear'], ['zoom'], 12, 0.25, 20, 30.0],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 20, 10.0]
        }
      },
      {
        id: 'overlay_bridge_minor',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'bridge'], ['==', 'class', 'minor_road']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#efefef',
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.25, 14, 20.0]
        }
      },
      {
        id: 'overlay_bridge_major',
        type: 'line',
        source: 'Offline-Vector',
        'source-layer': 'transportation',
        filter: [
          'all',
          ['==', '$type', 'LineString'],
          ['==', 'brunnel', 'bridge'],
          ['in', 'class', 'primary', 'secondary', 'tertiary', 'trunk']
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#5977d7',
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 14, 0.15],
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.25, 14, 20.0]
        }
      },
      {
        id: 'overlay_admin_sub',
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
        id: 'overlay_admin_country_z0-4',
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
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 22, 15.0]
        }
      },
      {
        id: 'overlay_admin_country_z5-',
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
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 22, 15.0]
        }
      },
      {
        id: 'overlay_poi_label',
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
        id: 'overlay_airport-label',
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
        id: 'overlay_road_major_label',
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
          'text-size': ['interpolate', ['exponential', 2], ['zoom'], 10, 8, 20, 14.0],
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
        id: 'overlay_place_label_other',
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
          'text-size': ['interpolate', ['exponential', 2], ['zoom'], 6, 10, 12, 14],
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
        id: 'overlay_place_label_city',
        type: 'symbol',
        source: 'Offline-Vector',
        'source-layer': 'place',
        maxzoom: 16,
        filter: ['all', ['==', '$type', 'Point'], ['==', 'class', 'city']],
        layout: {
          'text-field': '{name:latin}\n{name:nonlatin}',
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-max-width': 10,
          'text-size': ['interpolate', ['exponential', 2], ['zoom'], 3, 12, 8, 16]
        },
        paint: {
          'text-color': 'hsl(0, 0%, 0%)',
          'text-halo-blur': 0,
          'text-halo-color': 'hsla(0, 0%, 100%, 0.75)',
          'text-halo-width': 2
        }
      },
      {
        id: 'overlay_country_label-other',
        type: 'symbol',
        source: 'Offline-Vector',
        'source-layer': 'place',
        maxzoom: 12,
        filter: ['all', ['==', '$type', 'Point'], ['==', 'class', 'country'], ['!has', 'iso_a2']],
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-max-width': 10,
          'text-size': ['interpolate', ['exponential', 2], ['zoom'], 3, 12, 8, 22],
          visibility: 'visible'
        },
        paint: {
          'text-color': 'hsl(0, 0%, 13%)',
          'text-halo-blur': 0,
          'text-halo-color': 'rgba(255,255,255,0.75)',
          'text-halo-width': 2
        }
      },
      {
        id: 'overlay_country_label',
        type: 'symbol',
        source: 'Offline-Vector',
        'source-layer': 'place',
        maxzoom: 12,
        filter: ['all', ['==', '$type', 'Point'], ['==', 'class', 'country'], ['has', 'iso_a2']],
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
          'text-max-width': 10,
          'text-size': ['interpolate', ['exponential', 2], ['zoom'], 3, 12, 8, 22],
          visibility: 'visible'
        },
        paint: {
          'text-color': 'hsl(0, 0%, 13%)',
          'text-halo-blur': 0,
          'text-halo-color': 'rgba(255,255,255,0.75)',
          'text-halo-width': 2
        }
      }
    ]
  }
];

export { BAKED_RASTER_LAYERS };
