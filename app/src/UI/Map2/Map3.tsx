import * as React from 'react';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import Map from 'react-map-gl/maplibre';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import maplibregl from 'maplibre-gl';
import { RecordSetLayers } from './RecordSetLayers3';
import { PublicLayer } from './PublicLayer';

export const MainMap = ({ children }) => {
  const API_BASE = useSelector((state: any) => state.Configuration.current.API_BASE);
  const authenticated = useSelector((state: any) => state.Auth.authenticated);
  const [currentAuthHeader, setCurrentAuthHeader] = useState<string>('');
  const authHeaderRef = useRef<string>();
  authHeaderRef.current = currentAuthHeader;

  const map_center = useSelector((state: any) => state.Map.map_center);

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
            longitude: map_center[1],
            latitude: map_center[0],
            zoom: 3,
          }}
          minZoom={0}
          maxZoom={24}
          attributionControl={false}
          transformRequest={transformRequest}
          mapLib={maplibregl}
          // interactiveLayerIds={['pmtiles-layer']}
          mapStyle={{
            glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
            version: 8,
            sources: {
              "esri-sat-label-source": {
                type: 'raster',
                tiles: [
                  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
                ],
                tileSize: 256,
                attribution: 'Powered by ESRI',
                maxzoom: 18
              },
              "esri-sat-layer-hd": {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                attribution: 'Powered by ESRI',
                tileSize: 256,
                maxzoom: 24,
              },
              "esri-sat-layer-sd": {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                attribution: 'Powered by ESRI',
                tileSize: 256,
                maxzoom: 18,
              },
              "esri-topo": {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
                attribution: 'Powered by ESRI',
                tileSize: 256,
                maxzoom: 18,
              }

            },
            layers: [
              {
                id: 'esri-sat-layer-hd',
                type: 'raster',
                source: 'esri-sat-layer-hd',
                minzoom: 0
              },
              {
                id: `esri-sat-label-hd`,
                type: 'raster',
                source: 'esri-sat-label-source',
                minzoom: 0
              },
              // {
              //   id: `esri-sat-layer-sd`,
              //   type: 'raster',
              //   source: 'esri-sat-layer-sd',
              //   minzoom: 0
              // },
              // {
              //   id: `esri-sat-label-sd`,
              //   type: 'raster',
              //   source: 'esri-sat-label-source',
              //   minzoom: 0
              // },
              // {
              //   id: 'esri-topo',
              //   type: 'raster',
              //   source: 'esri-topo',
              //   minzoom: 0,
              // }
            ]
          }}
        >
          {/* <Source
            id='esri-sat-label-source'
            type='raster'
            tiles={[
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ]}
            tileSize={256}
            maxzoom={18}
          />
          <Source
            id='esri-sat-layer-hd'
            type='raster'
            tiles={[
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            ]}
            tileSize={256}
          >
            <Layer
              id='wms-layer'
              type='raster'
              source='esri-sat-layer-hd'
            />
          </Source> */}
          {!authenticated ?
            <PublicLayer />
            : <></>
          }


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