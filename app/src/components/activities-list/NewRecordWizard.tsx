import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import { useKeycloak } from '@react-keycloak/web';
import { DocType } from 'constants/database';
import React, { useContext, useEffect, useState } from 'react';
import BatchUpload from '../batch-upload/BatchUpload';
import { DatabaseContext, query, QueryType } from '../../contexts/DatabaseContext';
import ActivityGrid from 'components/activities-list/Tables/Plant/ActivityTable';
import { Button, Grid, Typography } from '@mui/material';
import NewRecord from 'components/map/Tools/ToolTypes/Data/NewRecordMainMap';
import NewRecordRecordPagae from 'components/map/Tools/ToolTypes/Data/NewRecordRecordPage';
import { ActivitySubtype, ActivitySubtypeShortLabels, ActivityType } from 'constants/activities';
import { useDataAccess } from 'hooks/useDataAccess';
import { CustomNoRowsOverlay } from 'components/data-grid/CustomNoRowsOverlay';

const useStyles = makeStyles((theme: any) => ({
  newActivityButtonsRow: {
    '& Button': {
      marginRight: '0.5rem',
      marginBottom: '0.5rem'
    }
  },
  syncSuccessful: {
    color: theme.palette.success.main
  },
  formControl: {
    marginRight: 20,
    minWidth: 150
  }
}));

const ActivitiesList2 = (props: any) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const da = useDataAccess();
  const { keycloak } = useKeycloak();
  const [formType, setFormType] = useState('Plant');
  const [subType, setSubType] = useState('Observations');
  const [oldAppState, setOldAppState] = useState(null);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    const userId = async () => {
      const userInfo: any = keycloak
        ? keycloak?.userInfo
        : await databaseContext.asyncQueue({
            asyncTask: () => {
              return query({ type: QueryType.DOC_TYPE_AND_ID, docType: DocType.KEYCLOAK, ID: '1' }, databaseContext);
            }
          });

      return userInfo?.preferred_username;
    };
    if (!userId) throw "Keycloak error: can not get current user's username";

    //get users last choice

    da.getAppState(databaseContext).then((v) => setOldAppState(v));
  }, []);

  /*
  useEffect(() => {
    if (oldAppState) {
      if (oldAppState.activitiesPageFormType) {
        setFormType(oldAppState.activitiesPageFormType);
      }
      if (oldAppState.activitiesPageSubType) {
        setSubType(oldAppState.activitiesPageSubType);
      }
    }
  }, [oldAppState]);
  */

  const handleFormTypeChange = (event: any) => {
    setFormType(event.target.value);
    //setsub type to something appropriate here
  };
  const handleSubTypeChange = (event: any) => {
    setSubType(event.target.value);
  };

  const getOldFilters = async () => {
    const appState = await da.getAppState(databaseContext);
    console.log('getting old filters');

    console.dir(appState);
    console.log(props.setName);
    if (props.setName && appState && appState[props.setName + '_filters']) {
      const oldFilters = appState[props.setName + '_filters'];
      console.log('oldFilters');
      console.dir(oldFilters);
      setFilters({ ...oldFilters });
    }
  };

  useEffect(() => {
    getOldFilters();
  }, []);

  useEffect(() => {
    if (filters !== null) {
      const newState = { [props.setName + '_filters']: filters };
      da.setAppState({ ...newState }, databaseContext);
    }
  }, [filters]);

  const NewRecordStuff = (props) => {
    return (
      <Grid item>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel>Record Type</InputLabel>
          <Select value={formType} onChange={handleFormTypeChange} label="Select Form Type">
            {Object.keys(ActivityType)
              .sort()
              .map((a) => {
                return <MenuItem value={ActivityType[a]}>{ActivityType[a]}</MenuItem>;
              })}
          </Select>
        </FormControl>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel>Record Subtype</InputLabel>
          <Select value={subType} onChange={handleSubTypeChange} label="Select Form Type">
            {Object.keys(ActivitySubtype)
              .sort()
              .map((a) => {
                return <MenuItem value={ActivitySubtype[a]}>{ActivitySubtypeShortLabels[ActivitySubtype[a]]}</MenuItem>;
              })}
          </Select>
        </FormControl>
        <NewRecordRecordPagae type={formType} subType={subType} />
      </Grid>
    );
  };

  return (
    <>
      <Grid sx={{ pt: 2 }} xs={12} item>
        <ActivityGrid
          formType={formType}
          subType={subType}
          setSelectedRecord={props.setSelectedRecord}
          filtersCallBack={setFilters}
          initialFilters={filters}
        />
      </Grid>
    </>
  );
};

export default ActivitiesList2;
