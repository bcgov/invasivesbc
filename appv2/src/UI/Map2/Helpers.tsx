import maplibregl from 'maplibre-gl';
import centroid from '@turf/centroid';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PMTiles, Protocol } from 'pmtiles';
import './map.css';

// Draw tools:
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import { MAP_WHATS_HERE_FEATURE, MAP_ON_SHAPE_CREATE, MAP_ON_SHAPE_UPDATE } from 'state/actions';
import { feature } from '@turf/helpers';
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
  whats_here_toggle
) => {
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

  const PMTILES_URL = `https://nrs.objectstore.gov.bc.ca/uphjps/invasives-local.pmtiles`;
  //const PMTILES_URL = 'https://protomaps.github.io/PMTiles/protomaps(vector)ODbL_firenze.pmtiles';

  const p = new PMTiles(PMTILES_URL);

  // this is so we share one instance across the JS code and the map renderer
  protocol.add(p);

  // we first fetch the header so we can get the center lon, lat of the map.
  p.getHeader().then((h) => {
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      maxZoom: 24,
      zoom: h.maxZoom - 2,
      center: [h.centerLon, h.centerLat],
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
          'Esri-Sat-Layer': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            maxzoom: 18
          },
          'Esri-Sat-Label': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            maxzoom: 18
          },
          'Esri-Topo': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            maxzoom: 18
          }
          /*example_source: {
            type: 'vector',
            url: `pmtiles://${PMTILES_URL}`,
            //              url: `https://nrs.objectstore.gov.bc.ca/uphjps/invasives-local.pmtiles`,
            // url: `pmtiles://${ CONFIG.PUBLIC_MAP_URL}`,
            attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
          }*/
        },
        layers: [
          {
            id: 'Esri-Sat-Label',
            type: 'raster',
            source: 'Esri-Sat-Label',
            minzoom: 0
          },
          {
            id: 'Esri-Sat-Layer',
            type: 'raster',
            source: 'Esri-Sat-Layer',
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
            id: 'wms-test-layer2',
            type: 'raster',
            source: 'wms-test-source',
            minzoom: 0
          }
          /*{
            id: 'invasives-vector',
            source: 'example_source',
            'source-layer': 'invasives',
            type: 'fill',
            paint: {
              'fill-color': 'steelblue'
            },
            minzoom: 0,
            maxzoom: 24
          },
          {
            id: 'buildings',
            source: 'example_source',
            'source-layer': 'landuse',
            type: 'fill',
            paint: {
              'fill-color': 'steelblue'
            },
            minzoom: 0
          }
          */
        ]
      }
    });
    refreshDrawControls(
      map.current,
      null,
      drawSetter,
      dispatch,
      uHistory,
      whats_here_toggle,
      appModeUrl,
      activityGeo,
      null
    );
  });
};

