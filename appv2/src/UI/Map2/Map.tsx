import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PMTiles, Protocol } from 'pmtiles';
import { CONFIG } from 'state/config';
import { useSelector } from 'react-redux';
import { c } from 'vitest/dist/reporters-5f784f42';
//import './map.css';

export const Map = (props: any) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const authInitiated = useSelector((state: any) => state.Auth.initialized)

  const storeLayers = useSelector((state: any) => state.Map?.layers);

  useEffect(() => {
    if (map.current || !authInitiated) return;
    mapInit(map, mapContainer);
  }, [authInitiated]);

  useEffect(() => {
    if (!map.current) return;
    rebuildLayersOnTableHashUpdate(storeLayers, map.current);
    refreshColoursOnColourUpdate(storeLayers, map.current);
    refreshVisibilityOnToggleUpdate(storeLayers, map.current);
    removeDeletedRecordSetLayersOnRecordSetDelete(storeLayers, map.current);
  }, [storeLayers]);

  return (
    <div className="MapWrapper">
      <div ref={mapContainer} className="Map" />
      {props.children}
    </div>
  );
};

const mapInit = (map, mapContainer) => {
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
          'wms-test-source2': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
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
            id: 'wms-test-layer',
            type: 'raster',
            source: 'wms-test-source2',
            minzoom: 0
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
