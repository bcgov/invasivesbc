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
import { Box, Dialog, DialogActions, DialogTitle, Theme } from '@mui/material';
import { UserRolesAccess } from 'constants/roles';
import { useSelector } from '../../../state/utilities/use_selector';
import { selectAuth } from '../../../state/reducers/auth';
import { useDispatch } from 'react-redux';
import { USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST, ACTIVITY_CREATE_REQUEST } from 'state/actions';

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
  const dispatch = useDispatch();

  const classes = useStyles();
  const dataAccess = useDataAccess();
  const history = useHistory();

  const databaseContext = useContext(DatabaseContext);

  const [activityCategory, setActivityCategory] = useState('');
  const [activityType, setActivityType] = useState('');
  const [activitySubType, setActivitySubType] = useState('');

  const [activityCategorySelectOptions, setActivityCategorySelectOptions] = useState([]);
  const [activityTypeSelectOptions, setActivityTypeSelectOptions] = useState([]);
  const [activitySubTypeSelectOptions, setActivitySubTypeSelectOptions] = useState([]);

  const { displayName,  accessRoles ,username} = useSelector(selectAuth);

  useEffect(() => {
    const categories = [];
    if (
      accessRoles.some((role) => {
        return role.role_name.includes('plant');
      })
    ) {
      categories.push('Plant');
    } else if (
      accessRoles.some((role) => {
        return role.role_name === 'frep';
      })
    ) {
      categories.push('FREP');
    }
    // let userAccessDict = {};

    // accessRoles
    //   .map((r) => r.role_name)
    //   .forEach((role) => {
    //     if (Object.keys(userAccessDict).includes(userAccessDict[UserRolesAccess[role]])) {
    //       return;
    //     } else {
    //       userAccessDict[UserRolesAccess[role]] = true;
    //     }x`
    //   });

    // if (userAccessDict['both']) {
    //   Object.keys(ActivityCategory).forEach((key) => {
    //     categories.push(ActivityCategory[key]);
    //   });
    // } else if (userAccessDict['animals']) {
    //   Object.keys(ActivityCategory).forEach((key) => {
    //     if (key !== 'Plant') categories.push(ActivityCategory[key]);
    //   });
    // } else if (userAccessDict['plants']) {
    //   Object.keys(ActivityCategory).forEach((key) => {
    //     if (key !== 'Animal') categories.push(ActivityCategory[key]);
    //   });
    // }

    setActivityCategorySelectOptions(categories);

    const fetchAndSetCategory = async () => {
      const result = await dataAccess.getAppState();
      const cachedCategory = result?.newActivityChoices?.category || undefined;

      if (!cachedCategory) {
        setActivityCategory('');
      } else {
        setActivityCategory(cachedCategory);
      }
    }
    fetchAndSetCategory();
  }, []);

  useEffect(() => {
    if (!activityCategory) {
      setActivityTypeSelectOptions([]);
      setActivityType('');
    } else {
      const types = [];
      Object.keys(ActivitySubtypeRelations[activityCategory]).forEach((key) => {
        types.push(key);
      });
      setActivityTypeSelectOptions(types);

      const fetchAndCacheType = async () => {
        const result = await dataAccess.getAppState();
        const cachedType = result?.newActivityChoices?.type || undefined;
        if (!cachedType) {
          setActivityType('');
        } else {
          setActivityType(cachedType);
        }
      }
      fetchAndCacheType();
    }
  }, [activityCategory]);

  useEffect(() => {
    if (!activityType || !activityCategory) {
      setActivitySubTypeSelectOptions([]);
      setActivitySubType('');
    } else {
      const subTypes = ActivitySubtypeRelations[activityCategory][activityType];
      setActivitySubTypeSelectOptions(subTypes);

      const fetchAndCacheSubtype = async () => {
        const result = await dataAccess.getAppState();
        const cachedSubType = result?.newActivityChoices?.subType || undefined;

        if (!cachedSubType) {
          setActivitySubType('');
        } else {
          setActivitySubType(cachedSubType);
        }
      }
      fetchAndCacheSubtype();
    }
  }, [activityType]);

  const insert_record = async () => {
    // TODO: fix
    if (!activityType || !activityCategory || !activitySubType) {
      return;
    }
    const dbActivity = generateDBActivityPayload({}, null, activityType, activitySubType);
    dbActivity.created_by = username
    dbActivity.user_role = accessRoles.map((role) => role.role_id);
    await dataAccess.createActivity(dbActivity, databaseContext);

    dispatch({ type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
              payload: { activeActivity: dbActivity.activity_id }})

    await dataAccess.setAppState({
      activeActivity: dbActivity.activity_id,
      newActivityChoices: {
        category: activityCategory,
        type: activityType,
        subType: activitySubType
      }
    });

    //return dbActivity.activity_id;
    */

    dispatch({ type: ACTIVITY_CREATE_REQUEST,
      payload: { type: activityType, subType: activitySubType}
    })

    setTimeout(() => {
      history.push({ pathname: `/home/activity` });
    }, 10000);
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
