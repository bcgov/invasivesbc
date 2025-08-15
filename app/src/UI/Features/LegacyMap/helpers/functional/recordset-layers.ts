import maplibregl, {
  CircleLayerSpecification,
  FillLayerSpecification,
  GeoJSONSourceSpecification,
  LineLayerSpecification,
  SourceSpecification,
  SymbolLayerSpecification
} from 'maplibre-gl';
import { FeatureCollection } from 'geojson';
import { LAYER_Z_FOREGROUND } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import { FALLBACK_COLOR } from 'UI/Features/LegacyMap/helpers/functional/constants';
import { safelySetPaintProperty } from 'UI/Features/LegacyMap/helpers/functional/utility-functions';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import { RecordSetId, RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import { OfflineActivityRecord } from 'state/reducers/offlineActivity';
import { getConcatenatedCodes, findSpeciesCodes } from 'utils/addActivity';
import { white } from 'constants/colors';
import recordsetColourScheme from 'constants/recordsetColourScheme';

const LAYER_ID_PREFIX = 'recordset-layer-';
const OFFLINE_ACTIVITIES_LAYER_ID = 'offline-activity';

/** DRY Handler for formatting LayerIDs */
const formatLayerID = (recordSetID: string, tableFiltersHash: string): string =>
  `${LAYER_ID_PREFIX}${recordSetID}-hash-${tableFiltersHash}`;

const createCachedIappLayer = async (map: maplibregl.Map, layer: any) => {
  if (layer?.layerState?.cacheMetadataStatus !== UserRecordCacheStatus.CACHED || !layer.layerState.mapToggle) {
    return;
  }
  const service = await RecordCacheServiceFactory.getPlatformInstance();
  const repo = await service.getRepository(layer.recordSetID, ['cached_geojson']);

  if (!repo?.cached_geojson) {
    return;
  }
  const layerID = formatLayerID(layer.recordSetID, layer.tableFiltersHash);
  const source: GeoJSONSourceSpecification = repo.cached_geojson;
  const color: string = layer.layerState.color ?? FALLBACK_COLOR;
  const labelsShouldBeVisible = !!layer?.layerState?.labelToggle && !!layer?.layerState?.mapToggle;

  const labelLayer: SymbolLayerSpecification = getLabelLayer(layerID, {
    color,
    minzoom: 10,
    get_tag: 'name',
    visibility: labelsShouldBeVisible
  });
  const circleLayer: CircleLayerSpecification = getCircleMarkerZoomedOutLayer(layerID, { color });

  map.addSource(layerID, source);
  map.addLayer(circleLayer, LAYER_Z_FOREGROUND);
  map.addLayer(labelLayer, LAYER_Z_FOREGROUND);
};

const createOnlineIappLayer = (map: any, layer: any) => {
  const layerID = formatLayerID(layer.recordSetID, layer.tableFiltersHash);
  const source: SourceSpecification = {
    type: 'vector',
    tiles: [`api:///api/vectors/iapp/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`],
    minzoom: 0,
    maxzoom: 24
  };
  const color: string = layer.layerState.color ?? FALLBACK_COLOR;
  const labelsShouldBeVisible = !!layer?.layerState?.labelToggle && !!layer?.layerState?.mapToggle;
  const labelLayer = getLabelLayer(layerID, {
    color,
    minzoom: 10,
    get_tag: 'site_id',
    visibility: labelsShouldBeVisible
  });
  const circleLayer: CircleLayerSpecification = getCircleMarkerZoomedOutLayer(layerID, { color });
  circleLayer['source-layer'] = 'data';
  labelLayer['source-layer'] = 'data';

  map.addSource(layerID, source);
  map.addLayer(circleLayer, LAYER_Z_FOREGROUND);
  map.addLayer(labelLayer, LAYER_Z_FOREGROUND);
};

const getPaintBySchemeOrColor = (layer: any) => {
  const defaultRecordsetOrSetToWhite =
    Object.values(RecordSetId)?.includes(layer?.recordSetID) || layer?.layerState?.color === white;
  if (defaultRecordsetOrSetToWhite) {
    return [
      'match',
      ['get', 'activity_subtype'],
      'Activity_Biocontrol_Collection',
      recordsetColourScheme.Activity_Biocontrol_Collection ?? FALLBACK_COLOR,
      'Activity_Biocontrol_Release',
      recordsetColourScheme.Activity_Biocontrol_Release ?? FALLBACK_COLOR,
      'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant',
      recordsetColourScheme.Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant ?? FALLBACK_COLOR,
      'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant',
      recordsetColourScheme.Activity_Monitoring_BiocontrolRelease_TerrestrialPlant ?? FALLBACK_COLOR,
      'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
      recordsetColourScheme.Activity_Monitoring_ChemicalTerrestrialAquaticPlant ?? FALLBACK_COLOR,
      'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
      recordsetColourScheme.Activity_Monitoring_MechanicalTerrestrialAquaticPlant ?? FALLBACK_COLOR,
      'Activity_Observation_PlantAquatic',
      recordsetColourScheme.Activity_Observation_PlantAquatic ?? FALLBACK_COLOR,
      'Activity_Observation_PlantTerrestrial',
      recordsetColourScheme.Activity_Observation_PlantTerrestrial ?? FALLBACK_COLOR,
      'Activity_Treatment_ChemicalPlantAquatic',
      recordsetColourScheme.Activity_Treatment_ChemicalPlantAquatic ?? FALLBACK_COLOR,
      'Activity_Treatment_ChemicalPlantTerrestrial',
      recordsetColourScheme.Activity_Treatment_ChemicalPlantTerrestrial ?? FALLBACK_COLOR,
      'Activity_Treatment_MechanicalPlantAquatic',
      recordsetColourScheme.Activity_Treatment_MechanicalPlantAquatic ?? FALLBACK_COLOR,
      'Activity_Treatment_MechanicalPlantTerrestrial',
      recordsetColourScheme.Activity_Treatment_MechanicalPlantTerrestrial ?? FALLBACK_COLOR,
      layer?.layerState?.color ?? FALLBACK_COLOR
    ];
  }
  return layer?.layerState?.color ?? FALLBACK_COLOR;
};

interface LayerOptions {
  color: string;
  minzoom?: number;
  maxzoom?: number;
  get_tag?: string;
  visibility?: boolean;
}

const getFillLayer = (layerID: string, options: LayerOptions): FillLayerSpecification => ({
  id: layerID,
  source: layerID,
  type: 'fill',
  paint: {
    'fill-color': options.color,
    'fill-outline-color': options.color,
    'fill-opacity': 0.5
  },
  maxzoom: options.maxzoom ?? 24,
  minzoom: options.minzoom ?? 0
});

const getBorderLayer = (layerID: string, options: LayerOptions): LineLayerSpecification => ({
  id: 'polygon-border-' + layerID,
  source: layerID,
  type: 'line',
  paint: {
    'line-color': options.color,
    'line-opacity': 1,
    'line-width': 3
  },
  maxzoom: options.maxzoom ?? 24,
  minzoom: options.minzoom ?? 0
});

const getCircleMarkerZoomedOutLayer = (layerID: string, options: LayerOptions): CircleLayerSpecification => ({
  id: 'polygon-circle-' + layerID,
  source: layerID,
  type: 'circle',
  paint: {
    'circle-color': options.color,
    'circle-radius': 4
  },
  maxzoom: options.maxzoom ?? 24,
  minzoom: options.minzoom ?? 0
});

const getLabelLayer = (layerID: string, options: LayerOptions): SymbolLayerSpecification => ({
  id: 'label-' + layerID,
  source: layerID,
  type: 'symbol',
  layout: {
    'text-field': [
      'format',
      ['get', options.get_tag ?? 'short_id'],
      { 'font-scale': 0.9 },
      '\n',
      {},
      ['get', 'map_symbol'],
      { 'font-scale': 0.9 }
    ],
    // the actual font names that work are here https://github.com/openmaptiles/fonts/blob/gh-pages/fontstacks.json
    'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
    'text-offset': [0, 0.6],
    'text-anchor': 'top',
    visibility: options?.visibility ? 'visible' : 'none'
  },
  paint: {
    'text-color': 'black',
    'text-halo-color': 'white',
    'text-halo-width': 1,
    'text-halo-blur': 1
  },
  minzoom: options.minzoom ?? 12,
  maxzoom: options.maxzoom ?? 24
});

/**
 * @desc Uses the device's recordset Cache data to display geoJson Layers on the map when offline
 *       Displays two layers: Points at high levels, and shapes at lower
 */
const createCachedActivityLayer = async (map: maplibregl.Map, layer: any) => {
  if (layer?.layerState?.cacheMetadataStatus !== UserRecordCacheStatus.CACHED || !layer.layerState.mapToggle) {
    return;
  }
  const service = await RecordCacheServiceFactory.getPlatformInstance();
  const repo = await service.getRepository(layer.recordSetID, ['cached_geojson', 'cached_centroid']);

  if (!repo?.cached_centroid || !repo?.cached_geojson) {
    return;
  }

  const CENTROID_TO_GEOJSON_ZOOM = 12;
  const GEOJSON_ID = formatLayerID(layer.recordSetID, layer.tableFiltersHash);
  const CENTROID_ID = `${GEOJSON_ID}-centroid`;
  const color = getPaintBySchemeOrColor(layer);
  const labelsShouldBeVisible = !!layer?.layerState?.labelToggle && !!layer?.layerState?.mapToggle;

  const circleMarkerZoomedOutLayerCentroid: CircleLayerSpecification = getCircleMarkerZoomedOutLayer(CENTROID_ID, {
    color,
    maxzoom: CENTROID_TO_GEOJSON_ZOOM
  });
  const labelLayerCentroid: SymbolLayerSpecification = getLabelLayer(CENTROID_ID, {
    color,
    maxzoom: CENTROID_TO_GEOJSON_ZOOM,
    get_tag: 'name',
    visibility: labelsShouldBeVisible
  });

  const fillLayer: FillLayerSpecification = getFillLayer(GEOJSON_ID, { color, minzoom: CENTROID_TO_GEOJSON_ZOOM });
  const borderLayer: LineLayerSpecification = getBorderLayer(GEOJSON_ID, { color, minzoom: CENTROID_TO_GEOJSON_ZOOM });
  const circleMarkerZoomedOutLayer: CircleLayerSpecification = getCircleMarkerZoomedOutLayer(GEOJSON_ID, {
    color,
    minzoom: CENTROID_TO_GEOJSON_ZOOM
  });
  const labelLayer: SymbolLayerSpecification = getLabelLayer(GEOJSON_ID, {
    color,
    get_tag: 'name',
    visibility: labelsShouldBeVisible
  });

  map.addSource(GEOJSON_ID, repo.cached_geojson);
  map.addLayer(fillLayer, LAYER_Z_FOREGROUND);
  map.addLayer(borderLayer, LAYER_Z_FOREGROUND);
  map.addLayer(circleMarkerZoomedOutLayer, LAYER_Z_FOREGROUND);
  map.addLayer(labelLayer, LAYER_Z_FOREGROUND);

  map.addSource(CENTROID_ID, repo.cached_centroid);
  map.addLayer(labelLayerCentroid, LAYER_Z_FOREGROUND);
  map.addLayer(circleMarkerZoomedOutLayerCentroid, LAYER_Z_FOREGROUND);
};

const createOnlineActivityLayer = (map: maplibregl.Map, layer: any) => {
  const layerID = formatLayerID(layer.recordSetID, layer.tableFiltersHash);

  // color the feature depending on the property 'Activity Type' matching the keys in the layer colorScheme:
  const source: SourceSpecification = {
    type: 'vector',
    tiles: [`api:///api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`],
    minzoom: 0,
    maxzoom: 24
  };
  const color = getPaintBySchemeOrColor(layer);
  const labelsShouldBeVisible = !!layer?.layerState?.labelToggle && !!layer?.layerState?.mapToggle;
  const fillLayer: FillLayerSpecification = getFillLayer(layerID, { color });
  const borderLayer: LineLayerSpecification = getBorderLayer(layerID, { color });
  const circleMarkerZoomedOutLayer: CircleLayerSpecification = getCircleMarkerZoomedOutLayer(layerID, { color });
  const labelLayer: SymbolLayerSpecification = getLabelLayer(layerID, {
    color,
    get_tag: 'short_id',
    visibility: labelsShouldBeVisible
  });

  fillLayer['source-layer'] = 'data';
  borderLayer['source-layer'] = 'data';
  circleMarkerZoomedOutLayer['source-layer'] = 'data';
  labelLayer['source-layer'] = 'data';

  map.addSource(layerID, source);
  map.addLayer(fillLayer, LAYER_Z_FOREGROUND);
  map.addLayer(borderLayer, LAYER_Z_FOREGROUND);
  map.addLayer(circleMarkerZoomedOutLayer, LAYER_Z_FOREGROUND);
  map.addLayer(labelLayer, LAYER_Z_FOREGROUND);
};

const createOfflineActivitiesLayer = async (
  map: maplibregl.Map,
  locallyStoredActivities: Record<PropertyKey, OfflineActivityRecord>,
  labelVisibility: boolean
) => {
  const geometryList = Object.values(locallyStoredActivities)
    .map((item) => {
      try {
        const parsedData = JSON.parse((item as OfflineActivityRecord)?.data);
        const plantCodes = getConcatenatedCodes(
          findSpeciesCodes(parsedData.form_data.activity_subtype_data, item.record_type)
        );

        if (parsedData && parsedData.geometry && parsedData.geometry[0]) {
          return {
            ...parsedData.geometry[0],
            properties: {
              short_id: parsedData.short_id,
              map_symbol: plantCodes
            }
          };
        }
      } catch (error) {
        console.error(error);
      }
      return null;
    })
    .filter(Boolean);

  if (!geometryList) return;

  const geoJsonData: FeatureCollection = {
    type: 'FeatureCollection',
    features: geometryList || []
  };

  if (geoJsonData.features) {
    map
      .addSource(OFFLINE_ACTIVITIES_LAYER_ID, { type: 'geojson', data: geoJsonData })
      .addLayer(getFillLayer(OFFLINE_ACTIVITIES_LAYER_ID, { color: 'blue' }), LAYER_Z_FOREGROUND)
      .addLayer(getBorderLayer(OFFLINE_ACTIVITIES_LAYER_ID, { color: 'blue' }), LAYER_Z_FOREGROUND)
      .addLayer(getCircleMarkerZoomedOutLayer(OFFLINE_ACTIVITIES_LAYER_ID, { color: 'blue' }), LAYER_Z_FOREGROUND)
      .addLayer(
        getLabelLayer(OFFLINE_ACTIVITIES_LAYER_ID, {
          color: 'black',
          get_tag: 'short_id',
          minzoom: 4
        }),
        LAYER_Z_FOREGROUND
      );
    if (!labelVisibility) {
      map.setLayoutProperty('label-' + OFFLINE_ACTIVITIES_LAYER_ID, 'visibility', 'none');
    }
  }
};
const removeOfflineActivitiesLayer = async (map: maplibregl.Map) => {
  const allLayersOnMap = map.getLayersOrder();
  const recordSetOfflineLayers = allLayersOnMap.filter((layer) => layer.includes(OFFLINE_ACTIVITIES_LAYER_ID));

  if (recordSetOfflineLayers.length > 0) {
    recordSetOfflineLayers.forEach((layer) => {
      try {
        map.removeLayer(layer);
      } catch (e) {
        console.error('error removing layer', e);
      }
    });
    map.removeSource(OFFLINE_ACTIVITIES_LAYER_ID);
  }
};

const refreshOfflineActivitiesLayer = async (
  map: maplibregl.Map,
  visibility: boolean,
  labelVisibility: boolean,
  locallyStoredActivities: Record<PropertyKey, OfflineActivityRecord>
) => {
  if (!map || !visibility) return;
  await removeOfflineActivitiesLayer(map);

  if (Object.keys(locallyStoredActivities).length === 0) return;

  await createOfflineActivitiesLayer(map, locallyStoredActivities, labelVisibility);
};

const toggleOfflineActivityLabels = async (map: maplibregl.Map, labelVisibility: boolean) => {
  const allLayersOnMap = map.getLayersOrder();
  const recordSetOfflineLabelLayer = allLayersOnMap.filter((layer) =>
    layer.includes('label-' + OFFLINE_ACTIVITIES_LAYER_ID)
  );

  recordSetOfflineLabelLayer.map((layer) => {
    const visibility = map.getLayoutProperty(layer, 'visibility');
    if (visibility !== 'none' && !labelVisibility) {
      map.setLayoutProperty(layer, 'visibility', 'none');
    }
    if (visibility !== 'visible' && labelVisibility) {
      map.setLayoutProperty(layer, 'visibility', 'visible');
    }
  });
};

const purgeRecordsetLayersNotInStore = (
  map: maplibregl.Map,
  storeLayerIds: string[],
  recordsetLayers: string[],
  recordsetSources: string[]
) => {
  const recordSetLayersNotInStore = recordsetLayers.filter(
    (layer) => storeLayerIds.filter((storeLayerId) => layer.includes(storeLayerId)).length === 0
  );

  const recordSetSourcesNotInStore = recordsetSources.filter(
    (source) => storeLayerIds.filter((storeLayerId) => source.includes(storeLayerId)).length === 0
  );

  recordSetLayersNotInStore.forEach((staleLayer) => {
    try {
      map.removeLayer(staleLayer);
    } catch (e) {
      console.error('error removing layer' + staleLayer);
    }
  });

  recordSetSourcesNotInStore.forEach((staleSource) => {
    try {
      map.removeSource(staleSource);
    } catch (e) {
      console.error('error removing source', e);
    }
  });
};

const deleteStaleRecordsetLayer = (map: maplibregl.Map, layer: Record<PropertyKey, any>) => {
  if (!map) {
    return;
  }
  //get all layers for recordset
  const allLayersForRecordSet = map.getLayersOrder().filter((mapLayer) => {
    return (
      mapLayer.includes(LAYER_ID_PREFIX + layer.recordSetID) ||
      mapLayer.includes('label-' + layer.recordSetID) ||
      mapLayer.includes('polygon-border-' + layer.recordSetID) ||
      mapLayer.includes('polygon-circle-' + layer.recordSetID)
    );
  });

  const stale = allLayersForRecordSet.filter((mapLayer) => !mapLayer.includes(layer.tableFiltersHash));

  stale.forEach((staleLayer) => {
    try {
      map.removeLayer(staleLayer);
    } catch (_e) {
      console.error('error removing layer' + staleLayer);
    }
  });
  const staleSources = Object.keys(map.style.sourceCaches).filter((source) => {
    return source.includes(LAYER_ID_PREFIX + layer.recordSetID) && !source.includes(layer.tableFiltersHash);
  });

  staleSources?.map((staleSource) => {
    if (map.getSource(staleSource)) {
      try {
        map.removeSource(staleSource);
      } catch (e) {
        console.error('error removing source', e);
      }
    }
  });
};

/**
 * @desc Delete all recordset layers on the map in response to major app events (connectivity change, or cache update)
 * @param map Current map
 */
const removeRecordsetLayersOnForcedRedraw = (map: maplibregl.Map) => {
  const allLayersOnMap = map.getLayersOrder();
  const allSourcesOnMap = Object.keys(map.style.sourceCaches);

  const recordSetLayers = allLayersOnMap.filter((layer) => layer.includes(LAYER_ID_PREFIX));
  const recordSetSources = allSourcesOnMap.filter((source) => source.includes(LAYER_ID_PREFIX));

  recordSetLayers.forEach((layer) => {
    try {
      map.removeLayer(layer);
    } catch (e) {
      console.error('error removing layer', e);
    }
  });
  recordSetSources.forEach((source) => {
    try {
      map.removeSource(source);
    } catch (e) {
      console.error('error removing source', e);
    }
  });
};

const rebuildLayersOnTableHashUpdate = async (
  storeLayers: Record<PropertyKey, any>,
  map: maplibregl.Map,
  connectedToNetwork: boolean
) => {
  const MOBILE_OFFLINE = buildTimeConfig.MOBILE && !connectedToNetwork;
  /* First need to delete the layers who's record set was deleted altogether: */
  const storeLayersIds = storeLayers.map((layer) => formatLayerID(layer.recordSetID, layer.tableFiltersHash));
  const allLayersOnMap = map.getLayersOrder();
  const allSourcesOnMap = Object.keys(map.style.sourceCaches);
  const allRecordSetLayers = allLayersOnMap.filter((layer) => layer.includes(LAYER_ID_PREFIX));
  const allRecordSetSources = allSourcesOnMap.filter((source) => source.startsWith(LAYER_ID_PREFIX));

  purgeRecordsetLayersNotInStore(map, storeLayersIds, allRecordSetLayers, allRecordSetSources);

  // now update the layers that are in the store
  await storeLayers.forEach(async (layer: Record<PropertyKey, any>) => {
    if (layer.filterObject) {
      const sourceId = formatLayerID(layer.recordSetID, layer.tableFiltersHash);
      deleteStaleRecordsetLayer(map, layer); // cleans up recordset layers with filters
      const existingSource = map.getSource(sourceId);
      if (existingSource) return;
      await createMapLayer(map, layer, MOBILE_OFFLINE);
    }
  });
};

/**
 * @desc Handler logic for creating a new layer based on Network condition and recordset type
 */
const createMapLayer = async (
  map: maplibregl.Map,
  layer: Record<PropertyKey, any>,
  isOfflineLayer: boolean
): Promise<void> => {
  if (layer.type === RecordSetType.Activity) {
    if (isOfflineLayer) {
      await createCachedActivityLayer(map, layer);
    } else {
      createOnlineActivityLayer(map, layer);
    }
  } else if (layer.type === RecordSetType.IAPP) {
    if (isOfflineLayer) {
      await createCachedIappLayer(map, layer);
    } else {
      createOnlineIappLayer(map, layer);
    }
  }
};

const refreshColoursOnColourUpdate = (storeLayers, map: maplibregl.Map) => {
  /** Get color value for a given paint property */
  const currentColor = (paint, property: string) => paint[property] ?? '';

  /** Check if current layer color matches stored color, and that colorScheme is not present */
  const shouldUpdatePaint = (layer, layerStyle, property: string): boolean =>
    !currentColor(layerStyle, property) && !Object.hasOwn(layer.layerState, 'colorScheme');

  for (const layer of storeLayers) {
    const layerSearchString = formatLayerID(layer.recordSetID, layer.tableFiltersHash);
    const matchingLayers = map.getLayersOrder().filter((mapLayer: any) => mapLayer.includes(layerSearchString));

    matchingLayers.forEach((mapLayer) => {
      const layerStyle = map.getStyle().layers.find((el) => el.id === mapLayer)?.paint;
      if (
        mapLayer.startsWith(LAYER_ID_PREFIX) &&
        layer.type === RecordSetType.Activity &&
        shouldUpdatePaint(layer, layerStyle, 'circle-color')
      ) {
        safelySetPaintProperty(map, mapLayer, 'fill-color', getPaintBySchemeOrColor(layer));
        safelySetPaintProperty(map, mapLayer, 'fill-outline-color', getPaintBySchemeOrColor(layer));
      } else if (mapLayer.startsWith('polygon-border-') && shouldUpdatePaint(layer, layerStyle, 'circle-color')) {
        safelySetPaintProperty(map, mapLayer, 'line-color', getPaintBySchemeOrColor(layer));
      } else if (mapLayer.startsWith('polygon-circle-') && shouldUpdatePaint(layer, layerStyle, 'fill-color')) {
        safelySetPaintProperty(map, mapLayer, 'circle-color', getPaintBySchemeOrColor(layer));
      }
    });
  }
};

const refreshVisibilityOnToggleUpdate = (storeLayers, map: maplibregl.Map) => {
  storeLayers.map((layer) => {
    const layerSearchString = formatLayerID(layer.recordSetID, layer.tableFiltersHash);
    const mapLayers = map.getLayersOrder();
    const matchingLayers = mapLayers.filter(
      (mapLayer: any) => mapLayer.includes(layerSearchString) && !mapLayer.includes('label')
    );
    const matchingLabelLayers = mapLayers.filter(
      (mapLayer: any) => mapLayer.includes(layerSearchString) && mapLayer.includes('label')
    );
    matchingLayers?.map((mapLayer) => {
      const visibility = map.getLayoutProperty(mapLayer, 'visibility');
      if (visibility !== 'none' && !layer.layerState.mapToggle) {
        map.setLayoutProperty(mapLayer, 'visibility', 'none');
      }
      if (visibility !== 'visible' && layer.layerState.mapToggle) {
        map.setLayoutProperty(mapLayer, 'visibility', 'visible');
      }
    });
    matchingLabelLayers?.map((mapLayer) => {
      const visibility = map.getLayoutProperty(mapLayer, 'visibility');
      const shouldHideLabelLayer =
        (visibility !== 'none' && !layer.layerState.labelToggle) || !layer.layerState.mapToggle;
      const shouldShowLabelLayer =
        visibility !== 'visible' && layer.layerState.labelToggle && layer.layerState.mapToggle;
      if (shouldShowLabelLayer) {
        map.setLayoutProperty(mapLayer, 'visibility', 'visible');
      } else if (shouldHideLabelLayer) {
        map.setLayoutProperty(mapLayer, 'visibility', 'none');
      }
    });
  });
};

export {
  createCachedIappLayer,
  createOnlineActivityLayer,
  refreshVisibilityOnToggleUpdate,
  refreshColoursOnColourUpdate,
  rebuildLayersOnTableHashUpdate,
  removeRecordsetLayersOnForcedRedraw,
  deleteStaleRecordsetLayer,
  toggleOfflineActivityLabels,
  removeOfflineActivitiesLayer,
  refreshOfflineActivitiesLayer,
  createCachedActivityLayer,
  createOnlineIappLayer
};
