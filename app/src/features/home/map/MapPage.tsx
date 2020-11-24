import { Button, CircularProgress, Container, Grid, makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import ActivityComponent from 'components/activity/ActivityComponent';
import { interactiveGeoInputData } from 'components/map/GeoMeta';
import MapContainer from 'components/map/MapContainer';
import { IAPPSite } from 'components/points-of-interest/IAPP/IAPP-Site';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { ReactChildren, useContext, useEffect, useState } from 'react';
import ActivityPage from '../activity/ActivityPage';
import { contextMenuType, MapContextMenu, MapContextMenuData } from './MapContextMenu';

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
    height: '100%',
    width: '66.66%'
  },
  popOutGridItemExpanded: {
    height: '100%',
    width: '33.33%'
  },
  popOutGridItemShrunk: {
    height: '100%',
    width: '0%'
  },
  popOutComponent: {
    height: '100%',
    width: '100%',
    backgroundColor: theme.palette.background.paper
  }
}));

interface IMapProps {
  classes?: any;
}

const PointOfInterestPopUp = (name: string) => {
  //return <div> {props.name} </div>;
  return '<div>' + name + '</div>';
};

interface popOutComponentProps {
  classes?: any;
  selectedGeo?: any;
  buttonCloseCallback: Function;
}

const PopOutComponent: React.FC<popOutComponentProps> = (props) => {
  const classes = useStyles();
  //very quick and dirty style for demo:
  return (
    <div className={classes.popOutComponent}>
      <br />
      <blockquote>
        <Grid container spacing={3}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                props.buttonCloseCallback();
              }}>
              Close
            </Button>
          </Grid>
          <Grid item>
            <Button
              disabled={true}
              variant="contained"
              color="primary"
              onClick={() => {
                props.buttonCloseCallback();
              }}>
              Edit
            </Button>
          </Grid>
          <Grid item>
            <Button
              disabled={true}
              variant="contained"
              color="primary"
              onClick={() => {
                props.buttonCloseCallback();
              }}>
              Photos
            </Button>
          </Grid>
          <Grid item>
            <Button
              disabled={true}
              variant="contained"
              color="primary"
              onClick={() => {
                props.buttonCloseCallback();
              }}>
              Show related activities
            </Button>
          </Grid>
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

  // "is it open?", "what coordinates of the mouse?", that kind of thing:
  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  //const [contextMenuState, setContextMenuState] = useState({ isOpen: false });
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  // don't load the map until interactive geos ready
  useEffect(() => {
    const didInteractiveGeosLoad = interactiveGeometry ? true : false;
    setIsReadyToLoadMap(didInteractiveGeosLoad);
  }, [databaseChangesContext, interactiveGeometry]);

  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };

  const changeContextMenu = (targetContextMenu: contextMenuType) => {};

  // todo: handle closing of popup, this does not work:
  /*
  const togglePopup = async () => {
    setShowPopOut(!showPopOut);
  };
  */

  const handleGeoClick = (geo: any) => {
    setShowPopOut(true);
    setSelectedInteractiveGeometry(geo);
  };

  const getEverythingWithAGeo = async () => {
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

      switch (row.docType) {
        case DocType.POINT_OF_INTEREST:
          interactiveGeos.push({
            //mapContext: MapContext.MAIN_MAP,
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'New Point of Interest:\n ' + row._id + '\n' + row.geometry[0].coordinates,

            // basic display:
            geometry: row.geometry[0],
            color: '#99E472',
            zIndex: 1, // need to ask jamie how to implement this

            // interactive
            onClickCallback: () => {
              //setInteractiveGeometry([interactiveGeos])
              console.log('clicked geo');
              handleGeoClick(row);
            }, //try to get this one workign first
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
            description: 'Past Activity:\n ' + row._id + '\n' + row.geometry[0].coordinates,

            // basic display:
            geometry: row.geometry[0],
            color: '#F3C911',
            zIndex: 1, // need to ask jamie how to implement this

            // interactive
            onClickCallback: () => {
              //setInteractiveGeometry([interactiveGeos])
              console.log('before handle  geo');
              handleGeoClick(row);
              //console.log('clicked geo');
            }, //try to get this one workign first
            popUpComponent: PointOfInterestPopUp
          });
          break;
        case DocType.ACTIVITY:
          interactiveGeos.push({
            //mapContext: MapContext.MAIN_MAP,
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'Activity:\n ' + row._id + '\n' + row.geometry[0].coordinates,

            // basic display:
            geometry: row.geometry[0],
            color: '#E044A7',
            zIndex: 1, // need to ask jamie how to implement this

            // interactive
            onClickCallback: () => {
              //setInteractiveGeometry([interactiveGeos])
              console.log('before handle  geo');
              handleGeoClick(row);
              //console.log('clicked geo');
            }, //try to get this one workign first
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
            description: 'Point of Interest:\n ' + row._id + '\n' + row.geometry[0].coordinates,

            // basic display:
            geometry: row.geometry[0],
            color: '#FF5733',
            zIndex: 1, // need to ask jamie how to implement this

            // interactive
            onClickCallback: () => {
              //setInteractiveGeometry([interactiveGeos])
              console.log('before handle  geo');
              handleGeoClick(row);
              //console.log('clicked geo');
            }, //try to get this one workign first
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
  };

  useEffect(() => {
    const updateComponent = () => {
      getEverythingWithAGeo();
    };

    updateComponent();
  }, [databaseChangesContext, showPopOut]);

  useEffect(() => {
    console.log('chosen geo');
    console.dir(selectedInteractiveGeometry);
  }, [selectedInteractiveGeometry]);

  return (
    <>
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
              <></>
            )}
            {/*<ActivityPage activityId={selectedInteractiveGeometry?.recordDocID} />*/}
          </PopOutComponent>
        </Grid>
      </Grid>
      <MapContextMenu
        contextMenuState={{ state: contextMenuState, setContextMenuState }}
        handleClose={handleContextMenuClose}
      />
    </>
  );
};

export default MapPage;
