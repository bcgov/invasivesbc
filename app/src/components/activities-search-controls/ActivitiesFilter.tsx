import makeStyles from '@mui/styles/makeStyles';
import Add from '@mui/icons-material/Add';
import DeleteForever from '@mui/icons-material/DeleteForever';
import DatePicker from '@mui/lab/DatePicker';
import { DocType } from 'constants/database';
import { DatabaseContext, query, QueryType, upsert, UpsertType } from 'contexts/DatabaseContext';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {Box, Button, Grid, InputLabel, List, ListItem, MenuItem, Paper, Select, Switch, TextField} from "@mui/material";

interface IActivityChoices {
  activityType: string;
  includePhotos: boolean;
  includeForms: boolean;
  species: number[];
  startDate: string;
  endDate: string;
}

const useStyles = makeStyles((theme: any) => ({
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
  const [activityChoices, setActivityChoices] = useState([]);
  const classes = useStyles();

  const getActivityChoicesFromTrip = useCallback(async () => {
    let queryResults = await databaseContext.asyncQueue({
      asyncTask: () => {
        return query({ type: QueryType.DOC_TYPE_AND_ID, ID: props.trip_ID, docType: DocType.TRIP }, databaseContext);
      }
    });

    const choices = JSON.parse(queryResults[0].json).activityChoices;
    if (choices) {
      setActivityChoices([...choices]);
    }
  }, []);

  useEffect(() => {
    const updateComponent = () => {
      getActivityChoicesFromTrip();
    };
    updateComponent();
  }, [getActivityChoicesFromTrip]);

  const saveChoices = async (newActivityChoices) => {
    console.log('updating trip ' + props.trip_ID + ' activity filters');
    const tripID: string = props.trip_ID;
    await databaseContext.asyncQueue({
      asyncTask: async () => {
        return upsert(
          [
            {
              type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
              ID: tripID,
              docType: DocType.TRIP,
              json: { activityChoices: newActivityChoices }
            }
          ],
          databaseContext
        );
      }
    });
    setActivityChoices([...newActivityChoices]);
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

  return (
    <>
      {/* <MuiPickersUtilsProvider utils={DateFnsUtils}> */}
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
                        updateActivityChoice({ ...activityChoice, includeForms: !activityChoice.includeForms }, index);
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      renderInput={(params) => <TextField {...params} />}
                      label="Earliest Date"
                      value={activityChoice.startDate}
                      onChange={(e) => {
                        updateActivityChoice({ ...activityChoice, startDate: e }, index);
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      renderInput={(params) => <TextField {...params} />}
                      label="Latest Date"
                      value={activityChoice.endDate}
                      onChange={(e) => {
                        updateActivityChoice({ ...activityChoice, endDate: e }, index);
                      }}
                    />
                  </Grid>
                  <Grid container item justifyContent="flex-end">
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
      {/* </MuiPickersUtilsProvider> */}
    </>
  );
};

export default ActivityDataFilter;
