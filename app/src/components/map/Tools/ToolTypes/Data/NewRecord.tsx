import {
  Box,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@material-ui/core';
import AddIcon from '@mui/icons-material/Add';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { Autocomplete } from '@mui/material';
import { ActivitySubtype, ActivitySubtypeShortLabels, ActivityType } from 'constants/activities';
import { AuthStateContext } from 'contexts/authStateContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRecordsContext } from 'contexts/MapRecordsContext';
import { ThemeContext } from 'contexts/themeContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { generateDBActivityPayload } from 'utils/addActivity';
import { toolStyles } from '../../Helpers/ToolStyles';

export const NewRecord = (props) => {
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);
  const history = useHistory();

  // Is this needed? Copied from DisplayPosition

  enum recordCategoryTypes {
    animal = 'animal',
    plant = 'plant',
    other = 'other'
  }
  const [recordCategory, setRecordCategory] = useState(recordCategoryTypes.plant);
  const [recordType, setRecordType] = useState(ActivitySubtypeShortLabels.Activity_Observation_PlantTerrestrial);
  const { userInfo } = useContext(AuthStateContext);
  const [isDroppingMarker, setIsDroppingMarker] = useState(false);
  const mapRecordsContext = useContext(MapRecordsContext);

  const dropMarker = () => {
    mapRecordsContext.editRef.current.startMarker();
    insert_record();
  };

  const RecordCategorySelector = (props) => {
    return (
      <Paper>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Record Category</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={recordCategory}
            label="Record Category"
            onChange={(e) => {
              setRecordCategory(e.target.value as recordCategoryTypes);
              console.log('setting type');
            }}>
            <MenuItem value={recordCategoryTypes.plant}>Plant</MenuItem>
            <MenuItem value={recordCategoryTypes.animal}>Animal</MenuItem>
            <MenuItem value={recordCategoryTypes.other}>Other</MenuItem>
          </Select>
        </FormControl>
      </Paper>
    );
  };

  const RecordTypeSelector = (props) => {
    const divRef = useRef(null);

    // initial setup & events to block:
    useEffect(() => {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    });
    const options = Object.values(ActivitySubtypeShortLabels).map((v) => {
      return { label: v, value: v };
    });
    return (
      <Box width={'100%'} height={'200%'}>
        <div>
          <Paper>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Record Category</InputLabel>
              <Autocomplete
                ref={divRef}
                id="combo-box-demo"
                options={options}
                renderInput={(params) => <TextField {...params} />}
                isOptionEqualToValue={(option, value) => {
                  return option === value ? true : false;
                }}
                onChange={(e, v) => {
                  //        console.log(e);
                  //       console.log(v);
                  setRecordType(v as ActivitySubtypeShortLabels);
                }}
                value={recordType}
              />
            </FormControl>
          </Paper>
        </div>
      </Box>
    );
  };

  const insert_record = async () => {
    setMode('PRESSED');

    const type = ActivityType.Observation;
    const subtype = ActivitySubtype.Observation_PlantTerrestrial;

    //temporary until we clean up/remove activity transformation

    /*
    const category = () => {
      // infer based on the long name for lack of better way of doing it
      const recortTypeAsString = recordType.toString();
      if (recortTypeAsString.includes('Plant')) {
        return 'Plant';
      } else if (recortTypeAsString.includes('Animal')) {
        return 'Animal';
      } else {
        return 'Other';
      }
    };

    const type = () => {
      // infer based on the long name for lack of better way of doing it
      const recortTypeAsString = recordType.toString();
      if (recortTypeAsString.includes('Observation')) {
        return 'Observation';
      } else if (recortTypeAsString.includes('Treatment')) {
        return '';
      } else {
        return 'Other';
      }
    };
  };

  const subType = () => {};
  */

    const dbActivity = generateDBActivityPayload({}, null, type, subtype);
    dbActivity.created_by = (userInfo as any)?.preferred_username;
    try {
      await dataAccess.createActivity(dbActivity, databaseContext);
      await dataAccess.setAppState({ activeActivity: dbActivity.activity_id }, databaseContext);
    } catch (e) {
      console.log('unable to http ');
      console.log(e);
    }
    setTimeout(() => {
      history.push({ pathname: `/home/activity` });
    }, 1000);
  };

  const [mode, setMode] = useState('NOT_PRESSED');

  const MainButton = (props) => {
    return (
      <IconButton
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        aria-label="Create Record"
        disabled={mode !== 'NOT_PRESSED'}
        onClick={props.onClick}>
        <AddIcon />
        <Typography className={toolClass.Font}>New Record</Typography>
      </IconButton>
    );
  };

  const RenderWhenMode_NotPressed = (props) => {
    const onClick = async () => {
      setMode('PRESSED');
    };
    return <MainButton onClick={onClick}></MainButton>;
  };

  const RenderWhenMode_Pressed = (props) => {
    return (
      <>
        <Grid xs={12} container className={toolClass.toolBtnMultiStageMenu}>
          <Grid item xs={3} className={toolClass.toolBtnMultiStageMenuItem}>
            <RecordCategorySelector />
          </Grid>
          <Grid item xs={3} className={toolClass.toolBtnMultiStageMenuItem}>
            <RecordTypeSelector />
          </Grid>
          <IconButton
            className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
            aria-label="Create"
            onClick={() => {
              setMode('NOT_PRESSED');
              dropMarker();
            }}>
            <Typography className={toolClass.Font}>Create Record</Typography>
          </IconButton>
          <Grid item xs={3} className={toolClass.toolBtnMultiStageMenuItem}>
            <IconButton
              className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
              aria-label="Cancel"
              onClick={() => {
                setMode('NOT_PRESSED');
              }}>
              <CancelPresentationIcon />
              <Typography className={toolClass.Font}>Cancel</Typography>
            </IconButton>
          </Grid>
          <Grid item xs={3} className={toolClass.toolBtnMultiStageMenuItem}>
            <MainButton />
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <div>
      {
        {
          NOT_PRESSED: <RenderWhenMode_NotPressed />,
          PRESSED: <RenderWhenMode_Pressed />
        }[mode]
      }
    </div>
  );
};

export default NewRecord;
