import maplibregl from 'maplibre-gl';
import { LAYER_Z_BACKGROUND, LAYER_Z_FOREGROUND, LAYER_Z_MID } from 'UI/Map2/helpers/layer-definitions';
import { FALLBACK_COLOR } from 'UI/Map2/helpers/constants';

export const createIAPPLayer = (map: any, layer: any, mode, API_BASE) => {
  const layerID = 'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash;

  let source = {};
  if (mode === 'VECTOR_ENDPOINT') {
    source = {
      type: 'vector',
      tiles: [`${API_BASE}/api/vectors/iapp/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`],
      minzoom: 0,
      maxzoom: 24
    };
  } else {
    source = {
      type: 'geojson',
      data: layer.geoJSON
    };
  }

  const circleLayer = {
    id: layerID,
    source: layerID,
    type: 'circle',
    paint: {
      'circle-color': layer.layerState.color || FALLBACK_COLOR,
      'circle-radius': 3
    },
    minzoom: 0,
    maxzoom: 24
  };

  const labelLayer = {
    id: 'label-' + layerID,
    type: 'symbol',
    source: layerID,
    layout: {
      //                'icon-image': 'dog-park-11',
      'text-field': [
        'format',
        ['to-string', ['get', 'site_id']],
        { 'font-scale': 0.9 },
        '\n',
        {},
        ['to-string', ['get', 'map_symbol']],
        { 'font-scale': 0.9 }
      ],
      // the actual font names that work are here
      'text-font': ['literal', ['Open Sans Bold']],
      'text-offset': [0, 0.6],
      'text-anchor': 'top'
    },
    paint: {
      'text-color': 'black',
      'text-halo-color': 'white',
      'text-halo-width': 1,
      'text-halo-blur': 1
    },
    minzoom: 10
  };

  if (mode === 'VECTOR_ENDPOINT') {
    circleLayer['source-layer'] = 'data';
    labelLayer['source-layer'] = 'data';
  }

  map.addSource(layerID, source).addLayer(circleLayer, LAYER_Z_MID);

  map.addLayer(labelLayer, LAYER_Z_BACKGROUND);
};

