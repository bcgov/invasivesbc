import { Box, Button, CircularProgress, Container, Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { interactiveGeoInputData } from 'components/map/GeoMeta';
import MapContainer from 'components/map/MapContainer';
import { MapRecordsContextProvider } from 'contexts/MapRecordsContext';
import { MapRequestContextProvider } from '../../../contexts/MapRequestsContext';
import { Feature, GeoJsonObject } from 'geojson';
import React, { useEffect, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useHistory } from 'react-router';
import { MapContextMenu, MapContextMenuData } from './MapContextMenu';

const useStyles = makeStyles((theme: Theme) => ({
  mapContainer: {
    height: '100%'
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
  const [selectedInteractiveGeometry, setSelectedInteractiveGeometry] = useState<interactiveGeoInputData>(null);

  //TODO: clean up legacy pop up code
  const [isReadyToLoadMap, setIsReadyToLoadMap] = useState(true);
  const [showPopOut, setShowPopOut] = useState(false);
  // "is it open?", "what coordinates of the mouse?", that kind of thing:
  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };

  const handleGeoClick = async (geo: any) => {
    setShowPopOut(true);
    // fetch all data for the given geo
  };

  const [url, setUrl] = useState(null);
  const history = useHistory();

  //on first load:
  useEffect(() => {
    //if (history.location.pathname !== '/home/map') {
    //setUrl(history.location.pathname);
    // }
  }, []);

  useEffect(() => {
    // console.log('url');
    // console.log(url);
    // doesn't work:  history.replace(url);
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
    const mapEventHook = useMapEvents({
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
    <Box height="inherit" width="inherit">
      <MapRequestContextProvider>
        <MapRecordsContextProvider>
          <Grid className={classes.mainGrid} container>
            <Grid className={showPopOut ? classes.mapGridItemShrunk : classes.mapGridItemExpanded} item>
              <Container className={clsx(classes.mapContainer)} maxWidth={false} disableGutters={true}>
                {isReadyToLoadMap ? (
                  <MapContainer
                    classes={classes}
                    showDrawControls={false}
                    center={initalCenter()}
                    zoom={initialZoom()}
                    mapId={'mainMap'}
                    pointOfInterestFilter={{ page: 1, limit: 1000, online: true, geoOnly: true }}
                    geometryState={{ geometry, setGeometry }}
                    interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
                    extentState={{ extent, setExtent }}>
                    <MapUrlListener />
                  </MapContainer>
                ) : (
                  <CircularProgress />
                )}
              </Container>
            </Grid>
          </Grid>
          <MapContextMenu
            contextMenuState={{ state: contextMenuState, setContextMenuState }}
            handleClose={handleContextMenuClose}
          />
        </MapRecordsContextProvider>
      </MapRequestContextProvider>
    </Box>
  );
};

export default MapPage;
