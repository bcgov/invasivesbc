import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDispatch, useSelector } from 'react-redux';
import {
  ACTIVITY_CREATE_REQUEST,
  CLOSE_NEW_RECORD_MENU,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST
} from 'state/actions';
import { ActivitySubtypeRelations, ActivitySubtypeShortLabels } from 'sharedAPI';

import './NewRecordDialog.css';
import FormContainer from './Activity/form/FormContainer';

export interface INewRecordDialog {}

export interface INewRecordDialogState {
  recordCategory: string;
  recordSubtype: string;
  recordType: string;
}

const NewRecordDialog = (props: INewRecordDialog) => {
  const dispatch = useDispatch();

  const history = useHistory();

  const [activityCategorySelectOptions, setActivityCategorySelectOptions] = useState([]);
  const [activityTypeSelectOptions, setActivityTypeSelectOptions] = useState([]);
  const [activitySubTypeSelectOptions, setActivitySubTypeSelectOptions] = useState([]);

  const accessRoles = useSelector((state: any) => state.Auth.accessRoles);
  const { newRecordDialogState } = useSelector((state: any) => state.UserSettings);
  const dialogueOpen = useSelector((state: any) => state.UserSettings.newRecordDialogueOpen);

  useEffect(() => {
    const categories = [];
    categories.push('Plant');
    if (accessRoles.some((role: Record<string, any>) => role.role_name === 'frep')) {
      categories.push('FREP');
    }
    if (accessRoles.some((role: Record<string, any>) => role.role_name === 'mussel_inspection_officer' || role.role_name === 'master_administrator')) {
      categories.push('Mussels');
    }
    setActivityCategorySelectOptions(categories);
    // TODO: Update this to cache for mobile as well
    const cachedDialogState = localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE');
    const cachedCategory =
      cachedDialogState && JSON.parse(cachedDialogState).recordCategory
        ? JSON.parse(cachedDialogState).recordCategory
        : '';
    const cachedType =
      cachedDialogState && JSON.parse(cachedDialogState).recordType ? JSON.parse(cachedDialogState).recordType : '';
    const cachedSubtype =
      cachedDialogState && JSON.parse(cachedDialogState).recordSubtype
        ? JSON.parse(cachedDialogState).recordSubtype
        : '';

    setNewRecordDialogState({
      ...newRecordDialogState,
      recordCategory: cachedCategory,
      recordType: cachedType,
      recordSubtype: cachedSubtype
    });
  }, [accessRoles]);

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
    history.push('/Records/Activity:/form');
  };

  const setNewRecordDialogState = (value: INewRecordDialogState) => {
    dispatch({ type: USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST, payload: value });
  };

  const handleRecordCategoryChange = (event: any) => {
    setNewRecordDialogState({
      ...newRecordDialogState,
      recordCategory: event.target.value,
      recordType: '',
      recordSubtype: ''
    });
  };

  const handleRecordTypeChange = (event: any) => {
    setNewRecordDialogState({ ...newRecordDialogState, recordType: event.target.value, recordSubtype: '' });
  };

  const handleRecordSubtypeChange = (event: any) => {
    setNewRecordDialogState({ ...newRecordDialogState, recordSubtype: event.target.value });
  };

  return (
    <Dialog open={dialogueOpen || false} id="new_record_dialog">
      <DialogTitle>Create New Record</DialogTitle>

      <Box className={'vertical_grid content'}>
        <FormControl>
          <InputLabel>Record Category</InputLabel>
          <Select
            value={newRecordDialogState.recordCategory}
            IconComponent={KeyboardArrowDownIcon}
            onChange={handleRecordCategoryChange}
            label="Select Form Type">
            {activityCategorySelectOptions.map((option) => (
              <MenuItem key={Math.random()} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Record Type</InputLabel>
          <Select
            disabled={newRecordDialogState.recordCategory === ''}
            value={newRecordDialogState.recordType}
            onChange={handleRecordTypeChange}
            IconComponent={KeyboardArrowDownIcon}
            label="Select Form Type">
            {activityTypeSelectOptions.map((option) => (
              <MenuItem key={Math.random()} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Record Sub-Type</InputLabel>
          <Select
            disabled={newRecordDialogState.recordType === ''}
            value={newRecordDialogState.recordSubtype}
            onChange={handleRecordSubtypeChange}
            IconComponent={KeyboardArrowDownIcon}
            label="Select Form Type">
            {activitySubTypeSelectOptions.map((option) => (
              <MenuItem key={Math.random()} value={option}>
                {ActivitySubtypeShortLabels[option]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DialogActions>
        <Button
          onClick={() => {
            dispatch({ type: CLOSE_NEW_RECORD_MENU });
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
