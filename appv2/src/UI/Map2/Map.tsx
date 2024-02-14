import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PMTiles, Protocol } from 'pmtiles';
import { CONFIG } from 'state/config';
import { useSelector } from 'react-redux';
//import './map.css';

export const Map = (props: any) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(139.753);
  const [lat] = useState(35.6844);
  const [zoom] = useState(14);

  const storeLayers = useSelector(
    (state: any) => state.Map?.layers
    /*(prev, next) => {
      return prev.length == next.length;
    }*/
  );

  const toggledOnLayers = storeLayers.filter((layer: any) => layer.toggledOn);

  useEffect(() => {
    try {
      //   maplibregl.setRTLTextPlugin('https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js', true);
    } catch (e) {
      console.log('error setting rtl text plugin', e);
    }

    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          console.log('error removing map', e);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (map.current) return;
    // add the PMTiles plugin to the maplibregl global.

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
  }, []);

  useEffect(() => {
    if (!map.current) return;

    console.log('in hook that adds stuff');

    // Create new sources and layers if they don't exist, and blow away those with stale tableFilterHash's
    storeLayers.map((layer: any) => {
      if (layer.layerState.mapToggle && layer.geoJSON && layer.loading === false) {
        if (layer.type === 'Activity') {
          deleteStaleActivityLayer(map.current, layer);
          const existingSource = map.current.getSource('recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash)
          if(existingSource === undefined)
          {
            createActivityLayer(map.current, layer);
          }
        } else if (layer.type === 'IAPP') {
          deleteIAPPLayer(map.current, layer);
          createIAPPLayer(map.current, layer);
        }
      }
    });

    map.current.getLayersOrder().map((layer: any) => {
      if (
        storeLayers.filter((l: any) => l.recordSetID === layer).length === 0 &&
        !['wms-test-layer', 'wms-test-layer2', 'invasives-vector', 'buildings'].includes(layer)
      ) {
        //map.current.removeLayer(layer);
        //map.current.removeSource(layer);
      }
    });
  }, [storeLayers]);

  return (
    <div className="MapWrapper">
      <div ref={mapContainer} className="Map" />
    </div>
  );
};

const createActivityLayer = (map: any, layer: any) => {
  const layerID = 'recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash;
  console.log('creating')
  console.log('typeof', typeof map);
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
  if(!map) {
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
  console.log(map.style.sourceCaches);

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
