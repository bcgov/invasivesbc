import { LayerSpecification, SourceSpecification } from 'maplibre-gl';

// base64-encoded blank tile image 256x256
export const FALLBACK_IMAGE =
  'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEW10NBjBBbqAAAAH0lEQVRoge3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAvg0hAAABmmDh1QAAAABJRU5ErkJggg==';

type MapDefinitionEligibilityPredicates = {
  directlySelectable: boolean;
  mobileOnly: boolean;
  webOnly: boolean;
  requiresNetwork: boolean;
  requiresAuthentication: boolean;
  requiresAnonymous: boolean;
};

class MapDefinitionEligibilityPredicatesBuilder {
  state: MapDefinitionEligibilityPredicates = {
    directlySelectable: true,
    mobileOnly: false,
    webOnly: false,
    requiresNetwork: true,
    requiresAuthentication: false,
    requiresAnonymous: false
  };

  directlySelectable(p?: boolean) {
    if (p !== undefined) {
      this.state.directlySelectable = p;
    } else {
      this.state.directlySelectable = true;
    }
    return this;
  }

  mobileOnly(p?: boolean) {
    if (p !== undefined) {
      this.state.mobileOnly = p;
    } else {
      this.state.mobileOnly = true;
    }
    return this;
  }

  webOnly(p?: boolean) {
    if (p !== undefined) {
      this.state.webOnly = p;
    } else {
      this.state.webOnly = true;
    }
    return this;
  }

  requiresNetwork(p?: boolean) {
    if (p !== undefined) {
      this.state.requiresNetwork = p;
    } else {
      this.state.requiresNetwork = true;
    }
    return this;
  }

  requiresAuthentication(p?: boolean) {
    if (p !== undefined) {
      this.state.requiresAuthentication = p;
    } else {
      this.state.requiresAuthentication = true;
    }
    return this;
  }

  requiresAnonymous(p?: boolean) {
    if (p !== undefined) {
      this.state.requiresAnonymous = p;
    } else {
      this.state.requiresAnonymous = true;
    }
    return this;
  }

  build() {
    return this.state;
  }
}

type MapSourceAndLayerDefinition = {
  name: string;

  displayName: string;

  // this is an optimization to prevent having to bundle all icons. you can add others here and corresponding lookup in BaseMapSelect.tsx
  icon: 'N/A' | 'Hd' | 'Sd' | 'Landscape' | 'Map' | 'Offline' | 'OfflineSatellite' | 'OfflineVector';
  tooltip: string;

  source: SourceSpecification;
  layers: LayerSpecification[];

  predicates: MapDefinitionEligibilityPredicates;
};

