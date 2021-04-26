import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Tooltip,
  Typography
} from '@material-ui/core';
import { DeleteForever, ExpandMore, Rowing } from '@material-ui/icons';
import ActivityDataFilter from 'components/activities-search-controls/ActivitiesFilter';
import MetabaseSearch from 'components/search/MetabaseSearch';
import ManageDatabaseComponent from 'components/database/ManageDatabaseComponent';
import KMLUpload from 'components/map-buddy-components/KMLUpload';
import MapContainer from 'components/map/MapContainer';
import PointOfInterestDataFilter from 'components/point-of-interest-search/PointOfInterestFilter';
import TripDataControls from 'components/trip/TripDataControls';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MapContextMenuData } from '../map/MapContextMenu';
import HelpIcon from '@material-ui/icons/Help';
import SettingsIcon from '@material-ui/icons/Settings';
import TripStepStatus, { ITripStepStatus, TripStatusCode } from 'components/trip/TripStepStatus';
import RecordTable from 'components/common/RecordTable';
import { DocType } from 'constants/database';
import { interactiveGeoInputData } from 'components/map/GeoMeta';
import TripNamer from 'components/trip/TripNamer';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { useCallback } from 'react';
import Spinner from 'components/spinner/Spinner';
import { confirmDeleteTrip, deleteTripRecords } from './PlanPageHelpers';

interface IPlanPageProps {
  classes?: any;
}

