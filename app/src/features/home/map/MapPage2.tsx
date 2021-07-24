import { Button, CircularProgress, Container, Grid, makeStyles, Theme, Box } from '@material-ui/core';
import clsx from 'clsx';
import moment from 'moment';
import { IPhoto } from 'components/photo/PhotoContainer';
import { interactiveGeoInputData } from 'components/map/GeoMeta';
import MapContainer, { getZIndex } from 'components/map/MapContainer';
import { IAPPSite } from 'components/points-of-interest/IAPP/IAPP-Site';
import { ActivitiesPOI } from 'components/points-of-interest/ActivitiesPOI/ActivitiesPOI';
import { DocType } from 'constants/database';
//import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
//import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature, GeoJsonObject } from 'geojson';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { MapContextMenu, MapContextMenuData } from './MapContextMenu';
import MapContainer2 from 'components/map/MapContainer2';
import { useDataAccess } from 'hooks/useDataAccess';
import { FeatureCollection, featureCollection } from '@turf/turf';

const GEO_UPDATE_MIN_INTERVAL = 60000; // 60s

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

const PointOfInterestPopUp = (name: string) => {
  return '<div>' + name + '</div>';
};

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

const MapPage2: React.FC<IMapProps> = (props) => {
  const classes = useStyles();

  //const databaseContext = useContext(DatabaseContext);
  //const databaseChangesContext = useContext(DatabaseChangesContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState<GeoJsonObject>(null);
  const [selectedInteractiveGeometry, setSelectedInteractiveGeometry] = useState<interactiveGeoInputData>(null);

  const [isReadyToLoadMap, setIsReadyToLoadMap] = useState(false);
  const [showPopOut, setShowPopOut] = useState(false);

  const [extent, setExtent] = useState(null);
  const [formActivityData, setFormActivityData] = useState(null);
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [geoUpdateTimestamp, setGeoUpdateTimestamp] = useState(null);

  // "is it open?", "what coordinates of the mouse?", that kind of thing:
  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  // don't load the map until interactive geos ready
  // useEffect(() => {
  //   //const didInteractiveGeosLoad = interactiveGeometry ? true : false;
  //   const didInteractiveGeosLoad = true;
  //   setIsReadyToLoadMap(didInteractiveGeosLoad);
  // }, [databaseChangesContext, interactiveGeometry]);

  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };

  const handleGeoClick = async (geo: any) => {
    setShowPopOut(true);
    // fetch all data for the given geo
    // const results = await databaseContext.database.find({ selector: { _id: geo._id } });

    //setSelectedInteractiveGeometry(results.docs[0]);
  };

  const da = useDataAccess();
  let poiInteractiveGeos;
  const getEverythingWithAGeo = useCallback(async () => {
    const now = moment().valueOf();
    if (geoUpdateTimestamp !== null && now < geoUpdateTimestamp + GEO_UPDATE_MIN_INTERVAL) {
      return;
    }

    setGeoUpdateTimestamp(now);
  }, []);

  useEffect(() => {
    const updateComponent = () => {
      getEverythingWithAGeo();
    };
    updateComponent();
  }, [showPopOut, getEverythingWithAGeo]);

  // useEffect(() => {
  //   console.log('chosen geo');
  //   console.dir(selectedInteractiveGeometry);
  // }, [selectedInteractiveGeometry]);

  const photoState = {
    photos,
    setPhotos
  };

  const containerProps = {
    activity: formActivityData,
    photoState
  };
  //-- causes to rerender
  useEffect(() => {
    setIsReadyToLoadMap(true);
    setExtent([
      [-50.96591949462891, -20.817741019786485],
      [-3.6807632446289067, 12.103780891645817]
    ]);
  }, []);

  console.log('made it to here');

  return (
    <Box height="inherit" width="inherit">
      <Grid className={classes.mainGrid} container>
        <Grid className={showPopOut ? classes.mapGridItemShrunk : classes.mapGridItemExpanded} item>
          <Container className={clsx(classes.mapContainer)} maxWidth={false} disableGutters={true}>
            <MapContainer2
              classes={classes}
              showDrawControls={false}
              mapId={'mainMap'}
              pointOfInterestFilter={{ page: 1, limit: 1000, online: true, geoOnly: true }}
              geometryState={{ geometry, setGeometry }}
              interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
              extentState={{ extent, setExtent }}
              contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
            />
          </Container>
        </Grid>
      </Grid>
      {/* <Grid className={showPopOut ? classes.popOutGridItemExpanded : classes.popOutGridItemShrunk} item>
          <PopOutComponent
            buttonCloseCallback={() => {
              setShowPopOut(false);
            }}
            selectedGeo={selectedInteractiveGeometry}>
            {(selectedInteractiveGeometry as any)?.docType === DocType.REFERENCE_POINT_OF_INTEREST ? (
              <IAPPSite record={selectedInteractiveGeometry} />
            ) : (
              <>{formActivityData && <ActivitiesPOI containerProps={containerProps} />}</>
            )}
          </PopOutComponent>
        </Grid>
      </Grid>
      <MapContextMenu
        contextMenuState={{ state: contextMenuState, setContextMenuState }}
        handleClose={handleContextMenuClose}
      />
            */}
    </Box>
  );
};

export default MapPage2;
