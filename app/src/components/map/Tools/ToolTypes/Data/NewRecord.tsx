import {
  Collapse,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  MenuItem,
  Select,
  TextField,
  Typography,
  ListSubheader
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { Autocomplete, ListItemButton } from '@mui/material';
import { ActivitySubtype, ActivitySubtypeShortLabels, ActivitySyncStatus, ActivityType } from 'constants/activities';
import { AuthStateContext } from 'contexts/authStateContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRecordsContext, MAP_RECORD_TYPE, MODES } from 'contexts/MapRecordsContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { generateDBActivityPayload, sanitizeRecord } from 'utils/addActivity';
import { toolStyles } from '../../Helpers/ToolStyles';

export const NewRecord = (props) => {
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
  const toolClass = toolStyles();

  // Is this needed? Copied from DisplayPosition

  enum recordCategoryTypes {
    animal = 'animal',
    plant = 'plant',
    other = 'other'
  }
  const [recordCategory, setRecordCategory] = useState(recordCategoryTypes.plant);
  const [recordType, setRecordType] = useState(ActivitySubtypeShortLabels.Activity_Observation_PlantTerrestrial);
  const { userInfo } = useContext(AuthStateContext);
  const mapRecordsContext = useContext(MapRecordsContext);

  const createActivityOnClick = async () => {
    // start shape editing
    mapRecordsContext.editRef.current.startMarker();

    // create a record in db, get the id
    const activity_id = await insert_record();

    //stop displaying new record menu
    setMode('NOT_PRESSED');

    // display draw buttons
    mapRecordsContext.setMode(MODES.SINGLE_ACTIVITY_EDIT);

    // set up map records context to deal with activity edits
    const onSave = async (geo: any) => {
      const dbActivity: any = await dataAccess.getActivityById(activity_id, databaseContext);
      console.dir('dbActivity', dbActivity);
      console.log('geo on save', geo);
      const result = await dataAccess.updateActivity(
        {
          ...sanitizeRecord({
            ...dbActivity,
            sync_status: ActivitySyncStatus.SAVE_SUCCESSFUL
          }),
          geometry: [geo]
        },
        databaseContext
      );
      //try without the santiize/record table stuff:
      /*
      await dataAccess.updateActivity(dbActivity, databaseContext);
      */
    };
    mapRecordsContext.setCurrentGeoEdit({
      geometry: null,
      type: MAP_RECORD_TYPE.ACTIVITY,
      id: activity_id,
      onSave: onSave
    });
  };

  const RecordCategorySelector = (props) => {
    return (
      <ListItem>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Record Category</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={recordCategory}
            label="Record Category"
            onChange={(e) => {
              setRecordCategory(e.target.value as recordCategoryTypes);
            }}>
            <MenuItem value={recordCategoryTypes.plant}>Plant</MenuItem>
            <MenuItem value={recordCategoryTypes.animal}>Animal</MenuItem>
            <MenuItem value={recordCategoryTypes.other}>Other</MenuItem>
          </Select>
        </FormControl>
      </ListItem>
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
      <ListItem style={{ paddingTop: '10px' }}>
        <FormControl fullWidth>
          <Autocomplete
            ref={divRef}
            id="combo-box-demo"
            options={options}
            renderInput={(params) => <TextField label="Record Type" {...params} />}
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
      </ListItem>
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
    return dbActivity.activity_id;
    /* setTimeout(() => {
      
      history.push({ pathname: `/home/activity` });
    }, 1000);
    */
  };

  const [mode, setMode] = useState('NOT_PRESSED');

  return (
    <>
      <ListItemButton
        aria-label="Create Record"
        onClick={() => {
          setMode((prev) => {
            if (prev !== 'PRESSED') {
              return 'PRESSED';
            } else {
              return 'NOT_PRESSED';
            }
          });
        }}>
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText>
          <Typography className={toolClass.Font}>New Record</Typography>
        </ListItemText>
        {mode === 'PRESSED' ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <>
        {mode !== 'NOT_PRESSED' && <Divider />}
        <Collapse
          in={mode !== 'NOT_PRESSED'}
          style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
          classes={{ root: `{ entered: { innerHeight: 10 } }` }}
          timeout="auto">
          <List
            component="div"
            disablePadding
            subheader={
              <ListSubheader disableSticky component="div" id="nested-list-subheader">
                New Record Options
              </ListSubheader>
            }>
            <RecordCategorySelector />

            <RecordTypeSelector />

            <ListItemButton
              aria-label="Create"
              onClick={() => {
                createActivityOnClick();
              }}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText>
                <Typography className={toolClass.Font}>Create Record</Typography>
              </ListItemText>
            </ListItemButton>

            <ListItemButton
              aria-label="Cancel"
              onClick={() => {
                setMode('NOT_PRESSED');
              }}>
              <ListItemIcon>
                <CancelPresentationIcon />
              </ListItemIcon>
              <ListItemText>
                <Typography className={toolClass.Font}>Cancel</Typography>
              </ListItemText>
            </ListItemButton>
          </List>
        </Collapse>
        {mode !== 'NOT_PRESSED' && <Divider />}
      </>
    </>
  );
};

export default NewRecord;
