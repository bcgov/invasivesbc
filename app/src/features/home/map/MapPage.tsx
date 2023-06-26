import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectMap } from '../../../state/reducers/map';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material';
import { MapRecordsContextProvider } from '../../../contexts/MapRecordsContext';
import { PUBLIC_MAP_LOAD_ALL_REQUEST } from '../../../state/actions';
import { selectPublicMapState } from '../../../state/reducers/public_map';
import Spinner from '../../../components/spinner/Spinner';
import { GeoJSON } from 'react-leaflet';
import { GeoJSONVtLayer } from '../../../components/map/LayerLoaderHelpers/GeoJsonVtLayer';

const MapContainer = lazy(() => import('components/map/MapContainer'));

const useStyles = makeStyles((theme: Theme) => ({
  mapContainer: {
    flex: 1,
    transition: 'height 0.3s ease-in-out'
  },
  map: {
    height: '100%',
    width: '100%',
    zIndex: 0
  }
}));

const MapPage = () => {
  const mapState = useSelector(selectMap);
  const [geometry, setGeometry] = useState<any[]>([]);

  const classes = useStyles();

  const dispatch = useDispatch();
  const { layers, initialized } = useSelector(selectPublicMapState);

  useEffect(() => {
    dispatch({ type: PUBLIC_MAP_LOAD_ALL_REQUEST });
  }, []);

  const [ActivitiesGEOJSON, setActivitiesGEOJSON] = useState([]);
  const [IAPPGeoJSON, setIAPPGeoJSON] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initialized) {
      const activities = layers.activities?.result?.rows?.map((o) => ({
        ...JSON.parse(o.geo),
        properties: {
          short_id: o.short_id
        }
      }));
      setActivitiesGEOJSON(activities);

      setIAPPGeoJSON({ type: 'FeatureCollection', features: layers.iapp.result });

      setReady(true);
    }
  }, [initialized]);
  if (!initialized || !ready) {
    return <Spinner />;
  }

  return (
    <>
      <MapRecordsContextProvider>
        <Suspense fallback={<span>Map loading</span>}>
          <MapContainer
            classes={classes}
            showDrawControls={false}
            setShowDrawControls={() => {}}
            showBoundaryMenu={false}
            center={mapState.activity_center}
            zoom={mapState?.activity_zoom}
            mapId={'mainMap'}
            isPublicMode={true}
            geometryState={{ geometry, setGeometry }}>
            <GeoJSON
              key={'activities'}
              data={ActivitiesGEOJSON}
              onEachFeature={(f, l) => {
                l.bindPopup(f.properties.short_id);
              }}
            />
            <GeoJSONVtLayer
              key={'iapp'}
              zIndex={10001}
              options={{
                maxZoom: 24,
                minZoom: 1,
                tolerance: 200,
                extent: 4096,
                buffer: 128,
                indexMaxPoints: 200000,
                layerStyles: {},
                style: {
                  stroke: false,
                  strokeOpacity: 1,
                  strokeWidth: 2,
                  opacity: 1.0,
                  fillOpacity: 0.8,
                  weight: 1,
                  zIndex: 10003
                }
              }}
              geoJSON={IAPPGeoJSON}
            />
          </MapContainer>
        </Suspense>
      </MapRecordsContextProvider>
    </>
  );
};

export default MapPage;
