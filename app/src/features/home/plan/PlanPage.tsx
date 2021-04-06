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
import { DeleteForever, ExpandMore } from '@material-ui/icons';
import ActivityDataFilter from 'components/activities-search-controls/ActivitiesFilter';
import MetabaseSearch from 'components/search/MetabaseSearch';
import ManageDatabaseComponent from 'components/database/ManageDatabaseComponent';
import KMLUpload from 'components/map-buddy-components/KMLUpload';
import MapContainer from 'components/map/MapContainer';
import PointOfInterestDataFilter from 'components/point-of-interest-search/PointOfInterestFilter';
import TripDataControls from 'components/trip/TripDataControls';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useContext, useEffect, useState } from 'react';
import { MapContextMenuData } from '../map/MapContextMenu';
import HelpIcon from '@material-ui/icons/Help';
import SettingsIcon from '@material-ui/icons/Settings';
import TripStepStatus, { ITripStepStatus, TripStatusCode } from 'components/trip/TripStepStatus';
import RecordTable from 'components/common/RecordTable';
import { DocType } from 'constants/database';
import { interactiveGeoInputData } from 'components/map/GeoMeta';

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

    if (docs[0].extent) {
      setExtent(docs[0].extent);
    }
  };

  const getTrips = async () => {
    let docs = await databaseContext.database.find({ selector: { docType: DocType.TRIP } });
    if (!docs || !docs.docs || !docs.docs.length) {
      return;
    }
    let trips = []

    let geos = [];
    docs.docs.map((doc) => {
      trips.push(
        { trip_id: doc._id, trip_name: 'initial name', num_activities: 5, num_POI: 4 })

      if (doc.geometry) {
        geos.push({
          recordDocID: doc._id,
          recordDocType: doc.docType,
          description: 'Uploaded spatial content:\n ' + doc._id + '\n',
          geometry: doc.geometry,
          color: 'orange',
          onClickCallback: () => {
            console.log('uploaded content clicked');
          },
          popUpComponent: null
        });
      }
    });

    if (geos.length > 0) {
      setInteractiveGeometry(geos);
    }

    setTrips(trips)

  };

  // initial fetch
  useEffect(() => {
    const initialLoad = async () => {
      await getTrips();
      setTripsLoaded(true);
    };

    initialLoad();
  }, [databaseContext]);

  // persist geometry changes
  useEffect(() => {
    if (!tripsLoaded) {
      return;
    }

    if (!workingTripID) {
      return;
    }

    databaseContext.database.upsert(workingTripID, (tripDoc) => {
      return { ...tripDoc, geometry: geometry };
    });
  }, [geometry, tripsLoaded, databaseContext.database]);

  // persist extent changes
  useEffect(() => {
    if (!tripsLoaded) {
      return;
    }

    databaseContext.database.upsert('planPageExtent', (planPageExtentDoc) => {
      return { ...planPageExtentDoc, extent: extent };
    });
  }, [extent, tripsLoaded, databaseContext.database]);

  const [trips, setTrips] = useState([]);

  const addTrip = () => {
    setTrips([
      ...trips,
      { trip_id: trips.length.toString(), trip_name: 'initial name', num_activities: 5, num_POI: 4 }
    ]);
    setWorkingTripID(trips.length.toString());
  };

  const SingleTrip: React.FC<any> = (props) => {
    //todo: add trip_id to props and let trip manage db itself
    const [stepState, setStepState] = useState([
      {}, //just here so indexes match up with step number
      { status: TripStatusCode.initial, expanded: false },
      { status: TripStatusCode.initial, expanded: false },
      { status: TripStatusCode.initial, expanded: false },
      { status: TripStatusCode.initial, expanded: false },
      { status: TripStatusCode.initial, expanded: false }
    ]);

    const helperCheckForGeo = () => {
      if (geometry) {
        return TripStatusCode.ready;
      } else {
        return stepState[1].status;
      }
    };

    const helperCloseOtherAccordions = (expanded, stepNumber) => {
      console.dir(expanded);
      let newState: any = [...stepState];
      for (let i = 1; i < stepState.length; i++) {
        let expanded2 = i == stepNumber && expanded ? true : false;
        newState[i] = { ...newState[i], expanded: expanded2 };
      }
      setStepState([...newState]);
    };

    //generic helper to mark step as done if there isn't a special purpose check
    const helperStepDoneOrSkip = (stepNumber) => {
      let newState: any = [...stepState];
      for (let i = 1; i < stepState.length; i++) {
        newState[i] = { ...newState[i], expanded: false };
        if (i == stepNumber && i != 1) {
          newState[i] = { ...newState[i], status: TripStatusCode.ready };
        }
      }
      setStepState([...newState]);
    };

    return (
      <Grid item md={12}>
        <TripStep
          title="Step 1: Add a spatial boundary for your trip."
          helpText="The 'spatial filter' to your search.  Put bounds around data you need to pack with you."
          additionalText="other"
          expanded={stepState[1].expanded}
          tripStepDetailsClassName={classes.activityRecordList}
          stepStatus={helperCheckForGeo()}
          stepAccordionOnChange={(event, expanded) => {
            helperCloseOtherAccordions(expanded, 1);
          }}
          doneButtonCallBack={() => {
            helperStepDoneOrSkip(1);
          }}>
          <Paper className={classes.paper}>
            <Typography variant="body1">
              Draw a polygon or square on the map, or upload a KML containing 1 shape.
            </Typography>
            <KMLUpload />
          </Paper>
        </TripStep>
        <TripStep
          title="Step 2: Choose past field activity data."
          helpText="This is where you can cache past activities (observations etc.) to the app.  If you want to search for records in a particular area, draw a polygon on the map."
          additionalText="other"
          expanded={stepState[2].expanded}
          tripStepDetailsClassName={classes.activityRecordList}
          stepStatus={stepState[2].status}
          stepAccordionOnChange={(event, expanded) => {
            helperCloseOtherAccordions(expanded, 2);
          }}
          doneButtonCallBack={() => {
            helperStepDoneOrSkip(2);
          }}>
          <ActivityDataFilter trip_id={props.trip_id} />
        </TripStep>
        <TripStep
          title="Step 3: Choose data from other systems, (IAPP)"
          helpText="This is where you can cache IAPP sites, and later other points of interest.  If you want to search for records in a particular area, draw a polygon on the map."
          additionalText="other"
          expanded={stepState[3].expanded}
          tripStepDetailsClassName={classes.pointOfInterestList}
          stepStatus={stepState[3].status}
          stepAccordionOnChange={(event, expanded) => {
            helperCloseOtherAccordions(expanded, 3);
          }}
          doneButtonCallBack={() => {
            helperStepDoneOrSkip(3);
          }}>
          <PointOfInterestDataFilter trip_id={workingTripID} />
        </TripStep>
        <TripStep
          title="OPTIONAL: Get data from a Metabase Question"
          helpText="If you have a Metabase question that contains field activity ID's, you can load those records here."
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
          <MetabaseSearch />
        </TripStep>
        <TripStep
          title="Last Step: Cache, Refresh, or Delete data for Trip "
          helpText="Cache the data and map data for the region you have selected, or refresh it, or delete."
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
          <TripDataControls />
          <ManageDatabaseComponent />
        </TripStep>
      </Grid>
    );
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
          <Grid alignContent="flex-start" justify="space-between" xs={12} container>
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

  return (
    <Container className={props.classes.container}>
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
      <Button onClick={addTrip} color="primary" variant="contained">
        Add Trip
      </Button>
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
                    <DeleteForever />
                  </IconButton>
                )
              }))
        }
        dropdown={(row) => {
          console.dir(row);
          return <SingleTrip trip_id={row.trip_id} />;
        }}

        // expandable: defaults true
        // startExpanded: default true
        // startingOrder: default asc
        // startingRowsPerPage: default 10;
        // rowsPerPageOptions: default false (turns off the [5,10,15] per page select thing)
      />
      {/*   <TripListComponent />*/}
    </Container>
  );
};

export default PlanPage;
