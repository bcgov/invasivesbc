import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { Button, Grid, List, ListItem, makeStyles, MenuItem, Paper, Select, TextField } from '@material-ui/core';
import { Add, DeleteForever, SettingsBrightnessSharp } from '@material-ui/icons';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DatabaseContext, query, QueryType, upsert, UpsertType } from 'contexts/DatabaseContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { DocType } from 'constants/database';

interface IMetabaseChoices {
  metabaseQueryId: string;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  metabaseRecordsChoice: {
    padding: theme.spacing(2)
  },
  metabaseSearchField: {
    width: 'fit-content',
    minWidth: 200
  },
  metabaseFilter: {
    flexDirection: 'column'
  },
  metabaseAddButton: {
    width: '100%'
  }
}));

export const MetabaseSearch: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const [metabaseChoices, setMetabaseChoices] = useState([]);
  const [metabaseOptions, setMetabaseOptions] = useState([]);
  const [trip, setTrip] = useState(null);
  const invasivesApi = useInvasivesApi();

  const getMetabaseChoicesFromTrip = async () => {
    let docs = await query(
      {
        type: QueryType.DOC_TYPE_AND_ID,
        docType: DocType.TRIP,
        ID: props.trip_ID
      },
      databaseContext
    );
    console.log(docs);
    if (docs[0].json.metabaseChoices) setMetabaseChoices([...JSON.parse(docs[0].json).metabaseChoices]);
    if (docs[0].json.metabaseOptions) setMetabaseOptions([...JSON.parse(docs[0].json).metabaseOptions]);
    setTrip(JSON.parse(docs[0].json));
  };

  const getMetabaseQueryOptions = useCallback(async () => {
    // update metabase query options (rate limited to once per minute so we don't break metabase)
    if (!trip) {
      return;
    }
    if (
      metabaseChoices &&
      (!trip.metabaseQueryOptionsLastChecked || moment().diff(trip.metabaseQueryOptionsLastChecked, 'minutes') >= 1)
    ) {
      try {
        let options: Array<object> = await invasivesApi.getMetabaseQueryOptions();
        await upsert(
          [
            {
              type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
              docType: DocType.TRIP,
              ID: props.trip_ID,
              json: { metabaseQueryOptionsLastChecked: moment().valueOf(), metabaseQueryOptions: options }
            }
          ],
          databaseContext
        );
        setMetabaseOptions([...options]);
      } catch (error) {
        console.log('error here' + error);
        if (trip.metabaseQueryOptions) setMetabaseOptions(trip.metabaseQueryOptions);
      }
    } else {
      if (trip.metabaseQueryOptions) setMetabaseOptions(trip.metabaseQueryOptions);
    }
  }, [trip]);

  useEffect(() => {
    const updateComponent = () => {
      getMetabaseChoicesFromTrip();
    };
    updateComponent();
  }, []);

  const saveChoices = async (newMetabaseChoices) => {
    await upsert(
      [
        {
          type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
          docType: DocType.TRIP,
          ID: props.trip_ID,
          json: { metabaseChoices: newMetabaseChoices }
        }
      ],
      databaseContext
    );
    setMetabaseChoices([...newMetabaseChoices]);
  };

  const addMetabaseChoice = (newMetabase: IMetabaseChoices) => {
    saveChoices([...metabaseChoices, newMetabase]);
  };

  const updateMetabaseChoice = (updatedMetabase: IMetabaseChoices, index: number) => {
    const updatedMetabaseChoices = [...metabaseChoices];
    updatedMetabaseChoices[index] = updatedMetabase;
    saveChoices([...updatedMetabaseChoices]);
  };

  const deleteMetabaseChoice = (index: number) => {
    const copy = [...metabaseChoices];
    copy.splice(index, 1);
    saveChoices(copy);
  };

  const classes = useStyles();

  if (!metabaseOptions?.length) getMetabaseQueryOptions();

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid className={classes.metabaseFilter}>
          <List>
            {metabaseChoices.map((metabaseChoice, index) => {
              return (
                <ListItem key={index}>
                  <Paper className={classes.metabaseRecordsChoice}>
                    <Grid container spacing={2} direction="row">
                      <Grid container item xs={8}>
                        {metabaseOptions && metabaseOptions.length ? (
                          <Select
                            className={classes.metabaseSearchField}
                            label="Metabase Query"
                            id="select"
                            value={metabaseChoice.metabaseQueryId}
                            onClick={() => {
                              getMetabaseQueryOptions();
                            }}
                            onChange={(e) => {
                              updateMetabaseChoice(
                                {
                                  ...metabaseChoice,
                                  metabaseQueryId: '' + e.target.value,
                                  metabaseQueryName: metabaseOptions
                                    .filter((option) => option.id === e.target.value)
                                    .map((option) => option.name)
                                },
                                index
                              );
                            }}>
                            {metabaseOptions.map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.name}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <TextField
                            className={classes.metabaseSearchField}
                            label="Metabase Query ID"
                            value={metabaseChoice.metabaseQueryId}
                            onClick={() => {
                              getMetabaseQueryOptions();
                            }}
                            onChange={(e) => {
                              updateMetabaseChoice({ ...metabaseChoice, metabaseQueryId: e.target.value }, index);
                            }}
                          />
                        )}
                      </Grid>
                      <Grid container item xs={4} justify="flex-end">
                        <Button
                          variant="contained"
                          startIcon={<DeleteForever />}
                          onClick={() => deleteMetabaseChoice(index)}>
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </ListItem>
              );
            })}
          </List>
          <Button
            variant="contained"
            color="primary"
            className={classes.metabaseAddButton}
            startIcon={<Add />}
            onClick={() => {
              addMetabaseChoice({
                metabaseQueryId: ''
              });
            }}>
            Add New
          </Button>
        </Grid>
      </MuiPickersUtilsProvider>
    </>
  );
};

export default MetabaseSearch;
