import { Button, CircularProgress, Container, Grid, makeStyles, Theme, Box } from '@material-ui/core';
import clsx from 'clsx';
import moment from 'moment';
import { IPhoto } from 'components/photo/PhotoContainer';
import { interactiveGeoInputData } from 'components/map/GeoMeta';
import MapContainer, { getZIndex } from 'components/map/MapContainer';
import { IAPPSite } from 'components/points-of-interest/IAPP/IAPP-Site';
import { ActivitiesPOI } from 'components/points-of-interest/ActivitiesPOI/ActivitiesPOI';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { MapContextMenu, MapContextMenuData } from './MapContextMenu';

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

const MapPage: React.FC<IMapProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState<interactiveGeoInputData[]>(null);
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
    setIsReadyToLoadMap(didInteractiveGeosLoad);
  }, [databaseChangesContext, interactiveGeometry]);

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
    const now = moment().valueOf();
    if (geoUpdateTimestamp !== null && now < geoUpdateTimestamp + GEO_UPDATE_MIN_INTERVAL) {
      return;
    }

    setGeoUpdateTimestamp(now);

    let docs = await databaseContext.database.find({
      selector: {
        docType: {
          $in: [
            DocType.REFERENCE_ACTIVITY,
            DocType.ACTIVITY,
            DocType.REFERENCE_POINT_OF_INTEREST,
            DocType.POINT_OF_INTEREST,
            DocType.SPATIAL_UPLOADS,
            DocType.OFFLINE_EXTENT,
            DocType.OFFLINE_DATA
          ]
        }
        /*
        // Only needed if memory size from too many points on the map becomes an issue.
        // currently the main problem is just update frequency
        // so this isn't needed with a long interval timer.
        // Leaving this here just in case it's needed:
        $or: [
          {
            $exists: 'lat'
          },
          extent
            ? {
              lat: {
                $gte: extent._southWest.lat,
                $lte: extent._northEast.lat
              },
              lon: {
                $gte: extent._southWest.lng,
                $lte: extent._northEast.lng
              }
            }
            : {}
        ]*/
      },
      use_index: 'docTypeIndex',
      // limit to only necessary fields:
      fields: ['_id', 'docType', 'geometry', 'lat', 'lon']
    });

    if (!docs || !docs.docs || !docs.docs.length) {
      return;
    }

    let geos = [];
    let interactiveGeos = [];

    docs.docs.forEach((row) => {
      if (!row.geometry || !row.geometry.length) {
        return;
      }

      // geos.push(row.geometry[0]); // deprecated(?): points only need to be interactive geos now

      let coordinatesString = 'Polygon';

      const coords = row.geometry[0]?.geometry.coordinates;
      const zIndex = getZIndex(row);
      if (row.geometry[0].geometry.type !== 'Polygon')
        coordinatesString = `(${Number(coords[1]).toFixed(2)}, ${Number(coords[0]).toFixed(2)})`;

      switch (row.docType) {
        case DocType.OFFLINE_DATA:
          interactiveGeos.push({
            recordDocID: row._id,
            recordDocType: row.docType,
            description: offlineSpatialPopup,
            geometry: row.geometry,
            color: 'blue',
            popUpComponent: PointOfInterestPopUp
          });
          break;
        case DocType.OFFLINE_EXTENT:
          // TODO push this into the interactiveGeos array
          // Then in the layer addition logic... handle behaviour
          // If still downloading display differently
          break;
        case DocType.SPATIAL_UPLOADS:
          interactiveGeos.push({
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'Uploaded spatial content:\n ' + row._id + '\n' + coordinatesString,
            geometry: row.geometry,
            color: 'orange',
            onClickCallback: () => {
              console.log('uploaded content clicked');
            },
            popUpComponent: PointOfInterestPopUp
          });
          break;
        case DocType.POINT_OF_INTEREST:
          interactiveGeos.push({
            //mapContext: MapContext.MAIN_MAP,
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'New Point of Interest:\n ' + row._id + '\n' + coordinatesString,

            // basic display:
            geometry: row.geometry,
            color: '#99E472',
            zIndex: zIndex,

            // interactive
            onClickCallback: () => {
              //setInteractiveGeometry([interactiveGeos])
              console.log('clicked geo');
              handleGeoClick(row);
            }, //try to get this one working first
            popUpComponent: PointOfInterestPopUp
          });
          /* isSelected?: boolean;

          markerComponent?: FunctionComponent;
          showMarkerAtZoom?: number;
          showMarker: boolean;

          */
          /*
          showPopUp: boolean;})*/
          break;
        case DocType.REFERENCE_ACTIVITY:
          interactiveGeos.push({
            //mapContext: MapContext.MAIN_MAP,
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'Past Activity:\n ' + row._id + '\n' + coordinatesString,

            // basic display:
            geometry: row.geometry[0],
            color: '#F3C911',
            zIndex: zIndex,

            // interactive
            onClickCallback: () => {
              //setInteractiveGeometry([interactiveGeos])
              console.log('before handle geo');
              handleGeoClick(row);
            }, //try to get this one working first
            popUpComponent: PointOfInterestPopUp
          });
          break;
        case DocType.ACTIVITY:
          interactiveGeos.push({
            //mapContext: MapContext.MAIN_MAP,
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'Activity:\n ' + row._id + '\n' + coordinatesString,

            // basic display:
            geometry: row.geometry[0],
            color: '#E044A7',
            zIndex: zIndex,

            // interactive
            onClickCallback: () => {
              //setInteractiveGeometry([interactiveGeos])
              console.log('before handle geo');
              handleGeoClick(row);
            }, //try to get this one working first
            popUpComponent: PointOfInterestPopUp
          });
          /* isSelected?: boolean;

          markerComponent?: FunctionComponent;
          showMarkerAtZoom?: number;
          showMarker: boolean;

          */
          /*
          showPopUp: boolean;})*/
          break;
        case DocType.REFERENCE_POINT_OF_INTEREST:
          interactiveGeos.push({
            //mapContext: MapContext.MAIN_MAP,
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'Point of Interest:\n ' + row._id + '\n' + coordinatesString,

            // basic display:
            geometry: row.geometry[0],
            color: '#FF5733',
            zIndex: zIndex,

            // interactive
            onClickCallback: () => {
              //setInteractiveGeometry([interactiveGeos])
              console.log('before handle geo');
              handleGeoClick(row);
            }, //try to get this one working first
            popUpComponent: PointOfInterestPopUp
          });
          /* isSelected?: boolean;

          markerComponent?: FunctionComponent;
          showMarkerAtZoom?: number;
          showMarker: boolean;

          */
          /*
          showPopUp: boolean;})*/
          break;
        default:
          break;
      }
    });

    setGeometry(geos);
    setInteractiveGeometry(interactiveGeos);

    //setIsReadyToLoadMap(true)
  }, [extent]);

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
                geometryState={{ geometry, setGeometry }}
                interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
                extentState={{ extent, setExtent }}
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