export const deleteStaleIAPPLayer = (map: any, layer: any, mode) => {
  const allLayersForRecordSet = map.getLayersOrder().filter((mapLayer: any) => {
    return mapLayer.includes('recordset-layer-' + layer.recordSetID) || mapLayer.includes('label-' + layer.recordSetID);
  });

  const stale = allLayersForRecordSet.filter((mapLayer) => {
    return !mapLayer.includes(layer.tableFiltersHash);
  });

  stale.map((staleLayer) => {
    try {
      map.removeLayer(staleLayer);
    } catch (e) {
      console.error('error removing layer' + staleLayer);
    }
  });

  const staleSources = Object.keys(map.style.sourceCaches).filter((source) => {
    return source.includes('recordset-layer-' + layer.recordSetID) && !source.includes(layer.tableFiltersHash);
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

export const createActivityLayer = (map: any, layer: any, mode, API_BASE) => {
  const layerID = 'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash;

  if (['1', '2'].includes(layer.recordSetID) && !layer.layerState.colorScheme) {
    return;
  }

  const getPaintBySchemeOrColor = (layer: any) => {
    if (layer.layerState.colorScheme) {
      return [
        'match',
        ['get', 'type'],
        'Biocontrol',
        layer.layerState.colorScheme['Biocontrol'] || FALLBACK_COLOR,
        'FREP',
        layer.layerState.colorScheme['FREP'] || FALLBACK_COLOR,
        'Monitoring',
        layer.layerState.colorScheme['Monitoring'] || FALLBACK_COLOR,
        'Treatment',
        layer.layerState.colorScheme['Treatment'] || FALLBACK_COLOR,
        'Observation',
        layer.layerState.colorScheme['Observation'] || FALLBACK_COLOR,
        layer.layerState.color || FALLBACK_COLOR
      ];
    } else {
      return layer.layerState.color || FALLBACK_COLOR;
    }
  };

  // color the feature depending on the property 'Activity Type' matching the keys in the layer colorScheme:
  let source = {};
  if (mode === 'VECTOR_ENDPOINT') {
    source = {
      type: 'vector',
      tiles: [
        `${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`
      ],
      minzoom: 0,
      maxzoom: 24
    };
  } else {
    source = {
      type: 'geojson',
      data: layer.geoJSON
      //tolerance: 0 defaults to 0.375, 0 is a hog but 0.375 is too much at low zooms
    };
  }

  const fillLayer = {
    id: layerID,
    source: layerID,
    type: 'fill',
    paint: {
      'fill-color': getPaintBySchemeOrColor(layer),
      'fill-outline-color': getPaintBySchemeOrColor(layer),
      'fill-opacity': 0.5
    },
    minzoom: 0,
    maxzoom: 24
  };

  const borderLayer = {
    id: 'polygon-border-' + layerID,
    source: layerID,
    type: 'line',
    paint: {
      'line-color': getPaintBySchemeOrColor(layer),
      'line-opacity': 1,
      'line-width': 3
    }
  };

  const circleMarkerZoomedOutLayer = {
    id: 'polygon-circle-' + layerID,
    source: layerID,
    type: 'circle',
    paint: {
      'circle-color': getPaintBySchemeOrColor(layer),
      'circle-radius': 4
    },
    maxzoom: 24,
    minzoom: 0
  };

  const labelLayer = {
    id: 'label-' + layerID,
    type: 'symbol',
    source: layerID,
    layout: {
      //                'icon-image': 'dog-park-11',
      'text-field': [
        'format',
        ['upcase', ['get', 'short_id']],
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
    minzoom: 10
  };

  if (mode === 'VECTOR_ENDPOINT') {
    fillLayer['source-layer'] = 'data';
    borderLayer['source-layer'] = 'data';
    circleMarkerZoomedOutLayer['source-layer'] = 'data';
    labelLayer['source-layer'] = 'data';
  }

  map.addSource(layerID, source);
  map.addLayer(fillLayer, LAYER_Z_FOREGROUND);
  map.addLayer(borderLayer, LAYER_Z_FOREGROUND);
  map.addLayer(circleMarkerZoomedOutLayer, LAYER_Z_FOREGROUND);
  map.addLayer(labelLayer, LAYER_Z_FOREGROUND);
};

export const deleteStaleActivityLayer = (map: maplibregl.Map, layer: unknown) => {
  if (!map) {
    return;
  }
  //get all layers for recordset
  const allLayersForRecordSet = map.getLayersOrder().filter((mapLayer) => {
    return (
      mapLayer.includes('recordset-layer-' + layer.recordSetID) ||
      mapLayer.includes('label-' + layer.recordSetID) ||
      mapLayer.includes('polygon-border-' + layer.recordSetID) ||
      mapLayer.includes('polygon-circle-' + layer.recordSetID)
    );
  });

  const stale = allLayersForRecordSet.filter((mapLayer) => {
    return !mapLayer.includes(layer.tableFiltersHash);
  });

  stale.map((staleLayer) => {
    try {
      map.removeLayer(staleLayer);
    } catch (e) {
      console.error('error removing layer' + staleLayer);
    }
  });

  const staleSources = Object.keys(map.style.sourceCaches).filter((source) => {
    return source.includes('recordset-layer-' + layer.recordSetID) && !source.includes(layer.tableFiltersHash);
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

export const rebuildLayersOnTableHashUpdate = (storeLayers, map, mode, API_BASE) => {
  /*
      First need to delete the layers who's record set was deleted altogether:

  */
  const storeLayersIds = storeLayers.map((layer) => {
    return 'recordset-layer-' + layer.recordSetID + '-';
  });

  const allLayersOnMap = map.getLayersOrder();
  const allSourcesOnMap = Object.keys(map.style.sourceCaches);
  const allThatAreRecordSetLayers = allLayersOnMap.filter((layer) => layer.includes('recordset-layer'));
  const allThatAreRecordSetSources = allSourcesOnMap.filter((source) => source.includes('recordset-layer-'));
  const recordSetLayersThatAreNotInStore = allThatAreRecordSetLayers.filter(
    (layer) => storeLayersIds.filter((storeLayerId) => layer.includes(storeLayerId)).length === 0
  );
  const recordSetSourcesThatAreNotInStore = allThatAreRecordSetSources.filter(
    (source) => storeLayersIds.filter((storeLayerId) => source.includes(storeLayerId)).length === 0
  );

  recordSetLayersThatAreNotInStore.map((layer) => {
    try {
      map.removeLayer(layer);
    } catch (e) {
      console.error('error removing layer', e);
    }
  });
  recordSetSourcesThatAreNotInStore.map((source) => {
    try {
      map.removeSource(source);
    } catch (e) {
      console.error('error removing source', e);
    }
  });

  // now update the layers that are in the store
  storeLayers.map((layer: any) => {
    if ((layer.geoJSON && layer.loading === false) || (mode === 'VECTOR_ENDPOINT' && layer.filterObject)) {
      if (layer.type === 'Activity') {
        deleteStaleActivityLayer(map, layer);
        const existingSource = map.getSource(
          'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash
        );
        if (existingSource === undefined) {
          createActivityLayer(map, layer, mode, API_BASE);
        }
      } else if (layer.type === 'IAPP') {
        deleteStaleIAPPLayer(map, layer, mode);
        const existingSource = map.getSource(
          'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash
        );
        if (existingSource === undefined) {
          createIAPPLayer(map, layer, mode, API_BASE);
        }
      }
    }
  });
};

export const refreshColoursOnColourUpdate = (storeLayers, map) => {
  storeLayers.map((layer) => {
    const layerSearchString = layer.recordSetID + '-hash-' + layer.tableFiltersHash;
    const matchingLayers = map.getLayersOrder().filter((mapLayer: any) => {
      return mapLayer.includes(layerSearchString);
    });

    matchingLayers?.map((mapLayer) => {
      let currentColor = '';
      switch (true) {
        case /^recordset-layer-/.test(mapLayer):
          const fillPolygonLayerStyle = map.getStyle().layers.find((el) => el.id === mapLayer);
          if (layer.type === 'Activity') {
            currentColor = fillPolygonLayerStyle.paint['fill-color'];
            if (currentColor !== layer.layerState.color && !layer.layerState?.colorScheme) {
              map.setPaintProperty(mapLayer, 'fill-color', layer.layerState.color || FALLBACK_COLOR);
              map.setPaintProperty(mapLayer, 'fill-outline-color', layer.layerState.color || FALLBACK_COLOR);
            }
          } else {
            currentColor = fillPolygonLayerStyle.paint['circle-color'];
            if (currentColor !== layer.layerState.color && !layer.layerState.colorScheme) {
              map.setPaintProperty(mapLayer, 'circle-color', layer.layerState.color || FALLBACK_COLOR);
            }
          }
          break;
        case /polygon-border-/.test(mapLayer):
          const polyGonBorderLayerStyle = map.getStyle().layers.find((el) => el.id === mapLayer);
          currentColor = polyGonBorderLayerStyle.paint['line-color'];
          if (currentColor !== layer.layerState.color && !layer.layerState.colorScheme) {
            map.setPaintProperty(mapLayer, 'line-color', layer.layerState.color || FALLBACK_COLOR);
          }
          break;
        case /polygon-circle-/.test(mapLayer):
          const activityCircleMarkerLayerStyle = map.getStyle().layers.find((el) => el.id === mapLayer);
          currentColor = activityCircleMarkerLayerStyle.paint['circle-color'];
          if (currentColor !== layer.layerState.color && !layer.layerState.colorScheme) {
            map.setPaintProperty(mapLayer, 'circle-color', layer.layerState.color || FALLBACK_COLOR);
          }
          break;
        default:
          'polygon';
      }
    });
  });
};

export const refreshVisibilityOnToggleUpdate = (storeLayers, map) => {
  storeLayers.map((layer) => {
    const layerSearchString = layer.recordSetID + '-hash-' + layer.tableFiltersHash;
    const matchingLayers = map.getLayersOrder().filter((mapLayer: any) => {
      return mapLayer.includes(layerSearchString) && !mapLayer.includes('label');
    });
    const matchingLabelLayers = map.getLayersOrder().filter((mapLayer: any) => {
      return mapLayer.includes(layerSearchString) && mapLayer.includes('label');
    });
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
      if (visibility !== 'none' && !layer.layerState.labelToggle) {
        map.setLayoutProperty(mapLayer, 'visibility', 'none');
      }
      if (visibility !== 'visible' && layer.layerState.labelToggle) {
        map.setLayoutProperty(mapLayer, 'visibility', 'visible');
      }
    });
  });
};

export const removeDeletedRecordSetLayersOnRecordSetDelete = (storeLayers, map) => {
  map.getLayersOrder().map((layer: any) => {
    if (
      storeLayers.filter((l: any) => l.recordSetID === layer).length === 0 &&
      !['wms-test-layer', 'wms-test-layer2', 'invasives-vector', 'buildings'].includes(layer)
    ) {
      //map.current.removeLayer(layer);
      //map.current.removeSource(layer);
    }
  });
  storeLayers.map((layer) => {
    // get matching layers for type
    // update visibility if doesn't match
  });
};
