import {
  Button,
  List,
  ListItem,
  Paper,
  Grid,
  InputLabel,
  Switch,
  Select,
  MenuItem,
  makeStyles
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useState, useEffect } from 'react';

interface IActivityChoices {
  activityType: string;
  includePhotos: boolean;
  includeForms: boolean;
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

export const ActivityDataFilter: React.FC<any> = (props) => {
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
              <Paper elevation={5} className={classes.activityRecordQueryParmsRow}>
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

export default ActivityDataFilter;
