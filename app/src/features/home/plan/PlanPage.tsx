import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Container,
  Grid,
  InputLabel,
  List,
  ListItem,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  LinearProgress,
  Switch,
  Typography
} from '@material-ui/core';
import Delete from '@material-ui/icons/Delete';
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
  deleteActivityChoicesButton: {
    color: theme.palette.text.secondary,
    backgroundcolor: theme.palette.primary.dark
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

interface IActivityChoices {
  activityType: string;
  includePhotos: boolean;
  includeForms: boolean;
}

const ActivityDataToCacheChooser: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  //todo db persist, ressurect, & update
  const [activityChoices, setActivityChoices] = useState([]);

  const saveChoices = async () => {
    // this is what fixed the main map
    await databaseContext.database.upsert('trip', (tripDoc) => {
      return { ...activityChoices };
    });
  };

  /*
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const getPreviousTripOptions = async () => {
      const appState = await databaseContext.database.find({ selector: { _id: 'AppState' } });

      if (!appState || !appState.docs || !appState.docs.length) {
        return;
      }

      const doc = await databaseContext.database.find({ selector: { _id: appState.docs[0].activeActivity } });

      setDoc(doc.docs[0]);
    };

    getActivityData();
  }, [databaseContext]);

  if (!doc) {
    return <CircularProgress />;
  }
  */
  useEffect(() => {
    saveChoices();
  }, [activityChoices]);

  const addActivityChoice = (newActivity: IActivityChoices) => {
    setActivityChoices([...activityChoices, newActivity]);
  };

  const updateActivityChoice = (updatedActivity: IActivityChoices, index: number) => {
    let updatedActivityChoices = activityChoices;
    updatedActivityChoices[index] = updatedActivity;
    setActivityChoices([...updatedActivityChoices]);
  };

  const deleteActivityChoice = (index: number) => {
    let copy = [...activityChoices];
    copy.splice(index, 1);
    setActivityChoices(copy);
  };

  const classes = useStyles();

  return (
    <>
      <Button
        className={classes.activityRecordPickerAddButton}
        onClick={() => {
          addActivityChoice({
            activityType: 'Observation',
            includePhotos: false,
            includeForms: false
          });
        }}>
        add new
      </Button>
      <List>
        {activityChoices.map((activityChoice, index) => {
          return (
            <ListItem key={index}>
              <Paper className={classes.activityRecordQueryParmsRow}>
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <InputLabel id="demo-simple-select-label">Activity Type</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={activityChoices[index].activityType}
                      defaultValue="Select an Activity Type"
                      onChange={(e) => {
                        updateActivityChoice(
                          {
                            ...activityChoices[index],
                            activityType: e.target.value
                          },
                          index
                        );
                      }}>
                      <MenuItem value={'Observation'}>Observation</MenuItem>
                      <MenuItem value={'Treatment'}>Treatment</MenuItem>
                      <MenuItem value={'Monitoring'}>Monitoring</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={3}>
                    <InputLabel>Photos</InputLabel>
                    <Switch
                      checked={activityChoices[index].includePhotos}
                      onChange={(e) => {
                        updateActivityChoice(
                          {
                            ...activityChoices[index],
                            includePhotos: !activityChoices[index].includePhotos
                          },
                          index
                        );
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <InputLabel>Forms</InputLabel>
                    <Switch
                      checked={activityChoices[index].includeForms}
                      onChange={(e) => {
                        updateActivityChoice(
                          {
                            ...activityChoices[index],
                            includeForms: !activityChoices[index].includeForms
                          },
                          index
                        );
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      variant="contained"
                      color="secondary"
                      className={classes.deleteActivityChoicesButton}
                      startIcon={<Delete />}
                      onClick={(e) => {
                        deleteActivityChoice(index);
                      }}></Button>
                  </Grid>
                </Grid>
              </Paper>
            </ListItem>
          );
        })}
      </List>
    </>
  );
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
            <Typography className={classes.heading}>Storage Used By This Trip:</Typography>
            <LinearProgress className={classes.tripStorageUsageBar} value={50} variant={'determinate'} />
            <Typography className={classes.heading}>Total Storage Used:</Typography>
            <LinearProgress className={classes.totalStorageUsageBar} value={70} variant={'determinate'} />
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
              <ActivityDataToCacheChooser />
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
