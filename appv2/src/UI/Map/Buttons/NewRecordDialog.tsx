import makeStyles from '@mui/styles/makeStyles';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Theme
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDispatch, useSelector } from 'react-redux';
import { ACTIVITY_CREATE_REQUEST, CLOSE_NEW_RECORD_MENU, USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST } from 'state/actions';
import { ActivitySubtypeRelations, ActivitySubtypeShortLabels } from 'sharedAPI';

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
    color: 'green'
  },
  dialogActionsBox: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}));

export interface INewRecordDialog {
//  dialogOpen: boolean;
 // handleDialogClose: () => void;
}

export interface INewRecordDialogState {
  recordCategory: string;
  recordSubtype: string;
  recordType: string;
}

const NewRecordDialog = (props: INewRecordDialog) => {
  const dispatch = useDispatch();

  const classes = useStyles();
  const history = useHistory();


  const [activityCategorySelectOptions, setActivityCategorySelectOptions] = useState([]);
  const [activityTypeSelectOptions, setActivityTypeSelectOptions] = useState([]);
  const [activitySubTypeSelectOptions, setActivitySubTypeSelectOptions] = useState([]);

  const  accessRoles = useSelector((state: any) => state.Auth.accessRoles);
  const { newRecordDialogState } = useSelector((state: any) => state.UserSettings);
  const dialogueOpen = useSelector((state: any) => state.UserSettings.newRecordDialogueOpen)

  useEffect(() => {
    const categories = [];
      categories.push('Plant');
    if (
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
    // TODO: Update this to cache for mobile as well
    const cachedDialogState = localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE');
    const cachedCategory = (cachedDialogState && JSON.parse(cachedDialogState).recordCategory) ?
      JSON.parse(cachedDialogState).recordCategory :
      '';
    const cachedType = (cachedDialogState && JSON.parse(cachedDialogState).recordType) ?
      JSON.parse(cachedDialogState).recordType :
      '';
    const cachedSubtype = (cachedDialogState && JSON.parse(cachedDialogState).recordSubtype) ?
      JSON.parse(cachedDialogState).recordSubtype :
      '';

    setNewRecordDialogState({
      ...newRecordDialogState,
      recordCategory: cachedCategory,
      recordType: cachedType,
      recordSubtype: cachedSubtype
    });
  }, []);

  useEffect(() => {
    if (!newRecordDialogState.recordCategory) {
      setActivityTypeSelectOptions([]);
    } else {
      const types = [];
      Object.keys(ActivitySubtypeRelations[newRecordDialogState.recordCategory]).forEach((key) => {
        types.push(key);
      });
      setActivityTypeSelectOptions(types);
    }
  }, [newRecordDialogState.recordCategory]);

  useEffect(() => {
    if (!newRecordDialogState.recordType || !newRecordDialogState.recordCategory) {
      setActivitySubTypeSelectOptions([]);
    } else {
      const subTypes = ActivitySubtypeRelations[newRecordDialogState.recordCategory][newRecordDialogState.recordType];
      setActivitySubTypeSelectOptions(subTypes);
    }
  }, [newRecordDialogState.recordType]);

  const insert_record = async () => {


    dispatch({
      type: ACTIVITY_CREATE_REQUEST,
      payload: { type: newRecordDialogState.recordType, subType: newRecordDialogState.recordSubtype }
    });

  };

  const setNewRecordDialogState = (value: INewRecordDialogState) => {
    dispatch({ type: USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST, payload: value });
  };

  const handleRecordCategoryChange = (event: any) => {
    setNewRecordDialogState({ ...newRecordDialogState, recordCategory: event.target.value, recordType: '', recordSubtype: '' });
  };

  const handleRecordTypeChange = (event: any) => {
    setNewRecordDialogState({ ...newRecordDialogState, recordType: event.target.value, recordSubtype: '' });
  };

  const handleRecordSubtypeChange = (event: any) => {
    setNewRecordDialogState({ ...newRecordDialogState, recordSubtype: event.target.value });
  };

  return (
    <Dialog open={dialogueOpen}>
      <DialogTitle>Create New Record</DialogTitle>

      <Box className={classes.formContainer}>
        <FormControl>
          <InputLabel>Record Category</InputLabel>
          <Select
            className={classes.select}
            value={newRecordDialogState.recordCategory}
            onChange={handleRecordCategoryChange}
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
            disabled={newRecordDialogState.recordCategory === ''}
            className={classes.select}
            value={newRecordDialogState.recordType}
            onChange={handleRecordTypeChange}
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
            disabled={newRecordDialogState.recordType === ''}
            className={classes.select}
            value={newRecordDialogState.recordSubtype}
            onChange={handleRecordSubtypeChange}
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
          //  props.handleDialogClose();
          }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          aria-label="Create Record"
          disabled={newRecordDialogState.recordSubtype === ''}
          onClick={insert_record}>
          New Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewRecordDialog;
