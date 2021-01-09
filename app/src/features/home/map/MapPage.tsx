import { Button, CircularProgress, Container, Grid, makeStyles, Theme, Box } from '@material-ui/core';
import clsx from 'clsx';
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

const useStyles = makeStyles((theme: Theme) => ({
  mapContainer: {
    height: '100%'
  },
  map: {
    height: '100%',
    width: '100%'
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

  const handleGeoClick = (geo: any) => {
    setShowPopOut(true);
    setSelectedInteractiveGeometry(geo);
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
    let docs = await databaseContext.database.find({
      selector: {
        docType: {
          $in: [
            DocType.REFERENCE_ACTIVITY,
            DocType.ACTIVITY,
            DocType.REFERENCE_POINT_OF_INTEREST,
            DocType.POINT_OF_INTEREST
          ]
        }
      }
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

      geos.push(row.geometry[0]);

      let coordinatesString = 'Polygon';
      if (row.geometry[0].geometry.type !== 'Polygon') {
        const coords = [
          Number(row.geometry[0]?.geometry.coordinates[1]).toFixed(2),
          Number(row.geometry[0]?.geometry.coordinates[0]).toFixed(2)
        ];
        coordinatesString = `(${coords[0]}, ${coords[1]})`;
      }

      switch (row.docType) {
        case DocType.POINT_OF_INTEREST:
          interactiveGeos.push({
            //mapContext: MapContext.MAIN_MAP,
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'New Point of Interest:\n ' + row._id + '\n' + coordinatesString,

            // basic display:
            geometry: row.geometry[0],
            color: '#99E472',
            zIndex: 1, // need to ask jamie how to implement this

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
            zIndex: 1, // need to ask jamie how to implement this

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
            zIndex: 1, // need to ask jamie how to implement this

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
            zIndex: 1, // need to ask jamie how to implement this

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

    setInteractiveGeometry(
      interactiveGeos
    ); /*/todo figure out to have this as a dictionary with only the delta
        getting written to on updates*/

    //setIsReadyToLoadMap(true)
  }, [databaseContext.database]);

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
