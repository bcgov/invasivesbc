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
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Delete } from '@material-ui/icons';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useState, useEffect } from 'react';
import SpeciesTree from './SpeciesInput';
import DateFnsUtils from '@date-io/date-fns';
import { Subscription } from 'rxjs';

interface IActivityChoices {
  activityType: string;
  includePhotos: boolean;
  includeForms: boolean;
  species: [number];
  startDate: string;
  endDate: string;
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
  },
  filterGrid: {
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  }
}));

export const ActivityDataFilter: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const [activityChoices, setActivityChoices] = useState([]);

  const getActivityChoicesFromTrip = async () => {
    console.log('fetching trip from db');
    let docs = await databaseContext.database.find({
      selector: {
        _id: 'trip2'
      }
    });
    if (docs.docs.length > 0) {
      console.log('doc count: ' + docs.docs.length);
      setActivityChoices([...docs.docs[0]?.activityChoices]);
    }

    console.dir(docs.docs[0]);
  };

   useEffect(() => {
    const updateComponent = (): Subscription => {
      // initial update
      getActivityChoicesFromTrip();

      // subscribe to changes and update list on emit
      const subscription = databaseContext.changes.subscribe(() => {
        getActivityChoicesFromTrip();
      });

      // return subscription for use in cleanup
      return subscription;
    };

    const subscription = updateComponent();

    return () => {
      if (!subscription) {
        return;
      }

      // unsubscribe on cleanup
      subscription.unsubscribe();
    };
  }, [databaseContext]);


  const saveChoices = async (newActivityChoices) => {
    await databaseContext.database.upsert('trip2', (tripDoc) => {
      return { ...tripDoc, activityChoices: newActivityChoices };
    });
  };

  const addActivityChoice = (newActivity: IActivityChoices) => {
    saveChoices([...activityChoices, newActivity]);
  };

  const updateActivityChoice = (updatedActivity: IActivityChoices, index: number) => {
    let updatedActivityChoices = [...activityChoices];
    updatedActivityChoices[index] = updatedActivity;
    saveChoices([...updatedActivityChoices]);
  };

  const deleteActivityChoice = (index: number) => {
    let copy = [...activityChoices];
    copy.splice(index, 1);
    saveChoices(copy);
  };

  const classes = useStyles();

  return (
    <>
    {console.dir(activityChoices)}}
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Button
          color="primary"
          onClick={() => {
            addActivityChoice({
              activityType: 'Observation',
              includePhotos: false,
              includeForms: false,
              species: [null],
              startDate: Date(),
              endDate: Date()
            });
          }}>
          add new
        </Button>
        <List>
          {activityChoices.map((activityChoice, index) => {
            return (
              <ListItem key={index}>
                <Paper elevation={5} className={classes.activityRecordQueryParmsRow}>
                  <Grid className={classes.filterGrid} container spacing={4} alignItems="center" justify="flex-end">
                    <Grid item xs={4}>
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
                    <Grid item xs={4}>
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
                    <Grid item xs={4}>
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
                    <Grid item xs={4}>
                      <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Earliest Date"
                        value={activityChoices[index].startDate}
                        onChange={(e) => {
                          updateActivityChoice(
                            {
                              ...activityChoices[index],
                              startDate: activityChoices[index].startDate
                            },
                            index
                          );
                        }}
                        KeyboardButtonProps={{
                          'aria-label': 'change date'
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Latest Date"
                        value={activityChoices[index].endDate}
                        onChange={(e) => {
                          updateActivityChoice(
                            {
                              ...activityChoices[index],
                              endDate: activityChoices[index].endDate
                            },
                            index
                          );
                        }}
                        KeyboardButtonProps={{
                          'aria-label': 'change date'
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Delete />}
                        onClick={(e) => {
                          deleteActivityChoice(index);
                        }}></Button>
                    </Grid>
                  </Grid>
                  <Grid container spacing={4}>
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
      </MuiPickersUtilsProvider>
    </>
  );
};

export default ActivityDataFilter;
