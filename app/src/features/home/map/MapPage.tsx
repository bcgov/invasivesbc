import { Box, Button, Container, Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ActivitiesLayerV2 } from 'components/map/LayerLoaderHelpers/ActivitiesLayerV2';
import { RecordSetLayersRenderer } from 'components/map/LayerLoaderHelpers/RecordSetLayersRenderer';
import MapContainer from 'components/map/MapContainer';
import { AuthStateContext } from 'contexts/authStateContext';
import { MapRecordsContextProvider } from 'contexts/MapRecordsContext';
import { Feature, GeoJsonObject } from 'geojson';
import React, { useContext, useEffect, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useHistory } from 'react-router';
import { MapContextMenu, MapContextMenuData } from './MapContextMenu';

const useStyles = makeStyles((theme: Theme) => ({
  mapContainer: {
    height: '100%',
    padding: 0
  },
  map: {
    height: '100%',
    width: '100%',
    zIndex: 0
  },
  mainGrid: {
    height: '100%',
    width: '100%'
  },
  mapGridItemExpanded: {
    height: '100%',
    width: '100%'
  },
  mapGridItemShrunk: {
    height: '60%',
    width: '100%'
  },
  popOutGridItemExpanded: {
    height: '40%',
    display: 'inherit',
    width: '100%'
  },
  popOutGridItemShrunk: {
    height: '0%',
    display: 'none',
    width: '100%'
  },
  popOutComponent: {
    width: '100%',
    backgroundColor: theme.palette.background.paper
  }
}));

interface IMapProps {
  classes?: any;
}

interface popOutComponentProps {
  classes?: any;
  selectedGeo?: any;
  buttonCloseCallback: Function;
}

const PopOutComponent: React.FC<popOutComponentProps> = (props) => {
  const classes = useStyles();
  const buttonLabels = ['Close', 'Edit', 'Photos', 'Show related activities'];

  //very quick and dirty style for demo:
  return (
    <div className={classes.popOutComponent}>
      <br />
      <blockquote>
        <Grid container spacing={3}>
          {buttonLabels.map((item) => (
            <Grid item key={item}>
              <Button
                disabled={item !== 'Close'}
                color="primary"
                variant="contained"
                onClick={() => {
                  props.buttonCloseCallback();
                }}>
                {item}
              </Button>
            </Grid>
          ))}
        </Grid>
      </blockquote>
      <br />
      {props.children}
    </div>
  );
};

const MapPage: React.FC<IMapProps> = (props) => {
  const classes = useStyles();
  //TODO:  check if used
  const [extent, setExtent] = useState(null);
  //TODO: consolidate with new context
  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState<GeoJsonObject>(null);
  const [showPopOut, setShowPopOut] = useState(false);
  // "is it open?", "what coordinates of the mouse?", that kind of thing:
  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  const authContext = useContext(AuthStateContext);
  const { userInfoLoaded } = useContext(AuthStateContext);
  const history = useHistory();

  const isAuthorized = () => {
    return userInfoLoaded && authContext.userRoles.length > 0;
  };

  useEffect(() => {
    if (isAuthorized()) {
      history.push('/home/landing');
    }
  }, [userInfoLoaded]);

  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };

  // const handleGeoClick = async (geo: any) => {
  //   setShowPopOut(true);
  // };

  const [url, setUrl] = useState(null);

  useEffect(() => {
    window.history.pushState('', 'New Page Title', url);
  }, [url]);

  const MapUrlListener = (props) => {
    const map = useMap();
    const buildAndSetURL = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const urlObj = {
        center: center,
        zoom: zoom
      };
      const urlEncoded = encodeURI(JSON.stringify(urlObj));
      setUrl('/home/map/' + urlEncoded);
    };
    useMapEvents({
      zoomend: (eventData) => {
        buildAndSetURL();
      },
      dragend: (eventData) => {
        buildAndSetURL();
      }
    });
    return null;
  };

  const initalCenter = () => {
    if (!url || !(url === '/home/map')) {
      return [55, -128];
    } else {
      const urlEncoded = (url as string).replace('/home/map', '');
      const urlObj = JSON.parse(urlEncoded);
      return urlObj.center;
    }
  };

  const initialZoom = () => {
    if (!url || !(url === '/home/map')) {
      return 5;
    } else {
      const urlEncoded = (url as string).replace('/home/map', '');
      const urlObj = JSON.parse(urlEncoded);
      return urlObj.zoom;
    }
  };

  return (
    <Box height="inherit" width="inherit" paddingBottom={'50px'}>
      <MapRecordsContextProvider>
        <MapContainer
          classes={classes}
          showDrawControls={false}
          center={[55, -128]}
          zoom={5}
          mapId={'mainMap'}
          geometryState={{ geometry, setGeometry }}>
          {/* <RecordSetLayersRenderer /> */}
          <MapUrlListener />
          <ActivitiesLayerV2
            filters={{
              activity_subtype: ['Activity_Observation_PlantTerrestrial', 'Activity_Observation_PlantAquatic']
            }}
            color={'#000'}
            opacity={1}
            zIndex={5000}
          />
        </MapContainer>
        <MapContextMenu
          contextMenuState={{ state: contextMenuState, setContextMenuState }}
          handleClose={handleContextMenuClose}
        />
      </MapRecordsContextProvider>
    </Box>
  );
};

export default MapPage;