export const createActivityLayer = (map: any, layer: any) => {
  const layerID = 'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash;

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
  map
    .addSource(layerID, {
      type: 'geojson',
      data: layer.geoJSON
    })
    .addLayer({
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
    });

  map.addLayer({
    id: 'polygon-border-' + layerID,
    source: layerID,
    type: 'line',
    paint: {
      'line-color': getPaintBySchemeOrColor(layer),
      'line-opacity': 1,
      'line-width': 3
    }
  });

  map.addLayer({
    id: 'polygon-circle-' + layerID,
    source: layerID,
    type: 'circle',
    paint: {
      'circle-color': getPaintBySchemeOrColor(layer),
      'circle-radius': 3
    },
    maxzoom: 10
  });

  map.addLayer({
    id: 'label-' + layerID,
    type: 'symbol',
    source: layerID,
    layout: {
      //                'icon-image': 'dog-park-11',
      'text-field': [
        'format',
        ['upcase', ['get', 'short_id']],
        { 'font-scale': 1.3 },
        '\n',
        {},
        [
          'upcase',
          ['concat', ['get', 'type'], ' +  ', ['get', 'species_positive'], ' - ', ['get', 'species_negative']]
        ],
        { 'font-scale': 1.0 }
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
  });
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

export const createIAPPLayer = (map: any, layer: any) => {
  const layerID = 'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash;
  map
    .addSource(layerID, {
      type: 'geojson',
      data: layer.geoJSON
    })
    .addLayer({
      id: layerID,
      source: layerID,
      type: 'circle',
      paint: {
        'circle-color': layer.layerState.color || FALLBACK_COLOR,
        'circle-radius': 3
      },
      minzoom: 0,
      maxzoom: 24
    });

  map.addLayer({
    id: 'label-' + layerID,
    type: 'symbol',
    source: layerID,
    layout: {
      //                'icon-image': 'dog-park-11',
      'text-field': [
        'format',
        ['concat', 'IAPP-', ['to-string', ['get', 'site_id']]],
        { 'font-scale': 1.3 },
        '\n',
        {},
        ['to-string', ['get', 'species_on_site']],
        { 'font-scale': 1.0 }
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
  });
};

export const deleteStaleIAPPLayer = (map: any, layer: any) => {
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

export const rebuildLayersOnTableHashUpdate = (storeLayers, map) => {
  storeLayers.map((layer: any) => {
    if (layer.geoJSON && layer.loading === false) {
      if (layer.type === 'Activity') {
        deleteStaleActivityLayer(map, layer);
        const existingSource = map.getSource(
          'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash
        );
        if (existingSource === undefined) {
          createActivityLayer(map, layer);
        }
      } else if (layer.type === 'IAPP') {
        deleteStaleIAPPLayer(map, layer);
        const existingSource = map.getSource(
          'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash
        );
        if (existingSource === undefined) {
          createIAPPLayer(map, layer);
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
            if (currentColor !== layer.layerState.color && !layer.layerState.colorScheme) {
              map.setPaintProperty(mapLayer, 'fill-color', layer.layerState.color || FALLBACK_COLOR);
              map.setPaintProperty(mapLayer, 'fill-outline-color', layer.layerState.color || FALLBACK_COLOR);
            }
          } else {
            currentColor = fillPolygonLayerStyle.paint['circle-color'];
            if (currentColor !== layer.layerState.color) {
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
  const visibility = map.getLayoutProperty(layer, 'visibility');
  if (visibility !== 'visible' && boolToggle) {
    map.setLayoutProperty(layer, 'visibility', 'visible');
  }
  if (visibility !== 'none' && !boolToggle) {
    map.setLayoutProperty(layer, 'visibility', 'none');
  }
};

export const initDrawModes = (
  map,
  drawSetter,
  dispatch,
  uHistory,
  hideControls,
  activityGeo,
  whats_here_toggle,
  drawingCustomLayer
) => {
  ['draw.selectionchange', 'draw.create', 'draw.update'].map((eName) => {
    map?._listeners[eName]?.map((l) => {
      if (/customDrawListener/.test(l.name)) {
        map.off(eName, l);
      }
    });
  });

  var DoNothing: any = {};
  DoNothing.onSetup = function (opts) {
    //  if(map.draw && activityGeo)
    if (activityGeo) {
      this.addFeature(this.newFeature(activityGeo[0]));
    }

    var state: any = {};
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

  var WhatsHereBoxMode: any = { ...DrawRectangle };

  //Example from docs - keeping as template:
  var LotsOfPointsMode: any = {};

  // When the mode starts this function will be called.
  // The `opts` argument comes from `draw.changeMode('lotsofpoints', {count:7})`.
  // The value returned should be an object and will be passed to all other lifecycle functions
  LotsOfPointsMode.onSetup = function (opts) {
    var state: any = {};
    state.count = opts.count || 0;
    return state;
  };

  // Whenever a user clicks on the map, Draw will call `onClick`
  LotsOfPointsMode.onClick = function (state, e) {
    // `this.newFeature` takes geojson and makes a DrawFeature
    var point = this.newFeature({
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
  var draw = new MapboxDraw({
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
  map.addControl(draw, 'top-left');

  //  if(activityGeo)
  // draw.add(activityGeo[0])

  drawSetter(draw);

  if (activityGeo) {
    console.dir(activityGeo);
    draw.add({ type: 'FeatureCollection', features: activityGeo });
  }

  const customDrawListenerCreate = (e) => {
    //enforce one at a time everywhere
    const feature = e.features[0];
    try {
      console.dir(draw);
      draw.deleteAll();
      draw.add(feature);
    } catch (e) {
      console.log(e);
    }

    // For whats here
    if (whats_here_toggle) {
      dispatch({ type: MAP_WHATS_HERE_FEATURE, payload: { feature: { type: 'Feature', geometry: feature.geometry } } });
      uHistory.push('/WhatsHere');
    } else {
      dispatch({ type: MAP_ON_SHAPE_CREATE, payload: feature });
    }
  };

  const customDrawListenerUpdate = (e) => {
    const feature = e.features[0];
    console.dir(feature);
    /* try {
      console.dir(draw);
      draw.deleteAll();
      draw.add(feature);
    } catch (e) {
      console.log(e);
    }
    */
  };
  // dispatch({ type: MAP_ON_SHAPE_UPDATE, payload: feature})

  const customDrawListenerSelectionChange = (e) => {
    const editedGeo = draw.getAll()?.features[0];

    /* try {
      console.dir(draw);
      draw.deleteAll();
      draw.add(feature);
    } catch (e) {
      console.log(e);
    }
    */

    console.dir(e);
    console.dir(editedGeo);
    if (editedGeo.id !== e?.features[0]?.id) {
      dispatch({ type: MAP_ON_SHAPE_UPDATE, payload: editedGeo });
    }
  };

  map.on('draw.create', customDrawListenerCreate);
  map.on('draw.update', customDrawListenerUpdate);
  map.on('draw.selectionchange', customDrawListenerSelectionChange);
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
          minzoom: 0
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
    if (/Report|Batch|Landing|WhatsHere/.test(appModeUrl)) {
      initDrawModes(map, drawSetter, dispatch, uHistory, true, null, whatsHereToggle, null);
    } else if (/Records/.test(appModeUrl)) {
      if (/Activity/.test(appModeUrl)) {
        initDrawModes(map, drawSetter, dispatch, uHistory, false, activityGeo, whatsHereToggle, drawingCustomLayer);
      } else {
        initDrawModes(map, drawSetter, dispatch, uHistory, false, null, whatsHereToggle, drawingCustomLayer);
      }
    }
  }

  /*
    if (whatsHereToggle && draw) {
      draw.changeMode('whats_here_box_mode');
    } else {
      draw.changeMode('do_nothing');
    }
    */
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
};

export const refreshHighlightedRecord = (map, options: any) => {
  const layerID = 'highlightRecordLayer';
  if (map && map.getLayer(layerID)) {
    map.removeLayer(layerID);
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
        id: layerID,
        source: layerID,
        type: 'fill',
        paint: {
          'fill-color': 'yellow',
          'fill-outline-color': 'yellow',
          'fill-opacity': 0.5
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
        console.dir(layer)
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
