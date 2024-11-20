import * as React from 'react';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import Map, {Source, Layer} from 'react-map-gl/maplibre';
import type {FillLayer} from 'react-map-gl/maplibre';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { RasterSource } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { PMTiles, Protocol } from 'pmtiles';
import { ButtonContainer } from './Controls/ButtonContainer';

export const MainMap= ({children}) =>{
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
    const  API_BASE  = useSelector((state: any) => state.Configuration.current.API_BASE);
  const authenticated = useSelector((state: any) => state.Auth.authenticated);
  const [currentAuthHeader, setCurrentAuthHeader] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const authHeaderRef = useRef<string>();
  authHeaderRef.current = currentAuthHeader;

  const mapRef = useRef(null);
    
    const handleMapLoad = ()=> {
        const map = mapRef.current?.getMap();
        console.log("Inside ", mapRef.current);
        
        if (map) {
            map.addSource('wms-source', {
                type: 'raster',
                tiles: [
                    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                ],
                tileSize: 256,
            });

            map.addLayer({
                id:'wms-layer',
                type:'raster',
                source: 'wms-source',
                
            });
        }
    };  

    const handleInitialLoad = () =>{
        console.log("Called");
        
        setMapLoaded(true);
    }

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
    const transformRequest = (url) => {
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
                    // ref={mapRef}
                    initialViewState={{
                        longitude: -123.333959,
                        latitude: 48.4229865,
                        zoom:12,
                    }}
                    minZoom={1}
                    attributionControl={false}
                    // transformRequest={(url)=>{return transformRequest(url);}}
                    // mapStyle="https://wms.wheregroup.com/tileserver/style/osm-bright.json"
                    mapLib={maplibregl}
                    onLoad={handleInitialLoad}
                    // onLoad={handleMapLoad}
                    interactiveLayerIds={['pmtiles-layer']}
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
                            id='pmtiles-layer'
                            type='circle'
                            source='pmtiles-source'
                            source-layer='invasives'
                            paint={{ 'circle-color': '#0905f5', 'circle-opacity': 1.0 }}
                        />
                    </Source>
                    <ButtonContainer></ButtonContainer>
                </Map>
            </div>
        </div>
    )
};