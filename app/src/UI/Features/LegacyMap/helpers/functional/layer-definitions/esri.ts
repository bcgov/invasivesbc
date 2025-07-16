import {
  MapDefinitionEligibilityPredicatesBuilder,
  InvasivesMapLayerDefinition
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

const ESRI_LAYERS: InvasivesMapLayerDefinition[] = [
  {
    name: 'Esri-Sat-LayerHD',
    selectionMode: 'primary-selector',
    displayName: 'HD',
    icon: 'Hd',
    tooltip: 'High-resolution Aerial Imagery',

    mode: 'basemap',

    predicates: new MapDefinitionEligibilityPredicatesBuilder().requiresFeature('MAP_BASE_IMAGERY_LAYER').build(),
    layers: [
      {
        id: `Esri-Sat-LayerHD`,
        type: 'raster',
        source: 'Esri-Sat-Layer-HD',
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
    selectionMode: 'primary-selector',
    displayName: 'SD',
    icon: 'Sd',
    tooltip: 'Standard-resolution Aerial Imagery',

    mode: 'basemap',

    predicates: new MapDefinitionEligibilityPredicatesBuilder().requiresFeature('MAP_BASE_IMAGERY_LAYER').build(),
    layers: [
      {
        id: `Esri-Sat-LayerSD`,
        type: 'raster',
        source: 'Esri-Sat-Layer-SD',
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
    selectionMode: 'primary-selector',
    displayName: 'Topo',
    icon: 'Landscape',
    tooltip: 'Topographic Raster Map',
    mode: 'basemap',
    predicates: new MapDefinitionEligibilityPredicatesBuilder().requiresFeature('MAP_TOPO_LAYER').build(),
    layers: [
      {
        id: `Esri-Topo`,
        type: 'raster',
        source: 'Esri-Topo',
        minzoom: 0,
        layout: {
          visibility: 'visible'
        }
      }
    ]
  }
];

export { ESRI_LAYERS };
