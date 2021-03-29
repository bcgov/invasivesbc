import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Grid,
  makeStyles,
  Paper,
  Tooltip,
  Typography
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
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

interface IPlanPageProps {
  classes?: any;
}

const useStyles = makeStyles((theme) => ({
  accordionSummary: {
    padding: theme.spacing(2),
    //todo more spacing, above doesnt work
    textAlign: 'center'
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
  const [extent, setExtent] = useState(null);

  const [tripLoaded, setTripLoaded] = useState(false);

  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  /* commented out for sonar cloud, but this will be needed to close the context menu for this page:
  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };
  */

  const getTrip = async () => {
    let docs = await databaseContext.database.find({ selector: { _id: 'trip' } });

    if (!docs || !docs.docs || !docs.docs.length) {
      return;
    }

    let tripDoc = docs.docs[0];

    if (tripDoc.geometry) {
      setGeometry(tripDoc.geometry);
    }

    if (tripDoc.extent) {
      setExtent(tripDoc.extent);
    }
  };

  // initial fetch
  useEffect(() => {
    const initialLoad = async () => {
      await getTrip();
      setTripLoaded(true);
    };

    initialLoad();
  }, [databaseContext]);

  // persist geometry changes
  useEffect(() => {
    if (!tripLoaded) {
      return;
    }

    databaseContext.database.upsert('trip', (tripDoc) => {
      return { ...tripDoc, geometry: geometry };
    });
  }, [geometry, tripLoaded, databaseContext.database]);

  // persist extent changes
  useEffect(() => {
    if (!tripLoaded) {
      return;
    }

    databaseContext.database.upsert('trip', (tripDoc) => {
      return { ...tripDoc, extent: extent };
    });
  }, [extent, tripLoaded, databaseContext.database]);

  const [trips, setTrips] = useState(0);

  const addTrip = () => {
    setTrips(trips + 1);
  };

  const TripListComponent: React.FC = (props) => {
    return (
      <Grid container spacing={3} className={classes.tripGrid}>
        <SingleTrip />
      </Grid>
    );
  };

  const SingleTrip: React.FC = (props) => {
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
        <Accordion>
          <AccordionSummary>Expand/Shrink Trip</AccordionSummary>
          <AccordionDetails className={classes.tripAccordion}>
            <Paper className={classes.paper}>
              <Typography variant="body1">Trip summary details</Typography>
            </Paper>
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
              <ActivityDataFilter />
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
              <PointOfInterestDataFilter />
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
          </AccordionDetails>
        </Accordion>
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
            <Grid item>
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
        <Typography variant="h5">My Trips</Typography>
        <Tooltip
          color="primary"
          title="Use this map along with the controls on the left to cache data.  Draw a shape to search by, or search without a spatial filter by using the trash can to delete the shape.  Hit the save icon on the map to save map tiles up to the zoom level you are in for a given area."
          arrow>
          <HelpIcon fontSize="large" />
        </Tooltip>
        <MapContainer
          {...props}
          classes={classes}
          showDrawControls={true}
          mapId={'TODO_this_needs_to_be_a_globally_uniqe_id_per_map_instance'}
          geometryState={{ geometry, setGeometry }}
          extentState={{ extent, setExtent }}
          contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
        />
      </Paper>
      <Button onClick={addTrip} variant="contained">
        Add Trip
      </Button>
      <TripListComponent />
    </Container>
  );
};

export default PlanPage;
