import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PMTiles, Protocol } from 'pmtiles';
import { CONFIG } from 'state/config';
import { useDispatch, useSelector } from 'react-redux';
import { c } from 'vitest/dist/reporters-5f784f42';
import './map.css';
import circle from '@turf/circle';

// Draw tools:
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import { MAP_WHATS_HERE_FEATURE } from 'state/actions';
import { useHistory } from 'react-router'
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

export const Map = (props: any) => {
  const [draw, setDraw] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const dispatch = useDispatch();
  const history = useHistory();

  // Avoid remounting map to avoid unnecesssary tile fetches or bad umounts:
  const authInitiated = useSelector((state: any) => state.Auth.initialized);

  // RecordSet Layers
  const storeLayers = useSelector((state: any) => state.Map?.layers);

  // WMS Layers
  const simplePickerLayers2 = useSelector((state: any) => state.Map?.simplePickerLayers2);

  // Map position jump
  const map_center = useSelector((state: any) => state.Map?.map_center);
  const map_zoom = useSelector((state: any) => state.Map?.map_zoom);

  // User tracking coords jump and markers/indicators
  const userCoords = useSelector((state: any) => state.Map?.userCoords);
  const accuracyToggle = useSelector((state: any) => state.Map?.accuracyToggle);
  const positionTracking = useSelector((state: any) => state.Map?.positionTracking);
  const positionMarkerEl = document.createElement('div');
  positionMarkerEl.className = 'userTrackingMarker';
  positionMarkerEl.style.backgroundImage = 'url(/assets/icon/circle.png)';
  positionMarkerEl.style.width = `32px`;
  positionMarkerEl.style.height = `32px`;
  const positionMarker = new maplibregl.Marker({ element: positionMarkerEl });
  const accuracyCircle = useSelector((state: any) => {
    if (state.Map?.userCoords?.long) {
      return circle([state.Map?.userCoords?.long, state.Map?.userCoords?.lat], state.Map?.userCoords?.accuracy, {
        steps: 64,
        units: 'meters'
      });
    } else {
      return null;
    }
  });

  const baseMapToggle = useSelector((state: any) => state.Map?.baseMapToggle);
  const whatsHereToggle = useSelector((state: any) => state.Map?.whatsHere?.toggle);

  // Map Init
  useEffect(() => {
    if (map.current || !authInitiated) return;
    mapInit(map, mapContainer, setDraw, dispatch, history);
  }, [authInitiated]);

  // RecordSet Layers:
  useEffect(() => {
    if (!map.current) return;
    rebuildLayersOnTableHashUpdate(storeLayers, map.current);
    refreshColoursOnColourUpdate(storeLayers, map.current);
    refreshVisibilityOnToggleUpdate(storeLayers, map.current);
    removeDeletedRecordSetLayersOnRecordSetDelete(storeLayers, map.current);
  }, [storeLayers]);

  // layer picker:
  useEffect(() => {
    if (!map.current) return;

    console.log('adding');
    simplePickerLayers2.map((layer) => {
      if (!map.current.getSource(layer.url))
        map.current
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
    console.dir(simplePickerLayers2);
    console.log(map.current.style.sourceCaches);
  }, [simplePickerLayers2, map]);

  // Jump Nav
  useEffect(() => {
    if (!map.current) return;
    if (map_center) map.current.jumpTo({ center: map_center, zoom: map_zoom });
  }, [map_center, map_zoom]);

  // User position tracking and marker
  useEffect(() => {
    if (!map.current) return;

    function animateMarker(timestamp) {
      positionMarker.setLngLat([userCoords.long, userCoords.lat]);
      // Ensure it's added to the map. This is safe to call if it's already added.
      positionMarker.addTo(map.current);
      // Request the next frame of the animation.
      requestAnimationFrame(animateMarker);
    }
    if (userCoords && positionTracking) {
      map.current.jumpTo({ center: [userCoords.long, userCoords.lat] });
      // Start the animation.
      requestAnimationFrame(animateMarker);
      if (!map.current.getSource('accuracyCircle') && accuracyCircle) {
        map.current
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
    toggleLayerOnBool(map.current, 'accuracyCircle', accuracyToggle && positionTracking);
  }, [userCoords, positionTracking, accuracyToggle]);

  //Toggle Topo
  useEffect(() => {
    if (!map.current) return;
    toggleLayerOnBool(map.current, 'Esri-Sat-Layer', !baseMapToggle);
    toggleLayerOnBool(map.current, 'Esri-Sat-Label', !baseMapToggle);
    toggleLayerOnBool(map.current, 'Esri-Topo', baseMapToggle);
  }, [baseMapToggle]);

  useEffect(() => {
    if (whatsHereToggle && draw) {
      draw.changeMode('whats_here_box_mode');
    }
  }, [whatsHereToggle]);

  return (
    <div className="MapWrapper">
      <div ref={mapContainer} className="Map" />
      {props.children}
    </div>
  );
};

const mapInit = (map, mapContainer, drawSetter, dispatch, history) => {
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
        glyphs: 'http://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
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
          },
          example_source: {
            type: 'vector',
            url: `pmtiles://${PMTILES_URL}`,
            //              url: `https://nrs.objectstore.gov.bc.ca/uphjps/invasives-local.pmtiles`,
            // url: `pmtiles://${ CONFIG.PUBLIC_MAP_URL}`,
            attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
          }
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
          },
          {
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
        ]
      }
    });
    initDrawModes(map.current, drawSetter, dispatch, history);
  });
};

