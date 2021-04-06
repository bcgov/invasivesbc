import DateFnsUtils from '@date-io/date-fns';
import {
  Box,
  Button,
  Grid,
  InputLabel,
  List,
  ListItem,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Switch
} from '@material-ui/core';
import { Add, DeleteForever } from '@material-ui/icons';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState, useCallback } from 'react';

interface IActivityChoices {
  activityType: string;
  includePhotos: boolean;
  includeForms: boolean;
  species: number[];
  startDate: string;
  endDate: string;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  activityRecordsChoice: {
    padding: theme.spacing(2)
  }
}));

export const ActivityDataFilter: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);
  const [activityChoices, setActivityChoices] = useState([]);

  const getActivityChoicesFromTrip = useCallback(async () => {
    let docs = await databaseContext.database.find({
      selector: {
        _id: props.trip_id
      }
    });
    if (docs.docs.length > 0) {
      let tripDoc = docs.docs[0];
      if (tripDoc.activityChoices) {
        setActivityChoices([...tripDoc.activityChoices]);
      }
    }
  }, [databaseContext.database]);

  useEffect(() => {
    const updateComponent = () => {
      getActivityChoicesFromTrip();
    };
    updateComponent();
  }, [databaseChangesContext, getActivityChoicesFromTrip]);

  const saveChoices = async (newActivityChoices) => {
    await databaseContext.database.upsert(props.trip_id, (tripDoc) => {
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
        <List>
          {activityChoices.map((activityChoice, index) => {
            return (
              <ListItem key={index}>
                <Paper className={classes.activityRecordsChoice}>
                  <Grid xs={8} container spacing={3}>
                    <Grid item xs={4}>
                      <div>
                        <InputLabel id="demo-simple-select-label">Activity Type</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={activityChoice.activityType}
                          onChange={(e) => {
                            updateActivityChoice({ ...activityChoice, activityType: e.target.value }, index);
                          }}>
                          <MenuItem value={''}>All</MenuItem>
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
                        checked={activityChoice.includePhotos}
                        value={activityChoice.includePhotos}
                        onChange={() => {
                          updateActivityChoice(
                            { ...activityChoice, includePhotos: !activityChoice.includePhotos },
                            index
                          );
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <InputLabel>Forms</InputLabel>
                      <Switch
                        color="primary"
                        checked={activityChoice.includeForms}
                        value={activityChoice.includeForms}
                        onChange={() => {
                          updateActivityChoice(
                            { ...activityChoice, includeForms: !activityChoice.includeForms },
                            index
                          );
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardDatePicker
                        autoOk
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Earliest Date"
                        value={activityChoice.startDate}
                        onChange={(e) => {
                          updateActivityChoice({ ...activityChoice, startDate: e }, index);
                        }}
                        KeyboardButtonProps={{
                          'aria-label': 'change date start'
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardDatePicker
                        autoOk
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Latest Date"
                        value={activityChoice.endDate}
                        onChange={(e) => {
                          updateActivityChoice({ ...activityChoice, endDate: e }, index);
                        }}
                        KeyboardButtonProps={{
                          'aria-label': 'change date end'
                        }}
                      />
                    </Grid>
                    <Grid container item justify="flex-end">
                      <Button
                        variant="contained"
                        startIcon={<DeleteForever />}
                        onClick={() => deleteActivityChoice(index)}>
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </ListItem>
            );
          })}
        </List>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => {
              addActivityChoice({
                activityType: '',
                includePhotos: false,
                includeForms: false,
                species: [],
                startDate: null,
                endDate: null
              });
            }}>
            Add New
          </Button>
        </Box>
      </MuiPickersUtilsProvider>
    </>
  );
};

export default ActivityDataFilter;
