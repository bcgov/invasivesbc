import { Button, CircularProgress, Container, Grid, makeStyles, Theme, Box } from '@material-ui/core';
import clsx from 'clsx';
import moment from 'moment';
import { IPhoto } from 'components/photo/PhotoContainer';
import { interactiveGeoInputData } from 'components/map/GeoMeta';
import MapContainer from 'components/map/MapContainer';
import { IAPPSite } from 'components/points-of-interest/IAPP/IAPP-Site';
import { ActivitiesPOI } from 'components/points-of-interest/ActivitiesPOI/ActivitiesPOI';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { MapContextMenu, MapContextMenuData } from './MapContextMenu';
import { getDataFromDataBC } from 'components/map/WFSConsumer';
import distinctColors from 'distinct-colors';
import { GeoJSONObject } from '@turf/turf';
import { metroVanExample } from 'components/map/MetroVanExample';
import { VanIslandRoughExample } from 'components/map/VanIslandRoughExample';

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

const UploadedSpatialPopUp = (content: any) => {
  console.log(content);
  return 'yo';
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

const MapPage: React.FC<IMapProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState<interactiveGeoInputData[]>(null);
  const [geoCollectionToVector, setGeoCollectionToVector] = useState<any[]>(null);
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
  useEffect(() => {
    const didInteractiveGeosLoad = interactiveGeometry ? true : false;
    console.log('setting it to' + didInteractiveGeosLoad);
    setIsReadyToLoadMap(didInteractiveGeosLoad);
  }, [interactiveGeometry]);

  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };

  const handleGeoClick = async (geo: any) => {
    setShowPopOut(true);
    // fetch all data for the given geo
    const results = await databaseContext.database.find({ selector: { _id: geo._id } });

    setSelectedInteractiveGeometry(results.docs[0]);
  };

  const getActivityData = useCallback(async () => {
    const appStateResults = await databaseContext.database.find({ selector: { _id: DocType.APPSTATE } });

    if (!appStateResults || !appStateResults.docs || !appStateResults.docs.length) {
      return;
    }

    const activityResults = await databaseContext.database.find({
      selector: { _id: appStateResults.docs[0].activeActivity }
    });

    if (activityResults && activityResults.docs[0]) {
      setFormActivityData(activityResults.docs[0]);
      setPhotos(activityResults.docs[0].photos || []);
    }
  }, [databaseContext.database]);

  const getEverythingWithAGeo = useCallback(async () => {

     let fancyVectorGeoConfigs = []

    //geos from databc:
    const theRest = [
      'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
      'WHSE_BASEMAPPING.FWA_WETLANDS_POLY',
      'WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP'
    ];
    const backGroundlayersList = ['WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'];

    console.log('palette');
    var palette = distinctColors({ count: backGroundlayersList.length + theRest.length, hueMin: 150 });
    console.log(JSON.stringify(palette));

    let colourIndex = 0;

    let dataBCInteractiveGeos = [];
    try {
      const backGroundListPromises =  backGroundlayersList.map(async (l) => {
        try {
          const geos = await getDataFromDataBC(l, VanIslandRoughExample.features[0]);
          const collection =   {
            "type": "FeatureCollection",
            "features": geos
        }
          let color =  palette.sort()[colourIndex].hex()
          fancyVectorGeoConfigs.push({colour: color, geojson: collection})
          console.log('geos for this interactive geo: ' + geos.length);
            /*
          await geos.map((f) => {
            dataBCInteractiveGeos.push({
              //mapContext: MapContext.MAIN_MAP,
              recordDocID: f.id,
              recordDocType: DocType.REFERENCE_POINT_OF_INTEREST,
              description: 'databc data!' + JSON.stringify(f.properties),

              // basic display:
              geometry: { ...f.geometry, properties: f.properties },
              color: palette.sort()[colourIndex].hex(),
              opacity: 0.4,
              zIndex: 9999999999,

              // interactive
              onClickCallback: () => {
                //setInteractiveGeometry([interactiveGeos])
                console.log('clicked geo');
                handleGeoClick(f);
              }, //try to get this one working first
              popUpComponent: PointOfInterestPopUp
            });
          });
            */
        } catch (e) {
          console.log('oh no', JSON.stringify(e));
        }
        colourIndex += 1;
      });
      const theRestPromises = theRest.sort().map(async (l) => {
        try {
          const geos = await getDataFromDataBC(l, VanIslandRoughExample.features[0]);
          const collection =   {
            "type": "FeatureCollection",
            "features": geos
        }
          let color =  palette.sort()[colourIndex].hex()
          fancyVectorGeoConfigs.push({colour: color, geojson: collection})
            /*
          await geos.map((f) => {
            dataBCInteractiveGeos.push({
              //mapContext: MapContext.MAIN_MAP,
              recordDocID: f.id,
              recordDocType: DocType.REFERENCE_POINT_OF_INTEREST,
              description: 'databc data!' + JSON.stringify(f.properties),

              // basic display:
              geometry: { ...f.geometry, properties: f.properties },
              color: palette.sort()[colourIndex].hex(),
              zIndex: 9999999999,

              // interactive
              onClickCallback: () => {
                //setInteractiveGeometry([interactiveGeos])
                console.log('clicked geo');
                handleGeoClick(f);
              }, //try to get this one working first
              popUpComponent: PointOfInterestPopUp
            });
          });
            */
        } catch (e) {
          console.log('oh no', JSON.stringify(e));
        }
        colourIndex += 1;
      });
      await Promise.all([...theRestPromises, ...backGroundListPromises])
    } catch (e) {
      console.log('error looping over layers and doing anything at all', JSON.stringify(e));
    }

    console.log('data bc geos loaded:' + dataBCInteractiveGeos.length);

    const now = moment().valueOf();
    if (geoUpdateTimestamp !== null && now < geoUpdateTimestamp + GEO_UPDATE_MIN_INTERVAL) {
      console.log('short circuit');
      return;
    }

    setGeoUpdateTimestamp(now);

    console.log('total interactive geos in mapPage:' + dataBCInteractiveGeos.length);
    setInteractiveGeometry([...dataBCInteractiveGeos]);
    setGeoCollectionToVector(fancyVectorGeoConfigs)

    // setIsReadyToLoadMap(true)
  }, [databaseContext.database, extent]);

  useEffect(() => {
    const updateComponent = () => {
      getEverythingWithAGeo();
    };

    updateComponent();
  }, [databaseChangesContext, showPopOut, getEverythingWithAGeo]);

  useEffect(() => {
    console.log('chosen geo');
    console.dir(selectedInteractiveGeometry);
  }, [selectedInteractiveGeometry]);

  useEffect(() => {
    getActivityData();
  }, [getActivityData]);

  const photoState = {
    photos,
    setPhotos
  };

  const containerProps = {
    activity: formActivityData,
    photoState
  };

  return (
    <Box height="inherit" width="inherit">
      <Grid className={classes.mainGrid} container>
        <Grid className={showPopOut ? classes.mapGridItemShrunk : classes.mapGridItemExpanded} item>
          <Container className={clsx(classes.mapContainer)} maxWidth={false} disableGutters={true}>
            {isReadyToLoadMap ? (
              <MapContainer
                classes={classes}
                showDrawControls={false}
                mapId={'mainMap'}
                geoCollectionToVector={geoCollectionToVector}
                geometryState={{ geometry, setGeometry }}
                interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
                //  extentState={{ extent, setExtent }}
                contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
              />
            ) : (
              <CircularProgress />
            )}
          </Container>
        </Grid>
        <Grid className={showPopOut ? classes.popOutGridItemExpanded : classes.popOutGridItemShrunk} item>
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
            {/*<ActivityPage activityId={selectedInteractiveGeometry?.recordDocID} />*/}
          </PopOutComponent>
        </Grid>
      </Grid>
      <MapContextMenu
        contextMenuState={{ state: contextMenuState, setContextMenuState }}
        handleClose={handleContextMenuClose}
      />
    </Box>
  );
};

export default MapPage;
