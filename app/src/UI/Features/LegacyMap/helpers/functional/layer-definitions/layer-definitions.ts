import { SourceSpecification } from 'maplibre-gl/dist/maplibre-gl-dev';
import { InvasivesMapLayerDefinition } from './types';
import { ESRI_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/esri';
import { BAKED_VECTOR_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/baked-vector-full';
import { BAKED_RASTER_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/baked-raster';
import { PUBLIC_VECTOR_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/public-vector';
import { DATABC_LAYERS, DATABC_SOURCES } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/wms';
import {
  DEMO_LAYERS,
  DEMO_SOURCES
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/demo-offline-vector';

const SOURCES: { [key: string]: SourceSpecification } = {
  'Esri-Sat-Label-Source': {
    type: 'raster',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
    ],
    tileSize: 256,
    attribution: 'Powered by ESRI',
    maxzoom: 18
  },
  'Esri-Topo': {
    type: 'raster',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
    tileSize: 256,
    attribution: 'Powered by ESRI',
    maxzoom: 18
  },
  'Esri-Sat-Layer-HD': {
    type: 'raster',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    attribution: 'Powered by ESRI',
    tileSize: 256,
    maxzoom: 24
  },
  'Esri-Sat-Layer-SD': {
    type: 'raster',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    attribution: 'Powered by ESRI',
    tileSize: 256,
    maxzoom: 18
  },
  'Baked-Raster': {
    type: 'raster',
    tiles: ['baked://offline/{z}/{x}/{y}'],
    tileSize: 256,
    attribution: 'Powered by ESRI',
    maxzoom: 10 // must match bundled tiles
  },
  'Offline-Vector': {
    type: 'vector',
    url: 'pmtiles:///assets/tiles/tiles14.pmtiles',
    attribution: '© OpenMapTiles © OpenStreetMap contributors',
    maxzoom: 14 // must match bundled tiles
  },
  'Public-Vector': {
    type: 'vector',
    url: 'pmtiles://https://nrs.objectstore.gov.bc.ca/rzivsz/invasives-prod.pmtiles'
  },
  ...DATABC_SOURCES,
  ...DEMO_SOURCES
};

const MAP_DEFINITIONS: InvasivesMapLayerDefinition[] = [
  ...ESRI_LAYERS,
  ...BAKED_VECTOR_LAYERS,
  ...BAKED_RASTER_LAYERS,
  ...PUBLIC_VECTOR_LAYERS,
  ...DATABC_LAYERS,
  ...DEMO_LAYERS
];

export { MAP_DEFINITIONS, SOURCES };
