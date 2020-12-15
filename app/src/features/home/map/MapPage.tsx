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
import React, { useContext, useEffect, useState } from 'react';
import { MapContextMenu, MapContextMenuData } from './MapContextMenu';

const useStyles = makeStyles((theme: Theme) => ({
  mapContainer: {
    height: '100%'
  },
  map: {
    height: '85%',
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

  useEffect(()=>{
    console.log('the geo')
    console.dir(geometry)
  }, [geometry]);

  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };

  const handleGeoClick = (geo: any) => {
    setShowPopOut(true);
    setSelectedInteractiveGeometry(geo);
  };

  const getActivityData = async () => {
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

    let interactiveGeos = [];

    docs.docs.forEach((row) => {
      if (!row.geometry || !row.geometry.length) {
        return;
      }

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
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'New Point of Interest:\n ' + row._id + '\n' + coordinatesString,
            geometry: row.geometry[0], // basic display
            color: '#99E472',
            zIndex: 1, // need to ask jamie how to implement this
            onClickCallback: () => {
              handleGeoClick(row); // interactive
            },
            popUpComponent: PointOfInterestPopUp
          });
          break;
        case DocType.REFERENCE_ACTIVITY:
          interactiveGeos.push({
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'Past Activity:\n ' + row._id + '\n' + coordinatesString,
            geometry: row.geometry[0], // basic display
            color: '#F3C911',
            zIndex: 1, // need to ask jamie how to implement this
            onClickCallback: () => {
              handleGeoClick(row); // interactive
            },
            popUpComponent: PointOfInterestPopUp
          });
          break;
        case DocType.ACTIVITY:
          interactiveGeos.push({
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'Activity:\n ' + row._id + '\n' + coordinatesString,
            isEditable: true,
            geometry: row.geometry[0], // basic display
            color: '#E044A7',
            zIndex: 1, // need to ask jamie how to implement this
            onClickCallback: () => {
              handleGeoClick(row); // interactive
            },
            popUpComponent: PointOfInterestPopUp
          });
          break;
        case DocType.REFERENCE_POINT_OF_INTEREST:
          interactiveGeos.push({
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'Point of Interest:\n ' + row._id + '\n' + coordinatesString,
            geometry: row.geometry[0], // basic display
            color: '#FF5733',
            zIndex: 1, // need to ask jamie how to implement this
            onClickCallback: () => {
              handleGeoClick(row); // interactive
            },
            popUpComponent: PointOfInterestPopUp
          });
          break;
        default:
          break;
      }
    });

    setInteractiveGeometry(
      interactiveGeos
    );
  };

  useEffect(() => {
    const updateComponent = () => {
      getEverythingWithAGeo();
    };

    updateComponent();
  }, [databaseChangesContext, showPopOut]);

  useEffect(() => {
  }, [selectedInteractiveGeometry]);

  useEffect(() => {
    getActivityData();
  }, []);

  const photoState = {
    photos,
    setPhotos
  };

  const containerProps = {
    activity: formActivityData,
    photoState
  };

  return (
    <Box height="88.5vh" width="100vw" display="flex" overflow="hidden">
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
