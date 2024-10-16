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
import { useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDispatch } from 'react-redux';
import { ACTIVITY_CREATE_REQUEST, CLOSE_NEW_RECORD_MENU } from 'state/actions';
import { ActivitySubtypeRelations, ActivitySubtypeShortLabels } from 'sharedAPI';

import './NewRecordDialog.css';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { useSelector } from 'utils/use_selector';

export interface INewRecordDialog {}

export interface INewRecordDialogState {
  recordCategory: string;
  recordSubtype: string;
  recordType: string;
}

const NewRecordDialog = (props: INewRecordDialog) => {
  const dispatch = useDispatch();

  const history = useHistory();

  const [activityCategorySelectOptions, setActivityCategorySelectOptions] = useState<string[]>([]);
  const [activityTypeSelectOptions, setActivityTypeSelectOptions] = useState([]);
  const [activitySubTypeSelectOptions, setActivitySubTypeSelectOptions] = useState([]);

  const accessRoles = useSelector((state: any) => state.Auth.accessRoles);
  const { newRecordDialogState } = useSelector((state: any) => state.UserSettings);
  const dialogueOpen = useSelector((state: any) => state.UserSettings.newRecordDialogueOpen);
  useSelector((state) => state.Configuration);
  useEffect(() => {
    const categories: string[] = [];
    categories.push('Plant');
    if (accessRoles.some((role: Record<string, any>) => ['frep'].includes(role.role_name))) {
      categories.push('FREP');
    }
    if (accessRoles.some((role: Record<string, any>) => ['mussel_inspection_officer'].includes(role.role_name))) {
      categories.push('Mussels');
    }
    setActivityCategorySelectOptions(categories);
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
    dispatch(UserSettings.setNewRecordDialogueState(value));
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
            label="Select Form Type"
          >
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
            label="Select Form Type"
          >
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
            label="Select Form Type"
          >
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
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          aria-label="Create Record"
          disabled={newRecordDialogState.recordSubtype === ''}
          onClick={insert_record}
        >
          New Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewRecordDialog;
