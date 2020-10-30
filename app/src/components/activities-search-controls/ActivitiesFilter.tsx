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
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';

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
  const databaseChangesContext = useContext(DatabaseChangesContext);
  const [activityChoices, setActivityChoices] = useState([]);

  const getActivityChoicesFromTrip = async () => {
    let docs = await databaseContext.database.find({
      selector: {
        _id: 'trip'
      }
    });
    if (docs.docs.length > 0) {
      let tripDoc = docs.docs[0];
      if (tripDoc.activityChoices) {
        setActivityChoices([...tripDoc.activityChoices]);
      }
    }
  };

  useEffect(() => {
    const updateComponent = () => {
      getActivityChoicesFromTrip();
    };
    updateComponent();
  }, [databaseChangesContext]);

  const saveChoices = async (newActivityChoices) => {
    await databaseContext.database.upsert('trip', (tripDoc) => {
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
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Button
          color="primary"
          onClick={() => {
            addActivityChoice({
              activityType: 'Observation',
              includePhotos: false,
              includeForms: false,
              species: [null],
              startDate: new Date().toISOString(),
              endDate: new Date().toISOString()
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
                              startDate: e
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
                              endDate: e
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
