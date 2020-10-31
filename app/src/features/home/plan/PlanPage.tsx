import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Grid,
  LinearProgress,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import ActivityDataFilter from 'components/activities-search-controls/ActivitiesFilter';
import ManageDatabaseComponent from 'components/database/ManageDatabaseComponent';
import KMLUpload from 'components/map-buddy-components/KMLUpload';
import MapContainer from 'components/map/MapContainer';
import PointOfInterestDataFilter from 'components/point-of-interest-search/PointOfInterestFilter';
import TripDataControls from 'components/trip/TripDataControls';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useContext, useEffect, useState } from 'react';

interface IPlanPageProps {
  classes?: any;
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  mapContainer: {
    height: '600px',
    position: 'fixed'
  },
  mapGridItem: {
    //position: 'fixed',
    //width: '500px',
  },
  map: {
    height: '500px',
    width: '100%'
  },
  kmlContainer: {
    height: '100%',
    width: '100%'
  },
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular
  },
  layerPicker: {
    height: '100%',
    width: '100%'
  },
  activityRecordPicker: {
    height: '100%',
    width: '100%'
  },
  pointOfInterest: {
    height: '100%',
    width: '100%'
  },
  activityRecordQueryParmsRow: {
    width: '400px'
  },
  activityRecordPickerAddButton: {
    color: theme.palette.text.primary,
    backgroundcolor: theme.palette.primary.light
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
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  }
}));

const PlanPage: React.FC<IPlanPageProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);

  const [tripLoaded, setTripLoaded] = useState(false);

  const getTrip = async () => {
    let docs = await databaseContext.database.find({
      selector: {
        _id: 'trip'
      }
    });

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
  }, [geometry, tripLoaded]);

  // persist extent changes
  useEffect(() => {
    if (!tripLoaded) {
      return;
    }

    databaseContext.database.upsert('trip', (tripDoc) => {
      return { ...tripDoc, extent: extent };
    });
  }, [extent, tripLoaded]);

  return (
    <Container className={props.classes.container}>
      <ManageDatabaseComponent />
      <TripDataControls />
      <Grid container spacing={3} className={classes.tripGrid}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography className={classes.heading}>Storage Used By This Trip:</Typography>
            <LinearProgress className={classes.tripStorageUsageBar} value={50} variant={'determinate'} />
            <Typography className={classes.heading}>Total Storage Used:</Typography>
            <LinearProgress className={classes.totalStorageUsageBar} value={70} variant={'determinate'} />
          </Paper>
        </Grid>
        <Grid item md={6}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel-layer-picker-content"
              id="panel-layer-picker-header">
              <Typography className={classes.heading}>Pick Layers</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.layerPicker}>
              <Paper>bonana</Paper>
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel-activiity-record-picker-content"
              id="panel-activity-record-picker-header">
              <Typography className={classes.heading}>Pick Activity Records</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.activityRecordPicker}>
              <ActivityDataFilter />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel-pointOfInterest-record-picker-content"
              id="panel-pointOfInterest-record-picker-header">
              <Typography className={classes.heading}>Points Of Interest</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.pointOfInterest}>
              <PointOfInterestDataFilter />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-kml-content" id="panel-kml-header">
              <Typography className={classes.heading}>Load KML</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.kmlContainer}>
              <KMLUpload />
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item md={6} className={classes.mapGridItem}>
          <Paper className={classes.paper} elevation={5}>
            <MapContainer
              {...props}
              classes={classes}
              mapId={'TODO_this_needs_to_be_a_globally_uniqe_id_per_map_instance'}
              geometryState={{ geometry, setGeometry }}
              extentState={{ extent, setExtent }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PlanPage;
