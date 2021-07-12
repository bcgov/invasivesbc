import { Capacitor } from '@capacitor/core';
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
import { Add, ContactlessOutlined, DeleteForever } from '@material-ui/icons';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext, query, QueryType, upsert, UpsertType } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';

interface IPointOfInterestChoices {
  pointOfInterestType: string;
  iappType?: string;
  includePhotos: boolean;
  includeForms: boolean;
  startDate: string;
  endDate: string;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  pointOfInterestChoice: {
    padding: theme.spacing(2)
  }
}));

export const PointOfInterestDataFilter: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const [pointOfInterestChoices, setPointOfInterestChoices] = useState([]);
  const [iappSelected, setIappSelected] = useState(false);

  const getPointOfInterestChoicesFromTrip = async () => {
    console.log('trip id for point filter: ' + props.trip_ID);
    if (Capacitor.getPlatform() == 'web') {
      let docs = await databaseContext.database.find({
        selector: {
          _id: props.trip_ID
        }
      });
      if (docs.docs.length > 0) {
        let tripDoc = docs.docs[0];
        if (tripDoc.pointOfInterestChoices) {
          setPointOfInterestChoices([...tripDoc.pointOfInterestChoices]);
        }
      }
      //sqlite mobile:
    } else {
      let queryResults = await query(
        { type: QueryType.DOC_TYPE_AND_ID, ID: props.trip_ID, docType: DocType.TRIP },
        databaseContext
      );
      const choices = JSON.parse(queryResults[0].json).pointOfInterestChoices;
      if (choices) {
        setPointOfInterestChoices([...choices]);
      }
    }
  };

  //change this to only look for changes that are relevant
  useEffect(() => {
    const updateComponent = () => {
      getPointOfInterestChoicesFromTrip();
    };
    updateComponent();
  }, []);

  const saveChoices = async (newPointOfInterestChoices) => {
    //legacy pouch
    if (Capacitor.getPlatform() == 'web') {
      await databaseContext.database.upsert(props.trip_ID, (tripDoc) => {
        return { ...tripDoc, pointOfInterestChoices: newPointOfInterestChoices };
      });
    }
    //sqlite
    else {
      const tripID: string = props.trip_ID;
      let result = await upsert(
        [
          {
            type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
            ID: tripID,
            docType: DocType.TRIP,
            json: { pointOfInterestChoices: newPointOfInterestChoices }
          }
        ],
        databaseContext
      );
    }
    console.log('point of interest json');
    console.log(JSON.stringify(newPointOfInterestChoices));
    setPointOfInterestChoices([...newPointOfInterestChoices]);
  };

  const addPointOfInterestChoice = (newPointOfInterest: IPointOfInterestChoices) => {
    saveChoices([...pointOfInterestChoices, newPointOfInterest]);
  };

  const updatePointOfInterestChoice = (updatedPointOfInterest: IPointOfInterestChoices, index: number) => {
    let updatedPointOfInterestChoices = pointOfInterestChoices;
    updatedPointOfInterestChoices[index] = updatedPointOfInterest;
    saveChoices([...updatedPointOfInterestChoices]);
  };

  const deletePointOfInterestChoice = (index: number) => {
    let copy = [...pointOfInterestChoices];
    copy.splice(index, 1);
    saveChoices(copy);
  };

  const classes = useStyles();

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <List>
          {pointOfInterestChoices.map((pointOfInterestChoice, index) => {
            return (
              <ListItem key={index}>
                <Paper className={classes.pointOfInterestChoice}>
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <div>
                        <InputLabel id="demo-simple-select-label">Point Of Interest Type</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={pointOfInterestChoice.pointOfInterestType}
                          onChange={(e) => {
                            let iappType = null;
                            if (e.target.value === 'IAPP Site') {
                              iappType = '';
                              setIappSelected(true);
                            } else {
                              iappType = null;
                              setIappSelected(false);
                            }
                            updatePointOfInterestChoice(
                              { ...pointOfInterestChoice, pointOfInterestType: e.target.value, iappType: iappType },
                              index
                            );
                          }}>
                          <MenuItem value={''}>All</MenuItem>
                          <MenuItem value={'IAPP Site'}>IAPP Site</MenuItem>
                        </Select>
                      </div>
                    </Grid>
                    <Grid item xs={4}>
                      <div style={{ display: iappSelected ? 'block' : 'none' }}>
                        <InputLabel id="demo-simple-select-label">IAPP Data Type</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={pointOfInterestChoice.iappType}
                          onChange={(e) => {
                            updatePointOfInterestChoice({ ...pointOfInterestChoice, iappType: e.target.value }, index);
                          }}>
                          <MenuItem value={''}>All</MenuItem>
                          <MenuItem value={'Latest Survey Date'}>Latest Survey Date</MenuItem>
                          <MenuItem value={'Earliest Survey Date'}>Earliest Survey Date</MenuItem>
                          <MenuItem value={'Latest Chemical Treatment Date'}>Latest Chemical Treatment Date</MenuItem>
                          <MenuItem value={'Earliest Chemical Treatment Date'}>
                            Earliest Chemical Treatment Date
                          </MenuItem>
                          <MenuItem value={'Latest Chemical Treatment Monitoring Date'}>
                            Latest Chemical Treatment Monitoring Date
                          </MenuItem>
                          <MenuItem value={'Earliest Chemical Treatment Monitoring Date'}>
                            Earliest Chemical Treatment Monitoring Date
                          </MenuItem>
                          <MenuItem value={'Latest Biological Dispersal'}>Latest Biological Dispersal</MenuItem>
                          <MenuItem value={'Earliest Biological Dispersal'}>Earliest Biological Dispersal</MenuItem>
                          <MenuItem value={'Latest Biological Treatment Date'}>
                            Latest Biological Treatment Date
                          </MenuItem>
                          <MenuItem value={'Earliest Biological Treatment Date'}>
                            Earliest Biological Treatment Date
                          </MenuItem>
                          <MenuItem value={'Latest Biological Treatment Monitoring Date'}>
                            Latest Biological Treatment Monitoring Date
                          </MenuItem>
                          <MenuItem value={'Earliest Biological Treatment Monitoring Date'}>
                            Earliest Biological Treatment Monitoring Date
                          </MenuItem>
                          <MenuItem value={'Latest Mechanical Treatment Date'}>
                            Latest Mechanical Treatment Date
                          </MenuItem>
                          <MenuItem value={'Earliest Mechanical Treatment Date'}>
                            Earliest Mechanical Treatment Date
                          </MenuItem>
                          <MenuItem value={'Latest Mechanical Treatment Monitoring Date'}>
                            Latest Mechanical Treatment Monitoring Date
                          </MenuItem>
                          <MenuItem value={'Latest Mechanical Treatment Monitoring Date'}>
                            Latest Mechanical Treatment Monitoring Date
                          </MenuItem>
                        </Select>
                      </div>
                    </Grid>
                    {/*   <Grid item xs={4}>
                      <InputLabel>Photos</InputLabel>
                      <Switch
                        color="primary"
                        checked={pointOfInterestChoice.includePhotos}
                        onChange={() => {
                          updatePointOfInterestChoice(
                            { ...pointOfInterestChoice, includePhotos: !pointOfInterestChoice.includePhotos },
                            index
                          );
                        }}
                      />
                      </Grid>*/}
                    {/*  <Grid item xs={4}>
                      <InputLabel>Forms</InputLabel>
                      <Switch
                        color="primary"
                        checked={pointOfInterestChoice.includeForms}
                        onChange={() => {
                          updatePointOfInterestChoice(
                            { ...pointOfInterestChoice, includeForms: !pointOfInterestChoice.includeForms },
                            index
                          );
                        }}
                      />
                      </Grid> */}
                    <Grid item xs={6}>
                      <KeyboardDatePicker
                        autoOk
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Earliest Date"
                        value={pointOfInterestChoice.startDate}
                        onChange={(e) => {
                          updatePointOfInterestChoice({ ...pointOfInterestChoice, startDate: e }, index);
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
                        value={pointOfInterestChoice.endDate}
                        onChange={(e) => {
                          updatePointOfInterestChoice({ ...pointOfInterestChoice, endDate: e }, index);
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
                        onClick={() => deletePointOfInterestChoice(index)}>
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
              addPointOfInterestChoice({
                pointOfInterestType: '',
                includePhotos: true,
                includeForms: true,
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

export default PointOfInterestDataFilter;
