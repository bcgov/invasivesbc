import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Grid,
  InputLabel,
  List,
  ListItem,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Slider,
  Switch,
  Typography
} from '@material-ui/core';
import ManageDatabaseContainer from 'components/database/ClearDatabase';
import MapContainer from 'components/map/MapContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useContext, useEffect, useState } from 'react';

import { kml } from '@tmcw/togeojson';
import { ExpandMore } from '@material-ui/icons';
// node doesn't have xml parsing or a dom. use xmldom
const DOMParser = require('xmldom').DOMParser;

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
  }
}));

const KMLUpload: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  // Raw file kept in useState var and converted to Geo before hitting db:
  const [aFile, setAFile] = useState(null);

  const saveKML = async (input: File) => {
    const fileAsString = await input.text().then((xmlString) => {
      return xmlString;
    });
    const DOMFromXML = new DOMParser().parseFromString(fileAsString);
    const geoFromDOM = kml(DOMFromXML);
    console.log('geo');

    if (geoFromDOM) {
      console.log('saving geo feat collection');
      databaseContext.database.upsert('theShapeAsGeoFeatureCollection', (shapeLastTime) => {
        return geoFromDOM;
      });
    }
  };

  useEffect(() => {
    if (aFile) {
      saveKML(aFile);
    }
  }, [aFile]);

  return (
    <DropzoneArea
      dropzoneText="Upload KML here"
      onChange={(e) => {
        setAFile(e[0]);
      }}
    />
  );
};

const Trip: React.FC<any> = (props) => {
  return <></>;
};

const PlanPage: React.FC<IPlanPageProps> = (props) => {
  const [geoFeatCollection, setGeoFeatCollection] = useState(null);

  const databaseContext = useContext(DatabaseContext);
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
      <ManageDatabaseContainer />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography className={classes.heading}>Zoe's wild trip</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-kml-content" id="panel-kml-header">
              <Typography className={classes.heading}>Load KML</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.kmlContainer}>
              <KMLUpload />
            </AccordionDetails>
          </Accordion>
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
              <List>
                {[1, 2, 3, 4, 5].map((i) => {
                  return (
                    <ListItem key={i}>
                      <Paper className={classes.activityRecordQueryParmsRow}>
                        <InputLabel id="demo-simple-select-label">Activity Type</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value="Select an Activity Type"
                          defaultValue="Select an Activity Type"
                          onChange={() => {}}>
                          <MenuItem value={10}>Observation</MenuItem>
                          <MenuItem value={20}>Treatment</MenuItem>
                          <MenuItem value={30}>Monitoring</MenuItem>
                        </Select>
                        {/*     <Slider>Density</Slider>*/}
                        <InputLabel>Photos</InputLabel>
                        <Switch
                          checked={true}
                          onChange={() => {
                            return null;
                          }}
                          name="checkedA"
                          inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />
                      </Paper>
                    </ListItem>
                  );
                })}
              </List>
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
              <Paper>bonana</Paper>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={6} className={classes.mapGridItem}>
          <Paper className={classes.paper} elevation={5}>
            <MapContainer {...props} geoFeatCollection={geoFeatCollection} classes={classes} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PlanPage;
