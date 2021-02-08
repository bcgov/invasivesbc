import DateFnsUtils from '@date-io/date-fns';
import { Button, Grid, List, ListItem, makeStyles, Paper, TextField } from '@material-ui/core';
import { Add, DeleteForever } from '@material-ui/icons';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState, useCallback } from 'react';

interface IMetabaseChoices {
  metabaseQueryId: string;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  metabaseRecordsChoice: {
    padding: theme.spacing(2)
  },
  metabaseSearchField: {
    width: '250px'
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
    let copy = [...metabaseChoices];
    copy.splice(index, 1);
    saveChoices(copy);
  };

  const classes = useStyles();

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid className={classes.metabaseFilter}>
          <List>
            {metabaseChoices.map((metabaseChoice, index) => {
              return (
                <ListItem key={index}>
                  <Paper className={classes.metabaseRecordsChoice}>
                    <Grid container spacing={3}>
                      <Grid item xs={4}>
                        <div>
                          <TextField
                            className={classes.metabaseSearchField}
                            label="Metabase Query ID"
                            value={metabaseChoice.metabaseQueryId}
                            onChange={(e) => {
                              updateMetabaseChoice({ ...metabaseChoice, metabaseQueryId: e.target.value }, index);
                            }}
                          />
                        </div>
                      </Grid>
                      <Grid container item justify="flex-end">
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
