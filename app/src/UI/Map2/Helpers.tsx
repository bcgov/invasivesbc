import maplibregl, { NavigationControl, ScaleControl } from 'maplibre-gl';
import centroid from '@turf/centroid';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PMTiles, Protocol } from 'pmtiles';
import './map.css';

// Draw tools:
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import { MAP_ON_SHAPE_CREATE, MAP_ON_SHAPE_UPDATE, MAP_WHATS_HERE_FEATURE } from 'state/actions';
import proj4 from 'proj4';
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

const FALLBACK_COLOR = 'red';

export const mapInit = (
  map,
  mapContainer,
  drawSetter,
  dispatch,
  uHistory,
  appModeUrl,
  activityGeo,
  whats_here_toggle,
  api_base,
  getAuthHeaderCallback: () => string,
  PUBLIC_MAP_URL,
  map_center
) => {
  const coordinatesContainer = document.createElement('div');
  coordinatesContainer.style.position = 'absolute';
  coordinatesContainer.style.top = '10px';
  coordinatesContainer.style.left = '90px';
  coordinatesContainer.style.background = 'rgba(255, 255, 255, 0.8)';
  coordinatesContainer.style.padding = '5px';
  coordinatesContainer.style.borderRadius = '5px';
  coordinatesContainer.style.zIndex = '99';
  mapContainer.current.appendChild(coordinatesContainer);

  mapContainer.current.addEventListener('mousemove', (e) => {
    if (!map.current) {
      return;
    }

    if (!e?.clientX || !e?.clientY) {
      return;
    }

    const { lng, lat } = map.current.unproject([e.clientX, e.clientY]);

    const utmZone = Math.floor((lng + 180) / 6) + 1;

    function proj4_setdef(utmZone: number): string {
      const zdef = `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`;
      return zdef;
    }

    proj4.defs([
      ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
      ['EPSG:AUTO', proj4_setdef(utmZone)]
    ]);

    const utm: [number, number] = proj4('EPSG:4326', 'EPSG:AUTO', [lng, lat]);

    coordinatesContainer.innerHTML = `
      <div>${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
      <div>Zone ${utmZone}, E: ${utm[0].toFixed(0)}, N: ${utm[1].toFixed(0)}</div>
    `;
  });

  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', (request) => {
    return new Promise((resolve, reject) => {
      const callback = (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({ data });
        }
      };
      protocol.tile(request, callback);
    });
  });

  const PMTILES_URL = PUBLIC_MAP_URL || `https://nrs.objectstore.gov.bc.ca/uphjps/invasives-local.pmtiles`;

  const p = new PMTiles(PMTILES_URL);

  // this is so we share one instance across the JS code and the map renderer
  protocol.add(p);

  //now get the most current auth token from auth provider
  map.current = new maplibregl.Map({
    container: mapContainer.current,
    maxZoom: 24,
    zoom: 3,
    minZoom: 0,
    transformRequest: (url, resourceType) => {
      if (url.includes(api_base)) {
        return {
          url,
          headers: {
            Authorization: getAuthHeaderCallback()
          }
        };
      }
      return {
        url
      };
    },
    center: [map_center[1], map_center[0]],
    style: {
      glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
      version: 8,
      sources: {
        'wms-test-source': {
          type: 'raster',
          tiles: [
            'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP'
          ],
          tileSize: 256,
          maxzoom: 24
        },
        'Esri-Sat-LayerHD': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          maxzoom: 24
        },
        'Esri-Sat-LayerSD': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Powered by ESRI',
          maxzoom: 18
        },
        'Esri-Sat-Label': {
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
        public_layer: {
          type: 'vector',
          url: `pmtiles://${PMTILES_URL}`,
          attribution: 'Powered by ESRI'
        }
      },
      layers: [
        {
          id: 'Esri-Sat-LayerHD',
          type: 'raster',
          source: 'Esri-Sat-LayerHD',
          minzoom: 0
        },
        {
          id: 'Esri-Sat-LayerSD',
          type: 'raster',
          source: 'Esri-Sat-LayerSD',
          minzoom: 0
        },
        {
          id: 'Esri-Sat-Label',
          type: 'raster',
          source: 'Esri-Sat-Label',
          minzoom: 0
        },
        {
          id: 'Esri-Topo',
          type: 'raster',
          source: 'Esri-Topo',
          minzoom: 0,
          layout: {
            visibility: 'none'
          }
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
  });

  const scale = new ScaleControl({
    maxWidth: 80,
    unit: 'metric'
  });
  const nav = new NavigationControl();
  map.current.addControl(scale, 'top-left');
  map.current.addControl(nav, 'top-left');
};

export const createActivityLayer = (map: any, layer: any, mode, API_BASE) => {
  const layerID = 'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash;

  console.log('checking if recordset colorscheme is loaded:' + typeof layer.recordSetID);
  // hack so the colorschemes apply

  if (['1', '2'].includes(layer.recordSetID) && !layer.layerState.colorScheme) {
    console.log('colorscheme its not loaded');
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

  map.addSource(layerID, source).addLayer(fillLayer);
  map.addLayer(borderLayer);
  map.addLayer(circleMarkerZoomedOutLayer);
  map.addLayer(labelLayer);
};

export const deleteStaleActivityLayer = (map: any, layer: any) => {
  if (!map) {
    return;
  }
  const newLayerID = 'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash;
  //get all layers for recordset
  const allLayersForRecordSet = map.getLayersOrder().filter((mapLayer: any) => {
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
      console.log('error removing layer' + staleLayer);
    }
  });

  // get all sources:
  //  console.log(map.style.sourceCaches);

  const staleSources = Object.keys(map.style.sourceCaches).filter((source) => {
    return source.includes('recordset-layer-' + layer.recordSetID) && !source.includes(layer.tableFiltersHash);
  });

  staleSources?.map((staleSource) => {
    if (map.getSource(staleSource)) {
      try {
        map.removeSource(staleSource);
      } catch (e) {
        console.log('error removing source', e);
      }
    }
  });
};

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

  map.addSource(layerID, source).addLayer(circleLayer);

  map.addLayer(labelLayer);
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
      console.log('error removing layer' + staleLayer);
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
        console.log('error removing source', e);
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
      console.log('error removing layer', e);
    }
  });
  recordSetSourcesThatAreNotInStore.map((source) => {
    try {
      map.removeSource(source);
    } catch (e) {
      console.log('error removing source', e);
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
            //console.log('is iapp to color')

            currentColor = fillPolygonLayerStyle.paint['circle-color'];
            //console.log('color is: ', currentColor, 'layer color is: ', layer.layerState.color || layer.layerState.colorScheme, 'fallback is: ', FALLBACK_COLOR)
            if (currentColor !== layer.layerState.color && !layer.layerState.colorScheme) {
              // console.log('colors dont match, updating')
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

export const toggleLayerOnBool = (map, layer, boolToggle) => {
  if (!map) return;

  if (!map.getLayer(layer)) return;
  if (layer.includes('Sat')) {
    console.log('** layer exists can toggle');
  }
  const visibility = map.getLayoutProperty(layer, 'visibility');
  if (visibility !== 'visible' && boolToggle) {
    map.setLayoutProperty(layer, 'visibility', 'visible');
  }
  if (visibility !== 'none' && !boolToggle) {
    map.setLayoutProperty(layer, 'visibility', 'none');
    console.log('toggle off');
  }
};

const customDrawListenerCreate = (drawInstance, dispatch, uHistory, whats_here_toggle) => (e) => {
  //enforce one at a time everywhere
  const feature = e.features[0];
  try {
    console.log('creating feature');
    if (drawInstance) {
      drawInstance.deleteAll();
      drawInstance.add(feature);
    }
  } catch (e) {
    console.log(e);
  }

  // For whats here
  if (whats_here_toggle) {
    dispatch({
      type: MAP_WHATS_HERE_FEATURE,
      payload: { feature: { type: 'Feature', geometry: feature.geometry } }
    });
    uHistory.push('/WhatsHere');
  } else {
    dispatch({ type: MAP_ON_SHAPE_CREATE, payload: feature });
  }
};

const customDrawListenerUpdate = (drawInstance: MapboxDraw) => (e) => {
  const feature = e.features[0];
  console.dir(feature);
};

const customDrawListenerSelectionChange = (drawInstance: MapboxDraw, dispatch) => (e) => {
  console.dir(e);

  const editedGeo = drawInstance.getAll().features[0];

  console.dir(e);
  console.dir(editedGeo);
  if (editedGeo?.id !== e?.features?.[0]?.id) {
    dispatch({ type: MAP_ON_SHAPE_UPDATE, payload: editedGeo });
  }
};

const attachedListeners: WeakRef<Function>[] = [];

export const initDrawModes = (
  map,
  drawSetter,
  dispatch,
  uHistory,
  hideControls,
  activityGeo,
  whats_here_toggle,
  drawingCustomLayer,
  draw
) => {
  console.log('Map event listeners:');
  console.dir(map?._listeners);

  ['draw.selectionchange', 'draw.create', 'draw.update'].map((eName) => {
    map._listeners[eName]?.map((l) => {
      let indexToSplice = -1;
      let refFound = false;

      for (let i = 0; i < attachedListeners.length; i++) {
        if (attachedListeners[i].deref() === l) {
          refFound = true;
          indexToSplice = i;
        }
      }

      if (refFound) {
        // remove from ref list
        attachedListeners.splice(indexToSplice, 1);
        map.off(eName, l);
      }
    });
  });

  const DoNothing: any = {};
  DoNothing.onSetup = function (opts) {
    //  if(map.draw && activityGeo)
    if (activityGeo) {
      this.addFeature(this.newFeature(activityGeo[0]));
    }

    const state: any = {};
    state.count = opts.count || 0;
    return state;
  };
  DoNothing.onClick = function (state, e) {
    this.changeMode('draw_polygon');
  };

  DoNothing.toDisplayFeatures = function (state, geojson, display) {
    geojson.properties.active = MapboxDraw.constants.activeStates.ACTIVE;
    display(geojson);
  };

  DoNothing.on;

  const WhatsHereBoxMode: any = { ...DrawRectangle };

  //Example from docs - keeping as template:
  const LotsOfPointsMode: any = {};

  // When the mode starts this function will be called.
  // The `opts` argument comes from `draw.changeMode('lotsofpoints', {count:7})`.
  // The value returned should be an object and will be passed to all other lifecycle functions
  LotsOfPointsMode.onSetup = function (opts) {
    const state: any = {};
    state.count = opts.count || 0;
    return state;
  };

  // Whenever a user clicks on the map, Draw will call `onClick`
  LotsOfPointsMode.onClick = function (state, e) {
    // `this.newFeature` takes geojson and makes a DrawFeature
    const point = this.newFeature({
      type: 'Feature',
      properties: {
        count: state.count
      },
      geometry: {
        type: 'Point',
        coordinates: [e.lngLat.lng, e.lngLat.lat]
      }
    });
    this.addFeature(point); // puts the point on the map
  };

  // Whenever a user clicks on a key while focused on the map, it will be sent here
  LotsOfPointsMode.onKeyUp = function (state, e) {
    if (e.keyCode === 27) return this.changeMode('simple_select');
  };

  // This is the only required function for a mode.
  // It decides which features currently in Draw's data store will be rendered on the map.
  // All features passed to `display` will be rendered, so you can pass multiple display features per internal feature.
  // See `styling-draw` in `API.md` for advice on making display features
  LotsOfPointsMode.toDisplayFeatures = function (state, geojson, display) {
    display(geojson);
  };

  // Add the new draw mode to the MapboxDraw object
  const localDraw = new MapboxDraw({
    displayControlsDefault: !hideControls,
    controls: {
      combine_features: false,
      uncombine_features: false
    },
    defaultMode: whats_here_toggle ? 'whats_here_box_mode' : 'simple_select',
    // Adds the LotsOfPointsMode to the built-in set of modes
    modes: Object.assign(
      {
        draw_rectangle: DrawRectangle,
        do_nothing: DoNothing,
        lots_of_points: LotsOfPointsMode,
        whats_here_box_mode: WhatsHereBoxMode
      },
      MapboxDraw.modes
    )
  });

  drawSetter(localDraw);

  const drawCreateListener = customDrawListenerCreate(localDraw, dispatch, uHistory, whats_here_toggle);
  const drawUpdatelistener = customDrawListenerUpdate(localDraw);
  const drawSelectionchangeListener = customDrawListenerSelectionChange(localDraw, dispatch);

  map.on('draw.create', drawCreateListener);
  map.on('draw.update', drawUpdatelistener);
  map.on('draw.selectionchange', drawSelectionchangeListener);

  attachedListeners.push(new WeakRef(drawSelectionchangeListener));
  attachedListeners.push(new WeakRef(drawUpdatelistener));
  attachedListeners.push(new WeakRef(drawCreateListener));

  map.addControl(localDraw, 'top-left');

  if (activityGeo) {
    console.dir(activityGeo);
    localDraw.add({ type: 'FeatureCollection', features: activityGeo });
  }
};

export const handlePositionTracking = (
  map,
  positionMarker,
  userCoords,
  accuracyCircle,
  accuracyToggle,
  positionTracking
) => {
  function animateMarker(timestamp) {
    positionMarker.setLngLat([userCoords.long, userCoords.lat]);
    // Ensure it's added to the map. This is safe to call if it's already added.
    positionMarker.addTo(map);
    // Request the next frame of the animation.
    requestAnimationFrame(animateMarker);
  }

  if (userCoords && positionTracking) {
    map.jumpTo({ center: [userCoords.long, userCoords.lat] });
    // Start the animation.
    requestAnimationFrame(animateMarker);
    if (!map.getSource('accuracyCircle') && accuracyCircle) {
      map
        .addSource('accuracyCircle', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [accuracyCircle]
          }
        })
        .addLayer({
          id: 'accuracyCircle',
          source: 'accuracyCircle',
          type: 'fill',
          paint: {
            'fill-color': 'green',
            'fill-opacity': 0.5
          },
          layout: {
            visibility: accuracyToggle ? 'visible' : 'none'
          }
        });
    }
  }
  toggleLayerOnBool(map, 'accuracyCircle', accuracyToggle && positionTracking);
};
export const addWMSLayersIfNotExist = (simplePickerLayers2: any, map) => {
  simplePickerLayers2.map((layer) => {
    if (!map.getSource(layer.url) && layer.toggle && layer.type === 'wms')
      map
        .addSource(layer.url, {
          type: 'raster',
          tiles: [layer.url],
          tileSize: 256,
          maxzoom: 18
        })
        .addLayer({
          id: layer.url,
          type: 'raster',
          source: layer.url,
          minzoom: 0,
          paint: {
            'raster-opacity': layer.opacity ? layer.opacity : 1
          }
        });
  });
};

export const refreshWMSOnToggle = (simplePickerLayers2, map) => {
  simplePickerLayers2.map((layer) => {
    if (map.getLayer(layer.url)) {
      const visibility = map.getLayoutProperty(layer.url, 'visibility');
      if (visibility !== 'none' && !layer.toggle) {
        map.setLayoutProperty(layer.url, 'visibility', 'none');
      }
      if (visibility !== 'visible' && layer.toggle) {
        map.setLayoutProperty(layer.url, 'visibility', 'visible');
      }
    }
  });
};

export const refreshDrawControls = (
  map,
  draw,
  drawSetter,
  dispatch,
  uHistory,
  whatsHereToggle,
  appModeUrl,
  activityGeo,
  drawingCustomLayer
) => {
  /*
    We fully tear down map box draw and readd depending on app state / route, to have conditionally rendered controls:
    Because mapbox draw doesn't clean up its old sources properly we need to do it manually
   */
  map.getLayersOrder().map((layer) => {
    if (/gl-draw/.test(layer)) {
      map.removeLayer(layer);
    }
  });
  Object.keys(map.style.sourceCaches).map((source) => {
    if (/mapbox-gl-draw/.test(source)) {
      map.removeSource(source);
    }
  });
  try {
    if (draw) {
      map.removeControl(draw);
      drawSetter(null);
    }
  } catch (e) {
    console.log(e);
  }

  if (!map.draw) {
    const noMapVisible = /Report|Batch|Landing|WhatsHere/.test(appModeUrl);
    const userInActivity = /Activity/.test(appModeUrl);
    const hideControls = (noMapVisible || !userInActivity) && !drawingCustomLayer;
    initDrawModes(
      map,
      drawSetter,
      dispatch,
      uHistory,
      hideControls,
      userInActivity ? activityGeo : null,
      whatsHereToggle,
      drawingCustomLayer ?? null,
      draw
    );
  }
};

export const refreshWhatsHereFeature = (map, options: any) => {
  const layerID = 'WhatsHereFeatureLayer';
  try {
    if (map && map.getLayer(layerID + 'shape')) {
      map.removeLayer(layerID + 'shape');
    }
    if (map && map.getLayer(layerID + 'outline')) {
      map.removeLayer(layerID + 'outline');
    }
    if (map && map.getSource(layerID)) {
      map.removeSource(layerID);
    }
  } catch (e) {
    console.log(e);
  }

  console.log('***whatsherefeature');
  console.dir(options);

  if (map && options?.whatsHereFeature?.geometry) {
    map
      .addSource(layerID, {
        type: 'geojson',
        data: options.whatsHereFeature.geometry
      })
      .addLayer({
        id: layerID + 'shape',
        source: layerID,
        type: 'fill',
        paint: {
          'fill-color': 'white',
          'fill-outline-color': 'black',
          'fill-opacity': 0.4
        },
        minzoom: 0,
        maxzoom: 24
      })
      .addLayer({
        id: layerID + 'outline',
        source: layerID,
        type: 'line',
        paint: {
          'line-color': 'black',
          'line-opacity': 1,
          'line-width': 3
        },
        minzoom: 0,
        maxzoom: 24
      });
  }
};

export const refreshCurrentRecMakers = (map, options: any) => {
  if (options.IAPPMarker && options.currentIAPPGeo?.geometry && options.currentIAPPID) {
    options.IAPPMarker.setLngLat(options.currentIAPPGeo.geometry.coordinates);
    options.IAPPMarker.addTo(map);
  }
  if (options.activityMarker && options.activityGeo?.[0]?.geometry && options.currentActivityShortID) {
    options.activityMarker.setLngLat(centroid(options.activityGeo[0]).geometry.coordinates);
    options.activityMarker.addTo(map);
  }

  if (
    options.whatsHereMarker &&
    (options.userRecordOnHoverRecordRow?.geometry?.[0] || options.userRecordOnHoverRecordRow?.geometry)
  ) {
    console.dir(options);
    options.whatsHereMarker.setLngLat(
      centroid(options.userRecordOnHoverRecordRow?.geometry?.[0] || options.userRecordOnHoverRecordRow?.geometry)
        .geometry?.coordinates
    );
    options.whatsHereMarker.addTo(map);
  }
};

export const refreshHighlightedRecord = (map, options: any) => {
  const layerID = 'highlightRecordLayer';
  if (map && map.getLayer(layerID + 'shape')) {
    map.removeLayer(layerID + 'shape');
  }
  if (map && map.getLayer(layerID + 'outline')) {
    map.removeLayer(layerID + 'outline');
  }
  if (map && map.getLayer(layerID + 'zoomoutcircle')) {
    map.removeLayer(layerID + 'zoomoutcircle');
  }

  if (map && map.getLayer(layerID)) {
    map.removeLayer(layerID);
  }

  if (map && map.getSource(layerID)) {
    map.removeSource(layerID);
  }

  if (
    map &&
    options.userRecordOnHoverRecordType === 'Activity' &&
    options.userRecordOnHoverRecordRow &&
    options.userRecordOnHoverRecordRow?.geometry?.[0]
  ) {
    map
      .addSource(layerID, {
        type: 'geojson',
        data: options.userRecordOnHoverRecordRow.geometry[0]
      })
      .addLayer({
        id: layerID + 'shape',
        source: layerID,
        type: 'fill',
        paint: {
          'fill-color': 'white',
          'fill-outline-color': 'black',
          'fill-opacity': 0.7
        },
        minzoom: 0,
        maxzoom: 24
      })
      .addLayer({
        id: layerID + 'outline',
        source: layerID,
        type: 'line',
        paint: {
          'line-color': 'black',
          'line-opacity': 1,
          'line-width': 3
        },
        minzoom: 0,
        maxzoom: 24
      })
      .addLayer({
        id: layerID + 'zoomoutcircle',
        source: layerID,
        type: 'circle',
        paint: {
          'circle-color': 'white',
          'circle-radius': 3
        },
        minzoom: 0,
        maxzoom: 24
      });
  }

  if (map && options.userRecordOnHoverRecordType === 'IAPP' && options.userRecordOnHoverRecordRow) {
    map
      .addSource(layerID, {
        type: 'geojson',
        data: options.userRecordOnHoverRecordRow.geometry
      })
      .addLayer({
        id: layerID,
        source: layerID,
        type: 'circle',
        paint: {
          'circle-color': 'yellow',
          'circle-radius': 3
        },
        minzoom: 0,
        maxzoom: 24
      });
  }

  /*
  highlightedACTIVITY
  highlightedIAPP
  highlighedGeo
  */
};

export const addServerBoundariesIfNotExists = (serverBoundaries, map) => {
  if (map && serverBoundaries?.length > 0) {
    serverBoundaries.map((layer) => {
      const layerID = 'serverBoundary' + layer.id;

      if (!map.getSource(layerID)) {
        map
          .addSource(layerID, {
            type: 'geojson',
            data: layer.geojson
          })
          .addLayer({
            id: layerID,
            source: layerID,
            type: 'fill',
            paint: {
              'fill-color': 'blue',
              'fill-outline-color': 'yellow',
              'fill-opacity': 0.5
            },
            minzoom: 0,
            maxzoom: 24
          });
      }
    });
  }
};

export const refreshServerBoundariesOnToggle = (serverBoundaries, map) => {
  if (map && serverBoundaries?.length > 0) {
    serverBoundaries.map((layer) => {
      const layerID = 'serverBoundary' + layer.id;

      if (map.getSource(layerID) && map.getLayer(layerID)) {
        const visibility = map.getLayoutProperty(layerID, 'visibility');
        if (visibility !== 'none' && !layer.toggle) {
          map.setLayoutProperty(layerID, 'visibility', 'none');
        }
        if (visibility !== 'visible' && layer.toggle) {
          map.setLayoutProperty(layerID, 'visibility', 'visible');
        }
      }
    });
  }
};

export const addClientBoundariesIfNotExists = (clientBoundaries, map) => {
  if (map && clientBoundaries?.length > 0) {
    clientBoundaries.map((layer) => {
      const layerID = 'clientBoundaries' + layer.id;

      if (!map.getSource(layerID)) {
        console.dir(layer);
        map
          .addSource(layerID, {
            type: 'geojson',
            data: layer.geojson
          })
          .addLayer({
            id: layerID,
            source: layerID,
            type: 'fill',
            paint: {
              'fill-color': 'blue',
              'fill-outline-color': 'yellow',
              'fill-opacity': 0.5
            },
            minzoom: 0,
            maxzoom: 24
          });
      }
    });
  }
};

export const refreshClientBoundariesOnToggle = (clientBoundaries, map) => {
  if (map && clientBoundaries?.length > 0) {
    clientBoundaries.map((layer) => {
      const layerID = 'clientBoundaries' + layer.id;

      if (map.getSource(layerID) && map.getLayer(layerID)) {
        const visibility = map.getLayoutProperty(layerID, 'visibility');
        if (visibility !== 'none' && !layer.toggle) {
          map.setLayoutProperty(layerID, 'visibility', 'none');
        }
        if (visibility !== 'visible' && layer.toggle) {
          map.setLayoutProperty(layerID, 'visibility', 'visible');
        }
      }
    });
  }
};