const useStyles = makeStyles((theme) => ({
  accordionSummary: {
    padding: theme.spacing(2),
    //todo more spacing, above doesnt work
    textAlign: 'center'
  },
  tripList: {
    width: '100%'
  },
  tripAccordionGridItem: {
    textAlign: 'left'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  map: {
    height: '500px',
    width: '100%',
    zIndex: 0
  },
  layerPicker: {
    height: '100%',
    width: '100%'
  },
  activityRecordList: {
    flexDirection: 'column'
  },
  pointOfInterestList: {
    flexDirection: 'column'
  },
  activityRecordQueryParmsRow: {
    width: '400px'
  },
  //TODO:  make colour of bar depend on how much is used (red = full/bad)
  tripStorageUsageBar: {
    height: '20px',
    borderRadius: '20px'
  },
  totalStorageUsageBar: {
    height: '20px',
    borderRadius: '20px'
  },
  tripGrid: {
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  tripAccordion: {
    display: 'block'
  }
}));

const PlanPage: React.FC<IPlanPageProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState<interactiveGeoInputData[]>(null);
  const [extent, setExtent] = useState(null);

  const [workingTripID, setWorkingTripID] = useState(null);
  const [newTripID, setNewTripID] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tripsLoaded, setTripsLoaded] = useState(false);

  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  /* commented out for sonar cloud, but this will be needed to close the context menu for this page:
  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };
  */

  const getExtent = async () => {
    let docs = await databaseContext.database.find({ selector: { _id: 'planPageExtent' } });
    if (!docs || !docs.docs || !docs.docs.length) {
      return;
    }
    if (!docs[0]) {
      return;
    }
    if (docs[0].extent) {
      setExtent(docs[0].extent);
    }
  };

  const getTrips = async () => {
    if (!databaseContext) {
    }
    // does not work:
    let docs = await databaseContext.database.find({
      selector: { docType: { $eq: DocType.TRIP } },
      use_index: 'docTypeIndex'
    });

    if (!docs || !docs.docs || !docs.docs.length) {
      return;
    }
    let trips = [];
    let geos = [];

    docs.docs.map((doc) => {
      trips.push({ trip_id: doc.trip_id, trip_name: doc.name, num_activities: 5, num_POI: 4 });
      if (doc.geometry) {
        geos.push({
          recordDocID: doc._id,
          recordDocType: doc.docType,
          description: 'Uploaded spatial content:\n ' + doc._id + '\n',
          geometry: doc.geometry,
          color: 'orange',
          onClickCallback: () => {},
          popUpComponent: null
        });
      }
    });

    if (geos.length > 0) {
      setInteractiveGeometry(geos);
    }
    setTrips(trips);
  };

  const helperGetMaxTripID = async () => {
    if (!databaseContext) {
      return;
    }
    let docs = await databaseContext.database.find({
      selector: { trip_id: { $gte: null }, docType: DocType.TRIP },
      sort: [{ trip_id: 'desc' }],
      use_index: 'tripDocTypeIndex',
      limit: 1
    });

    if (!docs || !docs.docs || !docs.docs.length) {
      return 0;
    } else {
      if (docs.docs[0].trip_id) {
        return parseInt(docs.docs[0]._id);
      } else {
        return 0;
      }
    }
  };

  // initial fetch
  useEffect(() => {
    const initialLoad = async () => {
      await getTrips();
      await getExtent();
      setTripsLoaded(true);
    };
    initialLoad();
  }, [newTripID]);

  // persist geometry changes
  useEffect(() => {
    if (!tripsLoaded) {
      return;
    }
    if (!workingTripID) {
      return;
    }
    if (geometry) {
      databaseContext.database.upsert(workingTripID, (tripDoc) => {
        return { ...tripDoc, geometry: geometry, persistenceStep: 'update geo' };
      });
    }
  }, [geometry, tripsLoaded, databaseContext.database]);

  // persist extent changes
  useEffect(() => {
    if (!tripsLoaded || !extent) {
      return;
    }
    databaseContext.database.upsert('planPageExtent', (planPageExtentDoc) => {
      return { ...planPageExtentDoc, extent: extent };
    });
  }, [extent, tripsLoaded]);

  const addTrip = async () => {
    let newID = await helperGetMaxTripID();
    newID += 1;
    databaseContext.database.upsert(newID.toString(), (doc) => {
      return {
        ...doc,
        trip_id: newID.toString(),
        trip_name: 'New Unnamed Trip',
        num_activities: 0,
        num_POI: 0,
        docType: DocType.TRIP,
        stepState: [
          {}, //just here so indexes match up with step number
          { status: TripStatusCode.initial, expanded: true },
          { status: TripStatusCode.initial, expanded: false },
          { status: TripStatusCode.initial, expanded: false },
          { status: TripStatusCode.initial, expanded: false },
          { status: TripStatusCode.initial, expanded: false },
          { status: TripStatusCode.initial, expanded: false }
        ]
      };
    });
    setNewTripID(newID);
  };

  const SingleTrip: React.FC<any> = (props) => {
    //todo: add trip_id to props and let trip manage db itself
    const databaseContext = useContext(DatabaseContext);
    const [stepState, setStepState] = useState(null);
    const [memoHash, setMemoHash] = useState(null);

    useEffect(() => {
      setMemoHash(JSON.stringify(stepState));
      console.log('updating memo hash');
    }, [stepState]);

    const getStateFromTrip = useCallback(async () => {
      if (!databaseContext.database) {
        return;
      }
      let docs = await databaseContext.database.find({
        selector: {
          _id: props.trip_ID
        }
      });
      if (docs.docs.length > 0) {
        let tripDoc = docs.docs[0];
        if (!tripDoc.stepState) {
          return;
        }
        setStepState(tripDoc.stepState);
      }
    }, [databaseContext.database]);

    const saveState = async (newState) => {
      setStepState(newState);
      await databaseContext.database.upsert(props.trip_ID, (tripDoc) => {
        return { ...tripDoc, stepState: newState, persistenceStep: 'updating state' };
      });
    };

    // initial fetch
    useEffect(() => {
      getStateFromTrip();
      console.log('hook to get state');
    }, [databaseContext]);

    const helperCheckForGeo = () => {
      if (geometry) {
        return TripStatusCode.ready;
      } else {
        return stepState[1].status;
      }
    };

    const helperCloseOtherAccordions = (expanded, stepNumber) => {
      let newState: any = [...stepState];
      for (let i = 1; i < stepState.length; i++) {
        let expanded2 = i == stepNumber && expanded ? true : false;
        newState[i] = { ...newState[i], expanded: expanded2 };
      }
      console.log('accordion helper');
      saveState([...newState]);
    };

    //generic helper to mark step as done if there isn't a special purpose check
    const helperStepDoneOrSkip = (stepNumber) => {
      let newState: any = [...stepState];
      for (let i = 1; i < stepState.length; i++) {
        newState[i] = { ...newState[i], expanded: false };
        if (i == stepNumber && i != 2) {
          newState[i] = { ...newState[i], status: TripStatusCode.ready };
        }
      }
      saveState([...newState]);
    };

    const memo = useMemo(() => {
      return (
        <>
          {' '}
          {stepState ? (
            <Grid item md={12}>
              <TripStep
                title="Step 1: Name your trip"
                helpText="The 'spatial filter' to your search.  Put bounds around data you need to pack with you."
                additionalText="other"
                expanded={stepState[1].expanded}
                tripStepDetailsClassName={classes.activityRecordList}
                stepStatus={stepState[1].status}
                stepAccordionOnChange={(event, expanded) => {
                  helperCloseOtherAccordions(expanded, 1);
                }}
                doneButtonCallBack={() => {
                  helperStepDoneOrSkip(1);
                }}>
                <TripNamer trip_ID={props.trip_ID} />
              </TripStep>
              <TripStep
                title="Step 2: Add a spatial boundary for your trip."
                helpText="The 'spatial filter' to your search.  Put bounds around data you need to pack with you."
                additionalText="other"
                expanded={stepState[2].expanded}
                tripStepDetailsClassName={classes.activityRecordList}
                stepStatus={helperCheckForGeo()}
                stepAccordionOnChange={(event, expanded) => {
                  helperCloseOtherAccordions(expanded, 2);
                }}
                doneButtonCallBack={() => {
                  helperStepDoneOrSkip(2);
                }}>
                <Paper className={classes.paper}>
                  <Typography variant="body1">
                    Draw a polygon or square on the map, or upload a KML containing 1 shape.
                  </Typography>
                  <KMLUpload />
                </Paper>
              </TripStep>
              <TripStep
                title="Step 3: Choose past field activity data."
                helpText="This is where you can cache past activities (observations etc.) to the app.  If you want to search for records in a particular area, draw a polygon on the map."
                additionalText="other"
                expanded={stepState[3].expanded}
                tripStepDetailsClassName={classes.activityRecordList}
                stepStatus={stepState[3].status}
                stepAccordionOnChange={(event, expanded) => {
                  helperCloseOtherAccordions(expanded, 3);
                }}
                doneButtonCallBack={() => {
                  helperStepDoneOrSkip(3);
                }}>
                <ActivityDataFilter trip_ID={props.trip_ID} />
              </TripStep>
              <TripStep
                title="Step 4: Choose data from other systems, (IAPP)"
                helpText="This is where you can cache IAPP sites, and later other points of interest.  If you want to search for records in a particular area, draw a polygon on the map."
                additionalText="other"
                expanded={stepState[4].expanded}
                tripStepDetailsClassName={classes.pointOfInterestList}
                stepStatus={stepState[4].status}
                stepAccordionOnChange={(event, expanded) => {
                  helperCloseOtherAccordions(expanded, 4);
                }}
                doneButtonCallBack={() => {
                  helperStepDoneOrSkip(4);
                }}>
                <PointOfInterestDataFilter trip_ID={props.trip_ID} />
              </TripStep>
              <TripStep
                title="OPTIONAL: Get data from a Metabase Question"
                helpText="If you have a Metabase question that contains field activity ID's, you can load those records here."
                additionalText="other"
                expanded={stepState[5].expanded}
                tripStepDetailsClassName={classes.pointOfInterestList}
                stepStatus={stepState[5].status}
                stepAccordionOnChange={(event, expanded) => {
                  helperCloseOtherAccordions(expanded, 5);
                }}
                doneButtonCallBack={() => {
                  helperStepDoneOrSkip(5);
                }}>
                <MetabaseSearch />
              </TripStep>
              <TripStep
                title="Last Step: Cache, Refresh, or Delete data for Trip "
                helpText="Cache the data and map data for the region you have selected, or refresh it, or delete."
                additionalText="other"
                expanded={stepState[6].expanded}
                tripStepDetailsClassName={classes.pointOfInterestList}
                stepStatus={stepState[6].status}
                stepAccordionOnChange={(event, expanded) => {
                  helperCloseOtherAccordions(expanded, 6);
                }}
                doneButtonCallBack={() => {
                  helperStepDoneOrSkip(6);
                }}>
                <TripDataControls trip_ID={props.trip_ID} />
                <ManageDatabaseComponent />
              </TripStep>
            </Grid>
          ) : (
            <Spinner />
          )}
        </>
      );
    }, [memoHash]);
    return memo;
  };

  interface ITripStep {
    expanded: boolean;
    title: string;
    helpText: string;
    additionalText: string;
    tripStepDetailsClassName: string;
    stepStatus: TripStatusCode;
    stepAccordionOnChange?: (event, expanded) => void;
    doneButtonCallBack?: () => void;
  }

  const TripStep: React.FC<ITripStep> = (props) => {
    return (
      <Accordion defaultExpanded={props.expanded} expanded={props.expanded} onChange={props.stepAccordionOnChange}>
        <AccordionSummary
          className={classes.accordionSummary}
          expandIcon={<ExpandMore fontSize="large" />}
          aria-controls="panel-geo-record-picker-content"
          id="panel-geo-record-picker-header">
          <Grid alignContent="flex-start" justify="space-between" container>
            <Grid xs={2} className={classes.tripAccordionGridItem} item>
              <Tooltip color="primary" title={props.helpText} arrow>
                <HelpIcon fontSize="large" />
              </Tooltip>
            </Grid>
            <Grid xs={6} item>
              <Typography align="left" variant="h5">
                {props.title}
              </Typography>
            </Grid>
            <Grid xs={2} item>
              <TripStepStatus statusCode={props.stepStatus} />
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails className={props.tripStepDetailsClassName}>
          {props.children}
          <Box m={2} alignSelf="center">
            <Button variant="contained" color="primary" onClick={props.doneButtonCallBack}>
              I'm done here.
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };
  const mapMemo = useMemo(() => {
    return (
      <Paper className={classes.paper}>
        <MapContainer
          {...props}
          classes={classes}
          showDrawControls={true}
          mapId={'TODO_this_needs_to_be_a_globally_uniqe_id_per_map_instance'}
          geometryState={{ geometry, setGeometry }}
          interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
          extentState={{ extent, setExtent }}
          contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
        />
      </Paper>
    );
  }, [geometry, interactiveGeometry, tripsLoaded]);

  const trashTrip = (trip_ID, tripName) => {
    if (confirmDeleteTrip(trip_ID, tripName)) {
      deleteTripRecords(databaseContext, trip_ID);
    }
    databaseContext.database.get(trip_ID.toString()).then((doc)=> {
      return databaseContext.database.remove(doc)
    })
    setNewTripID(0)
  };

  return (
    <Container className={props.classes.container}>
      {mapMemo}
      <Button onClick={addTrip} color="primary" variant="contained">
        Add Trip
      </Button>
      {!tripsLoaded ? (
        <Spinner />
      ) : (
        <RecordTable
          className={classes.tripList}
          tableName={'My Trips'}
          keyField="trip_id" // defaults to just use 'id'
          //       startingOrder="survey_date" // defaults to first table column
          headers={[
            // each id is the key it will look for in each data row object
            {
              id: 'trip_id',
              title: 'Trip ID'
            },
            {
              id: 'trip_name',
              title: 'Trip Name'
            },
            {
              id: 'num_activities',
              title: '# of Activities Cached'
            },
            {
              id: 'num_poi',
              title: '# of POI Cached'
            },
            {
              id: 'buttons'
              // no title, for a blank header col
            }
          ]}
          rows={
            // array of data objects to render
            !trips?.length
              ? []
              : trips.map((row) => ({
                  ...row,
                  // custom map data before it goes to table:
                  buttons: (
                    row // can render a custom cell like this, to e.g. render custom buttons.  Will build these controls into the table too though
                  ) => (
                    <IconButton>
                      <DeleteForever
                        onClick={() => {
                          trashTrip(row.trip_id, row.trip_name);
                        }}
                      />
                    </IconButton>
                  )
                }))
          }
          dropdown={(row) => {
            return <SingleTrip trip_ID={row.trip_id} />;
          }}

          // expandable: defaults true
          // startExpanded: default true
          // startingOrder: default asc
          // startingRowsPerPage: default 10;
          // rowsPerPageOptions: default false (turns off the [5,10,15] per page select thing)
        />
      )}
      {/*   <TripListComponent />*/}
    </Container>
  );
};

export default PlanPage;
