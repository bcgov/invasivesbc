import { SourceSpecification } from 'maplibre-gl';
import { InvasivesMapLayerDefinition } from './types';
import { ESRI_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/esri';
import { BAKED_VECTOR_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/baked-vector-full';
import { BAKED_RASTER_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/baked-raster';
import { PUBLIC_VECTOR_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/public-vector';
import { DATABC_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/wms';

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
  'wms-regional-districts': {
    type: 'raster',
    url: 'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP',
    maxzoom: 18
  }
};

const MAP_DEFINITIONS: InvasivesMapLayerDefinition[] = [
  ...ESRI_LAYERS,
  ...BAKED_VECTOR_LAYERS,
  ...BAKED_RASTER_LAYERS,
  ...PUBLIC_VECTOR_LAYERS,
  ...DATABC_LAYERS
];

export { MAP_DEFINITIONS, SOURCES };
