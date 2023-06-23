import React, { lazy, Suspense, useState } from 'react';
import { RecordSetLayersRenderer } from '../../../components/map/LayerLoaderHelpers/RecordSetLayersRenderer';
import { useSelector } from 'react-redux';
import { selectMap } from '../../../state/reducers/map';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material';
import { MapRecordsContextProvider } from '../../../contexts/MapRecordsContext';

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

  return (
    <>
      <MapRecordsContextProvider>
        <Suspense fallback={<span>Map loading</span>}>
          <MapContainer
            classes={classes}
            showDrawControls={false}
            setShowDrawControls={() => {
            }}
            showBoundaryMenu={false}
            center={mapState.activity_center}
            zoom={mapState?.activity_zoom}
            mapId={'mainMap'}
            isPublicMode={true}
            geometryState={{ geometry, setGeometry }}>

            {mapState.IAPPGeoJSON?.features.length ? <RecordSetLayersRenderer /> : <></>}
          </MapContainer>
        </Suspense>
      </MapRecordsContextProvider>
    </>
  );
};

export default MapPage;
