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
    (state: any) => state.Map?.layers,
    /*(prev, next) => {
      return prev.length == next.length;
    }*/
  );

  const toggledOnLayers = storeLayers.filter((layer: any) => layer.toggledOn);

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

    const PMTILES_URL =  `https://nrs.objectstore.gov.bc.ca/uphjps/invasives-local.pmtiles`
    //const PMTILES_URL = 'https://protomaps.github.io/PMTiles/protomaps(vector)ODbL_firenze.pmtiles';

    const p = new PMTiles(PMTILES_URL);

    // this is so we share one instance across the JS code and the map renderer
    protocol.add(p);

    // we first fetch the header so we can get the center lon, lat of the map.
    p.getHeader().then((h) => {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        zoom: h.maxZoom - 2,
        center: [h.centerLon, h.centerLat],
        style: {
          version: 8,
          sources: {
            'wms-test-source': {
              type: 'raster',
              tiles: [
                'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP'
              ],
              tileSize: 256
            },
            'wms-test-source2': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256
            },
            example_source: {
              type: 'vector',
              url: `pmtiles://${PMTILES_URL}`,
              //              url: `https://nrs.objectstore.gov.bc.ca/uphjps/invasives-local.pmtiles`,
              // url: `pmtiles://${ CONFIG.PUBLIC_MAP_URL}`,
              attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
            },
          },
          layers: [
            {
              id: 'wms-test-layer',
              type: 'raster',
              source: 'wms-test-source2',
              minzoom: 0,
              maxzoom: 22
            },
            {
              id: 'wms-test-layer2',
              type: 'raster',
              source: 'wms-test-source',
              minzoom: 0,
              maxzoom: 22
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
              maxzoom: 22
            },
            {
              id: 'buildings',
              source: 'example_source',
              'source-layer': 'landuse',
              type: 'fill',
              paint: {
                'fill-color': 'steelblue'
              },

              minzoom: 0,
              maxzoom: 22
            },
            
          ]
        },
      });
    });
  }, []);



  useEffect(() => {
    if (!map.current) return;

    // update to only map over whats new
    storeLayers.map((layer: any) => { 

      if(layer.layerState.mapToggle && layer.geoJSON && layer.loading === false) {
        if(map.current.getLayer(layer.recordSetID)) {
          map.current.removeLayer(layer.recordSetID)
        }

        if(map.current.getSource(layer.recordSetID)) {
          map.current.removeSource(layer.recordSetID)
        }

        map.current.addSource(layer.recordSetID, {
          type: 'geojson',
          data: layer.geoJSON
          }).addLayer({
            id: layer.recordSetID,
            source: layer.recordSetID,
            type:  layer.type === 'IAPP'? 'circle': 'fill',
            paint: layer.type === 'IAPP' ? {
              'circle-color':  layer.layerState.color,
              'circle-radius': 3,
            } : {
              'fill-color': layer.layerState.color,
              'fill-opacity': 0.5,
            },
            minzoom: 0,
            maxzoom: 22
          }
        )
      }
      else {
        if(map.current.getLayer(layer.recordSetID)) {
          map.current.removeLayer(layer.recordSetID)
        }

        if(map.current.getSource(layer.recordSetID)) {
          map.current.removeSource(layer.recordSetID)
        }

      }
    })

    map.current.getLay
    map.current.getLayersOrder().map((layer: any) => {
      if(storeLayers.filter((l: any) => l.recordSetID === layer).length === 0 && ![ 'wms-test-layer', 'wms-test-layer2', 'invasives-vector', 'buildings'].includes(layer)) {
        map.current.removeLayer(layer)
        map.current.removeSource(layer)
      }})

  }, [storeLayers])



  return (
    <div className="MapWrapper">
      <div ref={mapContainer} className="Map" />
    </div>
  );
};
