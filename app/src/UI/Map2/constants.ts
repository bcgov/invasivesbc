import { LayerSpecification, SourceSpecification } from 'maplibre-gl';

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
  icon: 'N/A' | 'Hd' | 'Sd' | 'Landscape' | 'Map' | 'Offline';
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
    displayName: 'Offline',
    name: 'offline_base_map',
    icon: 'Offline',
    tooltip: 'Locally stored base map',
    predicates: new MapDefinitionEligibilityPredicatesBuilder().requiresNetwork(false).mobileOnly(true).build(),
    source: {
      type: 'raster',
      tiles: ['baked://offline/{z}/{x}/{y}'],
      tileSize: 256,
      attribution: 'Powered by ESRI',
      maxzoom: 6 // must match bundled tiles
    },
    layers: [
      {
        id: `Offline-Topo`,
        type: 'raster',
        source: 'offline_base_map',
        minzoom: 0
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
      //url: `pmtiles://${PMTILES_URL}`
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
          'text-font': ['literal', ['Open Sans Bold']],
          // 'text-font': ['literal', ['Open Sans Semibold']],
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
          'text-font': ['literal', ['Open Sans Bold']],
          // 'text-font': ['literal', ['Open Sans Semibold']],
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
