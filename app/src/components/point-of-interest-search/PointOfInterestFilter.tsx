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

interface IPointOfInterestChoices {
  pointOfInterestType: string;
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
  pointOfInterestRecordPicker: {
    height: '100%',
    width: '100%'
  },
  pointOfInterestRecordQueryParmsRow: {
    width: '100%'
  },
  filterGrid: {
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  }
}));

export const PointOfInterestDataFilter: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  //todo db persist, ressurect, & update
  const [pointOfInterestChoices, setPointOfInterestChoices] = useState([]);

  const saveChoices = async () => {
    //placeholder
    await databaseContext.database.upsert('trip', (tripDoc) => {
      return { ...pointOfInterestChoices };
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

      const doc = await databaseContext.database.find({ selector: { _id: appState.docs[0].activePointOfInterest } });

      setDoc(doc.docs[0]);
    };

    getPointOfInterestData();
  }, [databaseContext]);

  if (!doc) {
    return <CircularProgress />;
  }
  */
  useEffect(() => {
    saveChoices();
  }, [pointOfInterestChoices]);

  const addPointOfInterestChoice = (newPointOfInterest: IPointOfInterestChoices) => {
    setPointOfInterestChoices([...pointOfInterestChoices, newPointOfInterest]);
  };

  const updatePointOfInterestChoice = (updatedPointOfInterest: IPointOfInterestChoices, index: number) => {
    let updatedPointOfInterestChoices = pointOfInterestChoices;
    updatedPointOfInterestChoices[index] = updatedPointOfInterest;
    setPointOfInterestChoices([...updatedPointOfInterestChoices]);
  };

  const deletePointOfInterestChoice = (index: number) => {
    let copy = [...pointOfInterestChoices];
    copy.splice(index, 1);
    setPointOfInterestChoices(copy);
  };

  const classes = useStyles();

  return (
    <>
      <Button
        color="primary"
        onClick={() => {
          addPointOfInterestChoice({
            pointOfInterestType: 'IAPP Site',
            includePhotos: false,
            includeForms: false
          });
        }}>
        add new
      </Button>
      <List>
        {pointOfInterestChoices.map((pointOfInterestChoice, index) => {
          return (
            <ListItem key={index}>
              <Paper elevation={5} className={classes.pointOfInterestRecordQueryParmsRow}>
                <Grid className={classes.filterGrid} container spacing={4} alignItems="center" justify="center">
                  <Grid item xs={3}>
                    <div style={{ padding: 20 }}>
                      <InputLabel id="demo-simple-select-label">Point Of Interest Type</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={pointOfInterestChoices[index].pointOfInterestType}
                        defaultValue="Select an PointOfInterest Type"
                        onChange={(e) => {
                          updatePointOfInterestChoice(
                            {
                              ...pointOfInterestChoices[index],
                              pointOfInterestType: e.target.value
                            },
                            index
                          );
                        }}>
                        <MenuItem value={'IAPP Site'}>IAPP Site</MenuItem>
                        <MenuItem value={'Well'}>Well</MenuItem>
                        <MenuItem value={'Sasquatch Siting'}>Sasquatch Siting</MenuItem>
                      </Select>
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <InputLabel>Photos</InputLabel>
                    <Switch
                      color="primary"
                      checked={pointOfInterestChoices[index].includePhotos}
                      onChange={(e) => {
                        updatePointOfInterestChoice(
                          {
                            ...pointOfInterestChoices[index],
                            includePhotos: !pointOfInterestChoices[index].includePhotos
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
                      checked={pointOfInterestChoices[index].includeForms}
                      onChange={(e) => {
                        updatePointOfInterestChoice(
                          {
                            ...pointOfInterestChoices[index],
                            includeForms: !pointOfInterestChoices[index].includeForms
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
                        deletePointOfInterestChoice(index);
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

export default PointOfInterestDataFilter;
