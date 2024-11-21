import * as React from 'react';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import maplibregl from 'maplibre-gl';
import { PMTiles, Protocol } from 'pmtiles';
import { RecordSetLayers } from './RecordSetLayers3';

export const MainMap = ({ children }) => {
  const pmtilesProtocol = new Protocol();
  maplibregl.addProtocol('pmtiles', (request) => {
    return new Promise((resolve, reject) => {
      const callback = (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({ data });
        }
      };
      pmtilesProtocol.tile(request, callback);
    });
  });

  const PMTILES_URL = `https://nrs.objectstore.gov.bc.ca/rzivsz/invasives-prod.pmtiles/{z}/{x}/{y}`;

  const p = new PMTiles(PMTILES_URL);

  // this is so we share one instance across the JS code and the map renderer
  pmtilesProtocol.add(p);
  const API_BASE = useSelector((state: any) => state.Configuration.current.API_BASE);
  const authenticated = useSelector((state: any) => state.Auth.authenticated);
  const [currentAuthHeader, setCurrentAuthHeader] = useState<string>('');
  const authHeaderRef = useRef<string>();
  authHeaderRef.current = currentAuthHeader;



  useEffect(() => {
    if (!authenticated) {
      return;
    }

    // get it once with no delay
    getCurrentJWT().then((header) => {
      setCurrentAuthHeader(header);
    });

    // and then regularly thereafter
    const id = setInterval(() => {
      getCurrentJWT().then((header) => {
        setCurrentAuthHeader(header);
      });
    }, 10000);

    return () => {
      clearInterval(id);
    };
  }, [authenticated]);

  // for logged in or out layers:
  const getAuthHeaderCallback = () => {
    if (authHeaderRef.current === undefined) {
      console.error('requested access before header received');
      return '';
    }
    return authHeaderRef.current;
  };
  const transformRequest = (url, resourceType) => {
    if (url.includes(API_BASE)) {
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
  }
  return (
    <div className="map-containing-block">
      <div className="MapWrapper">
        <Map
          initialViewState={{
            longitude: -123.333959,
            latitude: 48.4229865,
            zoom: 12,
          }}
          minZoom={1}
          attributionControl={false}
          transformRequest={transformRequest}
          mapLib={maplibregl}
          interactiveLayerIds={['pmtiles-layer']}
          mapStyle={{
            glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
            version:8,
            sources:{
              // "esri-sat-label-source": {
              //   type: 'raster',
              //   tiles: [
              //     'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
              //   ],
              //   tileSize: 256,
              //   attribution: 'Powered by ESRI',
              //   maxzoom: 18
              // },
              // "wms-source":{
              //   type: 'raster',
              //   tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              //   attribution: 'Powered by ESRI',
              //   tileSize: 256,
              //   maxzoom: 24,
              // }
            },
            layers:[
              // {
              //   id: `Esri-Sat-LayerHD`,
              //   type: 'raster',
              //   source: 'wms-source',
              //   minzoom: 0
              // },
              // {
              //   id: `Esri-Sat-LabelHD`,
              //   type: 'raster',
              //   source: 'esri-sat-label-source',
              //   minzoom: 0
              // }
            ]
          }}
        >
          <Source
            id='wms-source'
            type='raster'
            tiles={[
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            ]}
            tileSize={256}
          >
            <Layer
              id='wms-layer'
              type='raster'
              source='wms-source'
            />
          </Source>

          <Source
            id='pmtiles-source'
            type='vector'
            tiles={[
              `pmtiles://${PMTILES_URL}`
            ]}
          >
            <Layer
              id='invasives-layer'
              type='circle'
              source='pmtiles-source'
              source-layer='invasives'
              paint={{ 'circle-color': 'lightskyblue', 'circle-opacity': 1.0 }}
              layout={{ visibility: authenticated ? 'none' : 'visible' }}
              minzoom={0}
              
            />
            <Layer
              id='invasives-label-layer'
              type='symbol'
              source='pmtiles-source'
              source-layer='invasives'
              paint={{
                'text-color': 'black',
                'text-halo-color': 'white',
                'text-halo-width': 1,
                'text-halo-blur': 1
              }}
              layout={{
                'text-field': [
                  'format',
                  ['upcase', ['get', 'id']],
                  { 'font-scale': 0.9 },
                  '\n',
                  {},
                  ['get', 'map_symbol'],
                  { 'font-scale': 0.9 }
                ],
                'text-font': ['literal', ['Open Sans Bold']],
                'text-offset': [0, 0.6],
                'text-anchor': 'top'
              }}
            />
            <Layer
              id='iapp-layer'
              type='circle'
              source='pmtiles-source'
              source-layer='iapp'
              paint={{ 'circle-color': 'limegreen', 'circle-opacity': 1.0 }}
              layout={{ visibility: authenticated ? 'none' : 'visible' }}
              // maxzoom={24}
            />
            <Layer
              id='iapp-label-layer'
              type='symbol'
              source='pmtiles-source'
              source-layer='iapp'
              paint={{
                'text-color': 'black',
                'text-halo-color': 'white',
                'text-halo-width': 1,
                'text-halo-blur': 1
              }}
              layout={{
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
                'text-offset': [0, 0.6],
                'text-anchor': 'top'
              }}
              // maxzoom={24}
            />
          </Source>

          {/* <RecordSetLayers /> */}
        </Map>
        <div id="LoadingMap" className={!true ? 'loadingMap' : 'loadedMap'}>
          Loading tiles...
        </div>
        {children}
      </div>
    </div>
  )
};