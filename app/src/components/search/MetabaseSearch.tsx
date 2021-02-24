import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { Button, Grid, List, ListItem, makeStyles, MenuItem, Paper, Select, TextField } from '@material-ui/core';
import { Add, DeleteForever } from '@material-ui/icons';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState, useCallback } from 'react';

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
  const databaseChangesContext = useContext(DatabaseChangesContext);
  const [metabaseChoices, setMetabaseChoices] = useState([]);
  const [metabaseOptions, setMetabaseOptions] = useState([]);
  const invasivesApi = useInvasivesApi();

  const getMetabaseChoicesFromTrip = useCallback(async () => {
    let docs = await databaseContext.database.find({
      selector: {
        _id: 'trip'
      }
    });

    if (docs.docs.length) {
      let tripDoc = docs.docs[0];
      if (tripDoc.metabaseChoices) {
        setMetabaseChoices([...tripDoc.metabaseChoices]);
      }
    }
  }, [databaseContext.database]);

  const getMetabaseQueryOptions = useCallback(async () => {
    let docs = await databaseContext.database.find({
      selector: {
        _id: 'trip'
      }
    });

    if (docs.docs.length) {
      let tripDoc = docs.docs[0];

      // update metabase query options (rate limited to once per minute so we don't break metabase)
      if (
        tripDoc.metabaseChoices && (
          !tripDoc.metabaseQueryOptionsLastChecked ||
          moment().diff(tripDoc.metabaseQueryOptionsLastChecked, 'minutes') >= 1
        )
      ) {
        let options: Array<object> = await invasivesApi.getMetabaseQueryOptions();
        await databaseContext.database.upsert('trip', (doc) => {
          return {
            ...doc,
            metabaseQueryOptionsLastChecked: moment().valueOf(),
            metabaseQueryOptions: options
          };
        });
        setMetabaseOptions(options);
      } else {
        if (tripDoc.metabaseQueryOptions) setMetabaseOptions(tripDoc.metabaseQueryOptions);
      }
    }
  }, [databaseContext.database]);

  useEffect(() => {
    const updateComponent = () => {
      getMetabaseChoicesFromTrip();
    };
    updateComponent();
  }, [databaseChangesContext, getMetabaseChoicesFromTrip]);

  const saveChoices = async (newMetabaseChoices) => {
    await databaseContext.database.upsert('trip', (tripDoc) => {
      return { ...tripDoc, metabaseChoices: newMetabaseChoices };
    });
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

  if (!metabaseOptions?.length)
    getMetabaseQueryOptions();

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
