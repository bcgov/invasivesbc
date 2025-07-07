import { buildTimeConfig } from 'state/configuration/build-time-config';
import {
  InvasivesMapLayerDefinition,
  LAYER_Z_FOREGROUND,
  MapDefinitionEligibilityPredicatesBuilder
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

const DATABC_LAYERS: InvasivesMapLayerDefinition[] = [
  {
    displayName: 'Regional Districts',
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
  }
  // {
  //   displayName: 'BC Parks',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW',
  //   toggle: false
  // },
  // {
  //   displayName: 'Conservancy Areas',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_TANTALIS.TA_CONSERVANCY_AREAS_SVW',
  //   toggle: false
  // },
  // {
  //   displayName: 'Municipality Boundaries',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP',
  //   toggle: false
  // },
  // {
  //   displayName: 'Cut blocks',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_FOREST_VEGETATION.VEG_CONSOLIDATED_CUT_BLOCKS_SP',
  //   toggle: false,
  //   opacity: 0.5
  // },
  // {
  //   displayName: 'BC Major Watersheds',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS',
  //   toggle: false
  // },
  // {
  //   displayName: 'Freshwater Atlas Rivers',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_BASEMAPPING.FWA_RIVERS_POLY',
  //   toggle: false
  // },
  // {
  //   displayName: 'Freshwater Lakes',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_LAND_AND_NATURAL_RESOURCE.EAUBC_LAKES_SP',
  //   toggle: false
  // },
  // {
  //   displayName: 'Freshwater Atlas Stream Network',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP',
  //   toggle: false
  // },
  // {
  //   displayName: 'Water Licenses Drinking Water',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_WATER_MANAGEMENT.WLS_BC_POD_DRINKNG_SOURCES_SP',
  //   toggle: false
  // },
  // {
  //   displayName: 'Water Rights Licenses',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_WATER_MANAGEMENT.WLS_WATER_RIGHTS_LICENCES_SV',
  //   toggle: false
  // },
  // {
  //   displayName: 'Water Wells',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
  //   toggle: false
  // },
  // {
  //   displayName: 'Digital Road Atlas (DRA) - Master Partially-Attributed Roads',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP',
  //   toggle: false
  // },
  // {
  //   displayName: 'MOTI RFI',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
  //     'WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP',
  //   toggle: false
  // },
  // {
  //   displayName: 'PMBC Parcel Cadastre - Private',
  //   type: 'overlay',
  //   url:
  //     'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&style=5899&OWNER_TYPE=Private&raster-opacity=0.5&styles=5903&layers=' +
  //     'WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW',
  //   toggle: false,
  //   opacity: 0.6
  // }
];

DATABC_LAYERS.sort((a: InvasivesMapLayerDefinition, b: InvasivesMapLayerDefinition) =>
  a.displayName < b.displayName ? -1 : 1
);

export const addWMSLayersIfNotExist = (simplePickerLayers2: any, map, API_BASE) => {
  simplePickerLayers2.map((layer) => {
    if (!map.getSource(layer.url) && layer.toggle && layer.type === 'wms') {
      map
        .addSource(layer.url, {
          type: 'raster',
          tiles: buildTimeConfig.MOBILE
            ? [`${API_BASE}/api/proxy/openmaps?bbox={bbox-epsg-3857}&url=${encodeURIComponent(layer.url)}`]
            : [layer.url],
          tileSize: 256,
          maxzoom: 18
        })
        .addLayer(
          {
            id: layer.url,
            type: 'raster',
            source: layer.url,
            minzoom: 0,
            paint: {
              'raster-opacity': layer.opacity ? layer.opacity : 1
            }
          },
          LAYER_Z_FOREGROUND
        );
    }
    if (layer.toggle) {
      // bring to top
      map.moveLayer(layer.url, LAYER_Z_FOREGROUND);
    }
  });
};

export { DATABC_LAYERS };
