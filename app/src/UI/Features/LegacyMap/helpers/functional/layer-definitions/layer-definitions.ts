import { LayerSpecification } from 'maplibre-gl';
import { InvasivesMapLayerDefinition } from './types';
import { ESRI_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/esri';
import { BAKED_VECTOR_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/baked-vector-full';
import { BAKED_RASTER_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/baked-raster';
import { PUBLIC_VECTOR_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/public-vector';

const SOURCES = {
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
  }
};

const MAP_DEFINITIONS: InvasivesMapLayerDefinition[] = [
  ...ESRI_LAYERS,
  ...BAKED_VECTOR_LAYERS,
  ...BAKED_RASTER_LAYERS,
  ...PUBLIC_VECTOR_LAYERS
];

// used to determine which layers we should turn on for a given group definition
function allLayerIdsInDefinition(definitionList: InvasivesMapLayerDefinition[], definitionName: string): string[] {
  const group = definitionList.find((m) => m.name === definitionName);
  if (!group) {
    console.error(`invalid definition name ${definitionName}`);
    throw Error(`invalid definition name ${definitionName}`);
  }
  return group.layers.map((l) => l.id);
}

function layersForDefinition(
  definitionList: InvasivesMapLayerDefinition[],
  definitionName: string
): LayerSpecification[] {
  const group = definitionList.find((m) => m.name === definitionName);
  if (!group) {
    console.error(`invalid definition name ${definitionName}`);
    throw Error(`invalid definition name ${definitionName}`);
  }
  return group.layers;
}

// ...and those we should turn off when it is deactivated
function allOverlayLayerIdsNotInDefinitions(
  definitionList: InvasivesMapLayerDefinition[],
  definitionNames: string[]
): string[] {
  const groups = definitionList.filter((m) => definitionNames.includes(m.name));

  return definitionList
    .filter((m) => m.mode == 'overlay')
    .flatMap((m) => m.layers)
    .filter((x) => {
      return !groups.some((group) => group.layers.some((groupLayer) => groupLayer.id == x.id));
    })
    .map((l) => l.id);
}

// ...and those we should turn off when it is deactivated
function allBaseMapLayerIdsNotInDefinition(
  definitionList: InvasivesMapLayerDefinition[],
  definitionName: string
): string[] {
  const group = definitionList.find((m) => m.name === definitionName);
  if (!group) {
    console.error(`invalid definition name ${definitionName}`);
    throw Error(`invalid definition name ${definitionName}`);
  }
  return definitionList
    .filter((m) => m.mode == 'basemap')
    .flatMap((m) => m.layers)
    .filter((x) => !group.layers.map((l) => l.id).includes(x.id))
    .map((l) => l.id);
}

function allSourceIDsRequiredForDefinition(definitionList: InvasivesMapLayerDefinition[], definitionName: string) {
  const group = definitionList.find((m) => m.name === definitionName);
  if (!group) {
    console.error(`invalid definition name ${definitionName}`);
    throw Error(`invalid definition name ${definitionName}`);
  }
  return group.layers.map((l) => l['source'] as string);
}

export {
  MAP_DEFINITIONS,
  SOURCES,
  allLayerIdsInDefinition,
  allBaseMapLayerIdsNotInDefinition,
  layersForDefinition,
  allOverlayLayerIdsNotInDefinitions,
  allSourceIDsRequiredForDefinition
};
