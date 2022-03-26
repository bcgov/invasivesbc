import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { DocType } from 'constants/database';
import { DatabaseContext, query, QueryType } from 'contexts/DatabaseContext';
import { useHistory } from 'react-router-dom';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useEffect, useState, useContext } from 'react';
import { ActivitySubtypeShortLabels, ActivityCategory, ActivitySubtypeRelations } from 'constants/activities';
import { generateDBActivityPayload } from 'utils/addActivity';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { AuthStateContext } from 'contexts/authStateContext';
import { useKeycloak } from '@react-keycloak/web';
import { Box, Dialog, DialogActions, DialogTitle, Theme } from '@mui/material';
import { UserRolesAccess } from 'constants/roles';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'center',
    gap: 10,
    paddingBlock: 10,
    paddingInline: 8
  },
  select: {
    minWidth: 200,
    maxWidth: 400,
    width: 'auto'
  },
  syncSuccessful: {
    color: theme.palette.success.main
  },
  dialogActionsBox: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}));

export interface INewRecordDialog {
  dialogOpen: boolean;
  handleDialogClose: () => void;
}

const NewRecordDialog = (props: INewRecordDialog) => {
  const classes = useStyles();
  const dataAccess = useDataAccess();
  const history = useHistory();
  const { keycloak } = useKeycloak();

  const databaseContext = useContext(DatabaseContext);
  const authStateContext = useContext(AuthStateContext);

  const { userInfo, userRoles } = authStateContext;

  const [activityCategory, setActivityCategory] = useState('');
  const [activityType, setActivityType] = useState('');
  const [activitySubType, setActivitySubType] = useState('');

  const [activityCategorySelectOptions, setActivityCategorySelectOptions] = useState([]);
  const [activityTypeSelectOptions, setActivityTypeSelectOptions] = useState([]);
  const [activitySubTypeSelectOptions, setActivitySubTypeSelectOptions] = useState([]);

  useEffect(() => {
    if (!userRoles || !userRoles?.length || userRoles?.length < 1) {
      throw new Error('Something went wrong');
    }
    let userAccessDict = {};

    userRoles.forEach((role) => {
      if (Object.keys(userAccessDict).includes(userAccessDict[UserRolesAccess[role.role_name]])) {
        return;
      } else {
        userAccessDict[UserRolesAccess[role.role_name]] = true;
      }
    });

    const categories = [];
    if (userAccessDict['both']) {
      Object.keys(ActivityCategory).forEach((key) => {
        categories.push(ActivityCategory[key]);
      });
    } else if (userAccessDict['animal']) {
      Object.keys(ActivityCategory).forEach((key) => {
        if (key !== 'Plant') categories.push(ActivityCategory[key]);
      });
    } else if (userAccessDict['plant']) {
      Object.keys(ActivityCategory).forEach((key) => {
        if (key !== 'Animal') categories.push(ActivityCategory[key]);
      });
    }
    setActivityCategorySelectOptions(categories);

    const cachedCategory = dataAccess.getAppState()?.newActivityChoices?.category || undefined;

    if (!cachedCategory) {
      setActivityCategory('');
    } else {
      setActivityCategory(cachedCategory);
    }
  }, []);

  useEffect(() => {
    if (!activityCategory) {
      setActivityTypeSelectOptions([]);
      setActivityType('');
    } else {
      const types = [];
      console.log(activityCategory);
      Object.keys(ActivitySubtypeRelations[activityCategory]).forEach((key) => {
        types.push(key);
      });
      setActivityTypeSelectOptions(types);
      const cachedType = dataAccess.getAppState()?.newActivityChoices?.type || undefined;
      if (!cachedType) {
        setActivityType('');
      } else {
        setActivityType(cachedType);
      }
    }
  }, [activityCategory]);

  useEffect(() => {
    if (!activityType || !activityCategory) {
      setActivitySubTypeSelectOptions([]);
      setActivitySubType('');
    } else {
      const subTypes = ActivitySubtypeRelations[activityCategory][activityType];
      console.log(subTypes);
      setActivitySubTypeSelectOptions(subTypes);

      const cachedSubType = dataAccess.getAppState()?.newActivityChoices?.subType || undefined;

      if (!cachedSubType) {
        setActivitySubType('');
      } else {
        setActivitySubType(cachedSubType);
      }
    }
  }, [activityType]);

  const insert_record = async () => {
    if (!activityType || !activityCategory || !activitySubType) {
      return;
    }
    const dbActivity = generateDBActivityPayload({}, null, activityType, activitySubType);
    dbActivity.created_by = userInfo?.preferred_username;
    dbActivity.user_role = userRoles?.map((role) => role.role_id);
    await dataAccess.createActivity(dbActivity, databaseContext);
    dbActivity.created_by = (userInfo as any)?.preferred_username;
    try {
      await dataAccess.createActivity(dbActivity, databaseContext);
      await dataAccess.setAppState(
        {
          activeActivity: dbActivity.activity_id,
          newActivityChoices: {
            category: activityCategory,
            type: activityType,
            subType: activitySubType
          }
        },
        databaseContext
      );
    } catch (e) {
      console.log('unable to http ');
      console.log(e);
    }
    //return dbActivity.activity_id;
    console.log('APPSTATE', await dataAccess.getAppState());
    setTimeout(() => {
      history.push({ pathname: `/home/activity` });
    }, 1000);
    props.handleDialogClose();
  };

  const handleActivityCategoryChange = (event: any) => {
    setActivityCategory(event.target.value);
  };

  const handleActivityTypeChange = (event: any) => {
    setActivityType(event.target.value);
  };

  const handleActivitySubTypeChange = (event: any) => {
    setActivitySubType(event.target.value);
  };

  console.log(props);

  return (
    <Dialog open={props.dialogOpen}>
      <DialogTitle>Create New Record</DialogTitle>

      <Box className={classes.formContainer}>
        <FormControl>
          <InputLabel>Record Category</InputLabel>
          <Select
            className={classes.select}
            value={activityCategory}
            onChange={handleActivityCategoryChange}
            label="Select Form Type">
            {activityCategorySelectOptions.map((option) => (
              <MenuItem key={Math.random()} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <KeyboardArrowDownIcon />
        <FormControl>
          <InputLabel>Record Type</InputLabel>
          <Select
            disabled={activityCategory === ''}
            className={classes.select}
            value={activityType}
            onChange={handleActivityTypeChange}
            label="Select Form Type">
            {activityTypeSelectOptions.map((option) => (
              <MenuItem key={Math.random()} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <KeyboardArrowDownIcon />
        <FormControl>
          <InputLabel>Record Sub-Type</InputLabel>
          <Select
            disabled={activityType === ''}
            className={classes.select}
            value={activitySubType}
            onChange={handleActivitySubTypeChange}
            label="Select Form Type">
            {activitySubTypeSelectOptions.map((option) => (
              <MenuItem key={Math.random()} value={option}>
                {ActivitySubtypeShortLabels[option]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DialogActions className={classes.dialogActionsBox}>
        <Button
          onClick={() => {
            props.handleDialogClose();
          }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          aria-label="Create Record"
          disabled={activitySubType === ''}
          onClick={insert_record}>
          New Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewRecordDialog;
