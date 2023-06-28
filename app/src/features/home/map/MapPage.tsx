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
import { PMTileLayer } from '../../../components/map/Layers/PMTileLayer';
import { IAPPPMTilesLayer } from '../../../components/map/Layers/IAPPPMTilesLayer';

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
            <IAPPPMTilesLayer />
          </MapContainer>
        </Suspense>
      </MapRecordsContextProvider>
    </>
  );
};

export default MapPage;
