import { MapLibreMap, MlVectorTileLayer, MlWmsLayer, useAddProtocol } from '@mapcomponents/react-maplibre';
import './map.css';
import { PMTiles, Protocol } from 'pmtiles';
import { useSelector } from 'react-redux';
import { RecordSetLayers } from './RecordSetLayers';
import { useEffect, useRef, useState } from 'react';
import { getCurrentJWT } from 'state/sagas/auth/auth';

let protocol = new Protocol();
export const Map = ({ children }) => {
  const  API_BASE  = useSelector((state: any) => state.Configuration.current.API_BASE);
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
    if(authHeaderRef.current === undefined) {
      console.error('requested access before header received');
      return '';
    }
    return authHeaderRef.current;
  };

  useAddProtocol({
    protocol: 'pmtiles',
    handler: protocol.tile
  });


  //if(!authenticated)
   // return null;

  return (
    <div className="map-containing-block">
      <div className="MapWrapper">
        <MapLibreMap
          mapId="map"
          options={{
            center: [-123.333959, 48.4229865],
            zoom: 12,
            //style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
            attributionControl: false,
            minZoom: 1,
            transformRequest: (url) => {
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
          }}
        />
        
                <MlWmsLayer
                layerId='banana'
          mapId="map"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
       

        <RecordSetLayers />

        <MlVectorTileLayer
          mapId='map'
          layerId="pmtiles"
          layers={[
            {
              id: 'invasivesbc-pmtile-vector',
              type: 'circle',
              source: 'pmtiles',
              'source-layer': 'invasives',
              layout: {
                visibility: !authenticated ? 'visible' : 'none'
              },
              paint: { 'circle-color': '#0905f5', 'circle-opacity': 1.0 },
              //maxzoom: 30
            },
            {
              id: 'iapp-pmtile-vector',
              type: 'circle',
              source: 'pmtiles',
              'source-layer': 'iapp',
              layout: {
                visibility: !authenticated ? 'visible' : 'none'
              },
              paint: { 'circle-color': '#0905f5', 'circle-opacity': 1.0 },
              //maxzoom: 30
            }
          ]}
          url="pmtiles://https://nrs.objectstore.gov.bc.ca/rzivsz/invasives-prod.pmtiles/{z}/{x}/{y}"
        />
        <div id="LoadingMap" className={!true ? 'loadingMap' : 'loadedMap'}>
          Loading tiles...
        </div>
        {children}
      </div>
    </div>
  );
};
