import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { Autocomplete } from '@mui/material';
import { ActivitySubtype, ActivitySubtypeShortLabels, ActivitySyncStatus, ActivityType } from 'constants/activities';
import { AuthStateContext } from 'contexts/authStateContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRecordsContext, MAP_RECORD_TYPE, MODES } from 'contexts/MapRecordsContext';
import { ThemeContext } from 'utils/CustomThemeProvider';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { generateDBActivityPayload, sanitizeRecord } from 'utils/addActivity';
import { toolStyles } from '../../Helpers/ToolStyles';

export const NewRecordRecordPagae = (props) => {
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);
  const history = useHistory();
  const { userInfo, hasRole, rolesUserHasAccessTo, userRoles } = useContext(AuthStateContext);

  // Is this needed? Copied from DisplayPosition

  enum recordCategoryTypes {
    animal = 'animal',
    plant = 'plant',
    other = 'other'
  }
  const mapRecordsContext = useContext(MapRecordsContext);

  const insert_record = async () => {
    setMode('PRESSED');

    const type = props.formType || ActivityType.Observation;
    const subtype = props.subType || ActivitySubtype.Observation_PlantTerrestrial;

    const dbActivity = generateDBActivityPayload({}, null, type, subtype);
    dbActivity.created_by = userInfo?.preferred_username;
    dbActivity.user_role = userRoles?.map((role) => role.role_id);
    await dataAccess.createActivity(dbActivity, databaseContext);
    dbActivity.created_by = (userInfo as any)?.preferred_username;
    try {
      await dataAccess.createActivity(dbActivity, databaseContext);
      await dataAccess.setAppState({ activeActivity: dbActivity.activity_id }, databaseContext);
    } catch (e) {
      console.log('unable to http ');
      console.log(e);
    }
    //return dbActivity.activity_id;
    setTimeout(() => {
      history.push({ pathname: `/home/activity` });
    }, 1000);
  };

  const [mode, setMode] = useState('NOT_PRESSED');

  return (
    <Button variant="contained" aria-label="Create Record" disabled={mode !== 'NOT_PRESSED'} onClick={insert_record}>
      New Record
    </Button>
  );
};

export default NewRecordRecordPagae;
