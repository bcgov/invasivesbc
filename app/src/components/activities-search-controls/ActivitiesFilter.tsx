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
import SpeciesTree from './SpeciesInput';

interface IActivityChoices {
  activityType: string;
  includePhotos: boolean;
  includeForms: boolean;
  species: [number];
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
  activityRecordPicker: {
    height: '100%',
    width: '100%'
  },
  activityRecordQueryParmsRow: {
    width: '100%'
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
        color="primary"
        onClick={() => {
          addActivityChoice({
            activityType: 'Observation',
            includePhotos: false,
            includeForms: false,
            species: [null]
          });
        }}>
        add new
      </Button>
      <List>
        {activityChoices.map((activityChoice, index) => {
          return (
            <ListItem key={index}>
              <Paper elevation={5} className={classes.activityRecordQueryParmsRow}>
                <Grid container spacing={4} alignItems="center" justify="center">
                  <Grid item xs={3}>
                    <div style={{ padding: 20 }}>
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
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <InputLabel>Photos</InputLabel>
                    <Switch
                      color="primary"
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
                      color="primary"
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
                      color="primary"
                      startIcon={<Delete />}
                      onClick={(e) => {
                        deleteActivityChoice(index);
                      }}></Button>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item xs={9}>
                    <div style={{ padding: 20 }}>
                      <SpeciesTree />
                    </div>
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
