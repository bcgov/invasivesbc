import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Grid,
  makeStyles,
  Paper,
  LinearProgress,
  Typography
} from '@material-ui/core';
import ManageDatabaseComponent from 'components/database/ManageDatabaseComponent';
import MapContainer from 'components/map/MapContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import KMLUpload from 'components/map-buddy-components/KMLUpload';
import { ExpandMore } from '@material-ui/icons';
import ActivityDataFilter from 'components/activities-search-controls/ActivitiesFilter';
import PointOfInterestDataFilter from 'components/point-of-interest-search/PointOfInterestFilter';
import TripDataControls from 'components/trip/TripDataControls';

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
  const [geoFeatCollection, setGeoFeatCollection] = useState(null);

  const databaseContext = useContext(DatabaseContext);

  const [geometry, setGeometry] = useState(null);
  const [extent, setExtent] = useState(null);

  const getGeos = () => {
    databaseContext.database
      .find({
        selector: {
          _id: 'theShapeAsGeoFeatureCollection'
        }
      })
      .then((doc) => {
        if (doc && doc.docs) {
          if (doc.docs[0]) {
            console.log('call geo feat setter');
            setGeoFeatCollection(doc.docs[0]);
          }
        }
      });
  };

  useEffect(() => {
    getGeos();
  }, []);

  const classes = useStyles();
  return (
    <Container className={props.classes.container}>
      <ManageDatabaseComponent />
      <TripDataControls />
      <Grid container spacing={3} className={classes.tripGrid}>
        <Grid item xs={12} sm={12}>
          <Paper className={classes.paper}>
            <Typography className={classes.heading}>Storage Used By This Trip:</Typography>
            <LinearProgress className={classes.tripStorageUsageBar} value={50} variant={'determinate'} />
            <Typography className={classes.heading}>Total Storage Used:</Typography>
            <LinearProgress className={classes.totalStorageUsageBar} value={70} variant={'determinate'} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
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
        <Grid item xs={12} sm={6} className={classes.mapGridItem}>
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
