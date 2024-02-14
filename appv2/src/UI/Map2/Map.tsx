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

  useEffect(()=> {
    maplibregl.setRTLTextPlugin('https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js', true);
  },[])

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
              minzoom: 0,
            },
            {
              id: 'wms-test-layer2',
              type: 'raster',
              source: 'wms-test-source',
              minzoom: 0,
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
              maxzoom: 24,
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
            }
          ]
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // update to only map over whats new
    storeLayers.map((layer: any) => {
      if (layer.layerState.mapToggle && layer.geoJSON && layer.loading === false) {
        if (map.current.getLayer(layer.recordSetID)) {
          try {
            map.current.removeLayer(layer.recordSetID);
          } catch (e) {
            console.log('error removing layer', e);
          }
        }
        if (map.current.getLayer('label-' + layer.recordSetID)) {
          try {
            map.current.removeLayer('label-' + layer.recordSetID);
          } catch (e) {
            console.log('error removing layer', e);
          }
        }

        if (map.current.getSource(layer.recordSetID)) {
          try {
            map.current.removeSource(layer.recordSetID);
          } catch (e) {
            console.log('error removing source', e);
          }
        }

        map.current
          .addSource(layer.recordSetID, {
            type: 'geojson',
            data: layer.geoJSON
          })
          .addLayer({
            id: layer.recordSetID,
            source: layer.recordSetID,
            type: layer.type === 'IAPP' ? 'circle' : 'fill',
            paint:
              layer.type === 'IAPP'
                ? {
                    'circle-color': layer.layerState.color,
                    'circle-radius': 3
                  }
                : {
                    'fill-color': layer.layerState.color,
                    'fill-outline-color': layer.layerState.color,
                    'fill-opacity': 0.5
                  },
            minzoom: 0,
            maxzoom: 24
          });

          if(layer.type === 'Activity') {
            map.current.addLayer({
            id: 'polygon-border-' + layer.recordSetID,
            source: layer.recordSetID,
            type: 'line',
            paint:
                 {
                    'line-color': layer.layerState.color,
                    'line-opacity': 1,
                    'line-width': 3,
                  },

            })
          }

        if (layer.layerState.labelToggle) {
          console.log('layer type', layer.type);

          if(layer.type === 'IAPP') {
          map.current.addLayer({
            id: 'label-' + layer.recordSetID,
            type: 'symbol',
            source: layer.recordSetID,
            // Doc for styling text https://maplibre.org/maplibre-style-spec/expressions/
            layout: {
              //                'icon-image': 'dog-park-11',
              'text-field': [
                'format',
                ['concat', 'IAPP-', ['to-string', ['get','site_id']]],
                { 'font-scale': 1.3 },
                '\n',
                {},
                ['to-string', ['get', 'species_on_site']],
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
        }
        else
        {
          map.current.addLayer({
            id: 'label-' + layer.recordSetID,
            type: 'symbol',
            source: layer.recordSetID,
            layout: {
              //                'icon-image': 'dog-park-11',
              'text-field': [
                'format',
                ['upcase', ['get', 'short_id']],
                { 'font-scale': 1.3 },
                '\n',
                {},
                ['upcase', ['concat', ['get', 'type'], ' +  ', ['get', 'species_positive'], ' - ', ['get', 'species_negative']]],
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
        }
        }
      } else {
        if (map.current.getLayer(layer.recordSetID)) {
          try {
            map.current.removeLayer(layer.recordSetID);
          } catch (e) {
            console.log('error removing layer', e);
          }
        }
        if (map.current.getLayer('label-' + layer.recordSetID)) {
          try {
            map.current.removeLayer('label-' + layer.recordSetID);
          } catch (e) {
            console.log('error removing layer', e);
          }
        }

        if (map.current.getSource(layer.recordSetID)) {
          try {
            map.current.removeSource(layer.recordSetID);
          } catch (e) {
            console.log('error removing source', e);
          }
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