const MAP_DEFINITIONS: MapSourceAndLayerDefinition[] = [
  {
    name: 'Esri-Sat-Label-Source',

    displayName: 'Labels (source-only -- not selectable)',
    icon: 'N/A',
    tooltip: 'N/A',

    predicates: new MapDefinitionEligibilityPredicatesBuilder().directlySelectable(false).build(),
    source: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Powered by ESRI',
      maxzoom: 18
    },
    layers: []
  },
  {
    name: 'Esri-Sat-LayerHD',

    displayName: 'HD',
    icon: 'Hd',
    tooltip: 'High-resolution Aerial Imagery',

    predicates: new MapDefinitionEligibilityPredicatesBuilder().build(),
    source: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      attribution: 'Powered by ESRI',
      tileSize: 256,
      maxzoom: 24
    },
    layers: [
      {
        id: `Esri-Sat-LayerHD`,
        type: 'raster',
        source: 'Esri-Sat-LayerHD',
        minzoom: 0
      },
      {
        id: `Esri-Sat-LabelHD`,
        type: 'raster',
        source: 'Esri-Sat-Label-Source',
        minzoom: 0
      }
    ]
  },
  {
    name: 'Esri-Sat-LayerSD',

    displayName: 'SD',
    icon: 'Sd',
    tooltip: 'Standard-resolution Aerial Imagery',

    predicates: new MapDefinitionEligibilityPredicatesBuilder().build(),
    source: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      attribution: 'Powered by ESRI',
      tileSize: 256,
      maxzoom: 18
    },
    layers: [
      {
        id: `Esri-Sat-LayerSD`,
        type: 'raster',
        source: 'Esri-Sat-LayerSD',
        minzoom: 0
      },
      {
        id: `Esri-Sat-LabelSD`,
        type: 'raster',
        source: 'Esri-Sat-Label-Source',
        minzoom: 0
      }
    ]
  },
  {
    name: 'Esri-Topo',

    displayName: 'Topo',
    icon: 'Landscape',
    tooltip: 'Topographic Raster Map',

    predicates: new MapDefinitionEligibilityPredicatesBuilder().build(),
    source: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Powered by ESRI',
      maxzoom: 18
    },
    layers: [
      {
        id: `Esri-Topo`,
        type: 'raster',
        source: 'Esri-Topo',
        minzoom: 0,
        layout: {
          visibility: 'none'
        }
      }
    ]
  },
  {
    name: 'public_layer',

    displayName: 'Public Map',
    icon: 'Map',
    tooltip: 'Publicly Available Invasives Species Sites',

    predicates: new MapDefinitionEligibilityPredicatesBuilder().requiresAnonymous(true).build(),
    source: {
      type: 'vector',
      url: 'pmtiles://https://nrs.objectstore.gov.bc.ca/rzivsz/invasives-prod.pmtiles'
    },
    layers: [
      {
        id: `Esri-Topo-Public`,
        type: 'raster',
        source: 'Esri-Topo',
        minzoom: 0
      },
      {
        id: 'invasivesbc-pmtile-vector',
        source: 'public_layer',
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
        source: 'public_layer',
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
        source: 'public_layer',
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
          ],
          // the actual font names that work are here https://github.com/openmaptiles/fonts/blob/gh-pages/fontstacks.json
          'text-font': ['literal', ['Noto Sans Bold']],
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
        source: 'public_layer',
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
          ],
          // the actual font names that work are here https://github.com/openmaptiles/fonts/blob/gh-pages/fontstacks.json
          'text-font': ['literal', ['Noto Sans Bold']],
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
  },
  {
    displayName: 'Offline',
    name: 'offline_base_map',
    icon: 'OfflineSatellite',
    tooltip: 'Locally-stored low-resolution base map',
    predicates: new MapDefinitionEligibilityPredicatesBuilder().requiresNetwork(false).mobileOnly(true).build(),
    source: {
      type: 'raster',
      tiles: ['baked://offline/{z}/{x}/{y}'],
      tileSize: 256,
      attribution: 'Powered by ESRI',
      maxzoom: 10 // must match bundled tiles
    },
    layers: [
      {
        id: `Offline-Raster`,
        type: 'raster',
        source: 'offline_base_map',
        minzoom: 0
      }
    ]
  },
  {
    displayName: 'Offline Vector',
    name: 'offline_vector_map',
    icon: 'OfflineVector',
    tooltip: 'Locally-stored high-resolution vector base map',
    predicates: new MapDefinitionEligibilityPredicatesBuilder().requiresNetwork(false).mobileOnly(false).build(),
    source: {
      type: 'vector',
      url: 'pmtiles:///assets/tiles/tiles2.pmtiles',
      attribution: '© OpenMapTiles © OpenStreetMap contributors',
      maxzoom: 14 // must match bundled tiles
    },

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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        id: 'waterway-tunnel',
        type: 'line',
        source: 'offline_vector_map',
        'source-layer': 'waterway',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'tunnel']],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'line-color': 'hsl(205, 56%, 73%)',
          'line-dasharray': [3, 3],
          'line-gap-width': {
            type: 'interval',
            stops: [
              [12, 0],
              [20, 6]
            ]
          },
          'line-opacity': 1,
          'line-width': {
            type: 'exponential',

            stops: [
              [8, 1],
              [20, 2]
            ]
          }
        }
      },
      {
        id: 'waterway',
        type: 'line',
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        id: 'tunnel_railway_transit',
        type: 'line',
        source: 'offline_vector_map',
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
        id: 'building',
        type: 'fill',
        source: 'offline_vector_map',
        'source-layer': 'building',
        paint: {
          'fill-antialias': true,
          'fill-color': 'rgba(222, 211, 190, 1)',
          'fill-opacity': {
            type: 'exponential',
            stops: [
              [13, 0],
              [15, 1]
            ]
          },
          'fill-outline-color': {
            type: 'interval',
            stops: [
              [15, 'rgba(212, 177, 146, 0)'],
              [16, 'rgba(212, 177, 146, 0.5)']
            ]
          }
        }
      },
      {
        id: 'housenumber',
        type: 'symbol',
        source: 'offline_vector_map',
        'source-layer': 'housenumber',
        minzoom: 17,
        filter: ['==', '$type', 'Point'],
        layout: {
          'text-field': '{housenumber}',
          'text-font': ['literal', ['Noto Sans Bold']],
          'text-size': 10
        },
        paint: {
          'text-color': 'rgba(212, 177, 146, 1)'
        }
      },
      {
        id: 'road_area_pier',
        type: 'fill',
        metadata: {},
        source: 'offline_vector_map',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'class', 'pier']],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'fill-antialias': true,
          'fill-color': 'hsl(47, 26%, 88%)'
        }
      },
      {
        id: 'road_pier',
        type: 'line',
        metadata: {},
        source: 'offline_vector_map',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'pier']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': 'hsl(47, 26%, 88%)',
          'line-width': {
            type: 'exponential',
            stops: [
              [15, 1],
              [17, 4]
            ]
          }
        }
      },
      {
        id: 'road_bridge_area',
        type: 'fill',
        source: 'offline_vector_map',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'Polygon'], ['in', 'brunnel', 'bridge']],
        layout: {},
        paint: {
          'fill-color': 'hsl(47, 26%, 88%)',
          'fill-opacity': 0.5
        }
      },
      {
        id: 'road_path',
        type: 'line',
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        id: 'tunnel_minor',
        type: 'line',
        source: 'offline_vector_map',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'tunnel'], ['==', 'class', 'minor_road']],
        layout: {
          'line-cap': 'butt',
          'line-join': 'miter'
        },
        paint: {
          'line-color': '#efefef',
          'line-dasharray': [0.36, 0.18],
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
        id: 'tunnel_major',
        type: 'line',
        source: 'offline_vector_map',
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
        id: 'aeroway-area',
        type: 'fill',
        metadata: {
          'mapbox:group': '1444849345966.4436'
        },
        source: 'offline_vector_map',
        'source-layer': 'aeroway',
        minzoom: 4,
        filter: ['all', ['==', '$type', 'Polygon'], ['in', 'class', 'runway', 'taxiway']],
        layout: {
          visibility: 'visible'
        },
        paint: {
          'fill-color': 'rgba(255, 255, 255, 1)',
          'fill-opacity': {
            type: 'exponential',
            stops: [
              [13, 0],
              [14, 1]
            ]
          }
        }
      },
      {
        id: 'aeroway-taxiway',
        type: 'line',
        metadata: {
          'mapbox:group': '1444849345966.4436'
        },
        source: 'offline_vector_map',
        'source-layer': 'aeroway',
        minzoom: 12,
        filter: ['all', ['in', 'class', 'taxiway'], ['==', '$type', 'LineString']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: 'visible'
        },
        paint: {
          'line-color': 'rgba(255, 255, 255, 1)',
          'line-opacity': 1,
          'line-width': {
            type: 'exponential',
            stops: [
              [12, 1],
              [17, 10]
            ]
          }
        }
      },
      {
        id: 'aeroway-runway',
        type: 'line',
        metadata: {
          'mapbox:group': '1444849345966.4436'
        },
        source: 'offline_vector_map',
        'source-layer': 'aeroway',
        minzoom: 4,
        filter: ['all', ['in', 'class', 'runway'], ['==', '$type', 'LineString']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: 'visible'
        },
        paint: {
          'line-color': 'rgba(255, 255, 255, 1)',
          'line-opacity': 1,
          'line-width': {
            type: 'exponential',
            stops: [
              [11, 4],
              [17, 50]
            ]
          }
        }
      },
      {
        id: 'road_trunk_primary',
        type: 'line',
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        id: 'bridge_minor case',
        type: 'line',
        source: 'offline_vector_map',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'bridge'], ['==', 'class', 'minor_road']],
        layout: {
          'line-cap': 'butt',
          'line-join': 'miter'
        },
        paint: {
          'line-color': '#dedede',
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
        id: 'bridge_major case',
        type: 'line',
        source: 'offline_vector_map',
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
        id: 'bridge_minor',
        type: 'line',
        source: 'offline_vector_map',
        'source-layer': 'transportation',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'bridge'], ['==', 'class', 'minor_road']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#efefef',
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
        id: 'bridge_major',
        type: 'line',
        source: 'offline_vector_map',
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
        id: 'admin_sub',
        type: 'line',
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
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
        source: 'offline_vector_map',
        'source-layer': 'poi',
        minzoom: 14,
        filter: ['all', ['==', '$type', 'Point'], ['==', 'rank', 1]],
        layout: {
          'icon-size': 1,
          'text-anchor': 'top',
          'text-field': '{name:latin}\n{name:nonlatin}',
          'text-font': ['literal', ['Noto Sans Bold']],
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
        source: 'offline_vector_map',
        'source-layer': 'aerodrome_label',
        minzoom: 10,
        filter: ['all', ['has', 'iata']],
        layout: {
          'icon-size': 1,
          'text-anchor': 'top',
          'text-field': '{name:latin}\n{name:nonlatin}',
          'text-font': ['literal', ['Noto Sans Bold']],
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
        source: 'offline_vector_map',
        'source-layer': 'transportation_name',
        minzoom: 13,
        filter: ['==', '$type', 'LineString'],
        layout: {
          'symbol-placement': 'line',
          'text-field': '{name:latin} {name:nonlatin}',
          'text-font': ['literal', ['Noto Sans Bold']],
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
        source: 'offline_vector_map',
        'source-layer': 'place',
        minzoom: 8,
        filter: ['all', ['==', '$type', 'Point'], ['!in', 'class', 'city', 'state', 'country', 'continent']],
        layout: {
          'text-anchor': 'center',
          'text-field': '{name:latin}\n{name:nonlatin}',
          'text-font': ['literal', ['Noto Sans Bold']],
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
        source: 'offline_vector_map',
        'source-layer': 'place',
        maxzoom: 16,
        filter: ['all', ['==', '$type', 'Point'], ['==', 'class', 'city']],
        layout: {
          'text-field': '{name:latin}\n{name:nonlatin}',
          'text-font': ['literal', ['Noto Sans Bold']],
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
      },
      {
        id: 'country_label-other',
        type: 'symbol',
        source: 'offline_vector_map',
        'source-layer': 'place',
        maxzoom: 12,
        filter: ['all', ['==', '$type', 'Point'], ['==', 'class', 'country'], ['!has', 'iso_a2']],
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['literal', ['Noto Sans Bold']],
          'text-max-width': 10,
          'text-size': {
            type: 'interval',
            stops: [
              [3, 12],
              [8, 22]
            ]
          },
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
        id: 'country_label',
        type: 'symbol',
        source: 'offline_vector_map',
        'source-layer': 'place',
        maxzoom: 12,
        filter: ['all', ['==', '$type', 'Point'], ['==', 'class', 'country'], ['has', 'iso_a2']],
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['literal', ['Noto Sans Bold']],
          'text-max-width': 10,
          'text-size': {
            type: 'interval',
            stops: [
              [3, 12],
              [8, 22]
            ]
          },
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

// used to determine which layers we should turn on for a given group definition
function allLayerIdsInDefinition(definitionName: string): string[] {
  const group = MAP_DEFINITIONS.find((m) => m.name === definitionName);
  if (!group) {
    console.error(`invalid definition name ${definitionName}`);
    throw Error(`invalid definition name ${definitionName}`);
  }
  return group.layers.map((l) => l.id);
}

// ...and those we should turn off when it is deactivated
function allLayerIdsNotInDefinition(definitionName: string): string[] {
  const group = MAP_DEFINITIONS.find((m) => m.name === definitionName);
  if (!group) {
    console.error(`invalid definition name ${definitionName}`);
    throw Error(`invalid definition name ${definitionName}`);
  }
  return MAP_DEFINITIONS.flatMap((m) => m.layers)
    .filter((x) => !group.layers.map((l) => l.id).includes(x.id))
    .map((l) => l.id);
}

export { MAP_DEFINITIONS, allLayerIdsInDefinition, allLayerIdsNotInDefinition };
