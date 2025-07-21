import { LayerSpecification, SourceSpecification } from 'maplibre-gl';
import {
  InvasivesMapLayerDefinition,
  MapDefinitionEligibilityPredicatesBuilder
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

const DATABC_SOURCES: { [key: string]: SourceSpecification } = {
  'wms-regional-districts': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP'
    ],
    maxzoom: 18
  },
  'wms-moti-rfi': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP'
    ],
    maxzoom: 18
  },
  'wms-conservancy-areas': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_TANTALIS.TA_CONSERVANCY_AREAS_SVW'
    ],
    maxzoom: 18
  },
  'wms-municipality-boundaries': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP'
    ],
    maxzoom: 18
  },
  'wms-cut-blocks': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_FOREST_VEGETATION.VEG_CONSOLIDATED_CUT_BLOCKS_SP'
    ],
    maxzoom: 18
  },
  'wms-bc-parks': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW'
    ],
    maxzoom: 18
  },
  'wms-major-watersheds': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS'
    ],
    maxzoom: 18
  },
  'wms-freshwater-atlas-rivers': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_BASEMAPPING.FWA_RIVERS_POLY'
    ],
    maxzoom: 18
  },
  'wms-freshwater-lakes': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_LAND_AND_NATURAL_RESOURCE.EAUBC_LAKES_SP'
    ],
    maxzoom: 18
  },
  'wms-freshwater-atlas-stream-network': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP'
    ],
    maxzoom: 18
  },
  'wms-water-licenses-drinking-water': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_WATER_MANAGEMENT.WLS_BC_POD_DRINKNG_SOURCES_SP'
    ],
    maxzoom: 18
  },
  'wms-water-rights-licenses': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_WATER_MANAGEMENT.WLS_WATER_RIGHTS_LICENCES_SV'
    ],
    maxzoom: 18
  },

  'wms-water-wells': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW'
    ],
    maxzoom: 18
  },

  'wms-roads': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP'
    ],
    maxzoom: 18
  },
  'wms-parcel-cadastre-private': {
    type: 'raster',
    tiles: [
      'databc://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&style=5899&OWNER_TYPE=Private&raster-opacity=0.5&styles=5903&layers=WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW'
    ],
    maxzoom: 18
  }
};
type DataBCMapLayerDefinition = InvasivesMapLayerDefinition & {
  layers: (LayerSpecification & { source: keyof typeof DATABC_SOURCES })[];
};

const DATABC_LAYERS: DataBCMapLayerDefinition[] = [
  {
    displayName: 'Regional Districts',
    selectionMode: 'layer-picker',
    tooltip: 'Regional Districts',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-regional-districts',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-regional-districts-layer',
        source: 'wms-regional-districts',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18,
        paint: {
          'raster-opacity': 0.4
        }
      }
    ]
  },
  {
    displayName: 'BC Parks',
    selectionMode: 'layer-picker',
    tooltip: 'BC Parks',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-bc-parks',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-bc-parks-layer',
        source: 'wms-bc-parks',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18
      }
    ]
  },
  {
    displayName: 'Conservancy Areas',
    selectionMode: 'layer-picker',
    tooltip: 'Conservancy Areas',
    icon: 'Map',
    name: 'wms-conservancy-areas',
    mode: 'overlay',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-conservancy-areas-layer',
        source: 'wms-conservancy-areas',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18
      }
    ]
  },
  {
    displayName: 'Municipality Boundaries',
    selectionMode: 'layer-picker',
    tooltip: 'Municipality Boundaries',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-municipality-boundaries',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-municipality-boundaries-layer',
        source: 'wms-municipality-boundaries',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18
      }
    ]
  },
  {
    displayName: 'Cut blocks',
    selectionMode: 'layer-picker',
    tooltip: 'Cut blocks',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-cut-blocks',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-cut-blocks-layer',
        source: 'wms-cut-blocks',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18,
        paint: {
          'raster-opacity': 0.5
        }
      }
    ]
  },
  {
    displayName: 'BC Major Watersheds',
    selectionMode: 'layer-picker',
    tooltip: 'BC Major Watersheds',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-major-watersheds',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-major-watersheds-layer',
        source: 'wms-major-watersheds',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18
      }
    ]
  },
  {
    displayName: 'Freshwater Atlas Rivers',
    selectionMode: 'layer-picker',
    tooltip: 'Freshwater Atlas Rivers',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-freshwater-atlas-rivers',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-freshwater-atlas-rivers-layer',
        source: 'wms-freshwater-atlas-rivers',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18
      }
    ]
  },
  {
    displayName: 'Freshwater Lakes',
    selectionMode: 'layer-picker',
    tooltip: 'Freshwater Lakes',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-freshwater-lakes',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-freshwater-lakes-layer',
        source: 'wms-freshwater-lakes',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18
      }
    ]
  },
  {
    displayName: 'Freshwater Atlas Stream Network',
    selectionMode: 'layer-picker',
    tooltip: 'Freshwater Atlas Stream Network',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-freshwater-atlas-stream-network',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-freshwater-atlas-stream-network-layer',
        source: 'wms-freshwater-atlas-stream-network',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18,
        paint: {
          'raster-opacity': 0.4
        }
      }
    ]
  },
  {
    displayName: 'Water Licenses Drinking Water',
    selectionMode: 'layer-picker',
    tooltip: 'Water Licenses Drinking Water',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-water-licenses-drinking-water',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-water-licenses-drinking-water-layer',
        source: 'wms-water-licenses-drinking-water',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18,
        paint: {
          'raster-opacity': 0.4
        }
      }
    ]
  },
  {
    displayName: 'Water Rights Licenses',
    selectionMode: 'layer-picker',
    tooltip: 'Water Rights Licenses',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-water-rights-licenses',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-water-rights-licenses-layer',
        source: 'wms-water-rights-licenses',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18
      }
    ]
  },
  {
    displayName: 'Water Wells',
    selectionMode: 'layer-picker',
    tooltip: 'Water Wells',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-water-wells',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-water-wells-layer',
        source: 'wms-water-wells',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18
      }
    ]
  },
  {
    displayName: 'Digital Road Atlas (DRA) - Master Partially-Attributed Roads',
    selectionMode: 'layer-picker',
    tooltip: 'Digital Road Atlas (DRA) - Master Partially-Attributed Roads',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-roads',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-roads-layer',
        source: 'wms-roads',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18
      }
    ]
  },
  {
    displayName: 'MOTI RFI',
    selectionMode: 'layer-picker',
    tooltip: 'MOTI RFI',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-moti-rfi',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-moti-rfi-layer',
        source: 'wms-moti-rfi',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18,
        paint: {
          'raster-opacity': 0.4
        }
      }
    ]
  },
  {
    displayName: 'PMBC Parcel Cadastre - Private',
    selectionMode: 'layer-picker',
    tooltip: 'PMBC Parcel Cadastre - Private',
    mode: 'overlay',
    icon: 'Map',
    name: 'wms-parcel-cadastre',
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .requiresFeature('MAP_DATABC_LAYERS')
      .requiresNetwork(true)
      .build(),
    layers: [
      {
        id: 'wms-parcel-cadastre-layer',
        source: 'wms-parcel-cadastre-private',
        type: 'raster',
        minzoom: 0,
        maxzoom: 18,
        paint: {
          'raster-opacity': 0.6
        }
      }
    ]
  }
];

DATABC_LAYERS.sort((a: InvasivesMapLayerDefinition, b: InvasivesMapLayerDefinition) =>
  a.displayName < b.displayName ? -1 : 1
);

export { DATABC_LAYERS, DATABC_SOURCES };