const createActivityLayer = (map: any, layer: any) => {
  const layerID = 'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash;
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
        'fill-color': layer.layerState.color,
        'fill-outline-color': layer.layerState.color,
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
      'line-color': layer.layerState.color,
      'line-opacity': 1,
      'line-width': 3
    }
  });

  map.addLayer({
    id: 'polygon-circle-' + layerID,
    source: layerID,
    type: 'circle',
    paint: {
      'circle-color': layer.layerState.color,
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

const deleteStaleActivityLayer = (map: any, layer: any) => {
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

const createIAPPLayer = (map: any, layer: any) => {
  map
    .addSource(layer.recordSetID, {
      type: 'geojson',
      data: layer.geoJSON
    })
    .addLayer({
      id: layer.recordSetID,
      source: layer.recordSetID,
      type: 'circle',
      paint: {
        'circle-color': layer.layerState.color,
        'circle-radius': 3
      },
      minzoom: 0,
      maxzoom: 24
    });

  map.addLayer({
    id: 'label-' + layer.recordSetID,
    type: 'symbol',
    source: layer.recordSetID,
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

const deleteIAPPLayer = (map: any, layer: any) => {
  if (map.getLayer(layer.recordSetID)) {
    try {
      map.removeLayer(layer.recordSetID);
    } catch (e) {
      console.log('error removing layer', e);
    }
  }
  if (map.getLayer('label-' + layer.recordSetID)) {
    try {
      map.removeLayer('label-' + layer.recordSetID);
    } catch (e) {
      console.log('error removing layer', e);
    }
  }

  if (map.getSource(layer.recordSetID)) {
    try {
      map.removeSource(layer.recordSetID);
    } catch (e) {
      console.log('error removing source', e);
    }
  }
};

const rebuildLayersOnTableHashUpdate = (storeLayers, map) => {
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
        // deleteIAPPLayer(map, layer);
        // createIAPPLayer(map, layer);
      }
    }
  });
};

const refreshColoursOnColourUpdate = (storeLayers, map) => {
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
          currentColor = fillPolygonLayerStyle.paint['fill-color'];
          if (currentColor !== layer.layerState.color) {
            map.setPaintProperty(mapLayer, 'fill-color', layer.layerState.color);
            map.setPaintProperty(mapLayer, 'fill-outline-color', layer.layerState.color);
          }
          break;
        case /polygon-border-/.test(mapLayer):
          const polyGonBorderLayerStyle = map.getStyle().layers.find((el) => el.id === mapLayer);
          currentColor = polyGonBorderLayerStyle.paint['line-color'];
          if (currentColor !== layer.layerState.color) {
            map.setPaintProperty(mapLayer, 'line-color', layer.layerState.color);
          }
          break;
        case /polygon-circle-/.test(mapLayer):
          const activityCircleMarkerLayerStyle = map.getStyle().layers.find((el) => el.id === mapLayer);
          currentColor = activityCircleMarkerLayerStyle.paint['circle-color'];
          if (currentColor !== layer.layerState.color) {
            map.setPaintProperty(mapLayer, 'circle-color', layer.layerState.color);
          }
          break;
        default:
          'polygon';
      }
    });
  });
};

const refreshVisibilityOnToggleUpdate = (storeLayers, map) => {
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

const removeDeletedRecordSetLayersOnRecordSetDelete = (storeLayers, map) => {
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

const toggleLayerOnBool = (map, layer, boolToggle) => {
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

const initDrawModes = (map, drawSetter, dispatch, history) => {
  var DoNothing: any = {};
  DoNothing.onSetup = function (opts) {
    var state: any = {};
    state.count = opts.count || 0;
    return state;
  };
  DoNothing.onClick = function (state, e) {
    //this.changeMode('draw_polygon');
  };

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
    defaultMode: 'do_nothing',
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

  map.on('draw.create', (e) => {
    //enforce one at a time everywhere
    const feature = e.features[0];
    draw.deleteAll();
    draw.add(feature);

    // For whats here
    dispatch({ type: MAP_WHATS_HERE_FEATURE, payload: { feature: { type: 'Feature', geometry: feature.geometry } } });
    history.push('WhatsHere')
  });
  map.addControl(draw);
  drawSetter(draw);
};
