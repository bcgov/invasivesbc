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
import { CLOSE_NEW_RECORD_MENU } from 'state/actions';
import { ActivitySubtype, ActivitySubtypeRelations, ActivitySubtypeShortLabels } from 'sharedAPI';

import './NewRecordDialog.css';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { useSelector } from 'utils/use_selector';
import Activity from 'state/actions/activity/Activity';
import { ActivitySubtypePermissionCategory, EPermission_Category } from 'sharedAPI/src/interfaces/IPermission';

export interface INewRecordDialogState {
  recordCategory: string;
  recordSubtype: string;
  recordType: string;
}

const NewRecordDialog = () => {
  const dispatch = useDispatch();

  const history = useHistory();

  const [activityCategorySelectOptions, setActivityCategorySelectOptions] = useState<string[]>([]);
  const [activityTypeSelectOptions, setActivityTypeSelectOptions] = useState<string[]>([]);
  const [activitySubTypeSelectOptions, setActivitySubTypeSelectOptions] = useState<string[]>([]);

  const accessRoles = useSelector((state) => state.Auth.accessRoles);
  const { newRecordDialogState } = useSelector((state) => state.UserSettings);
  const permissions = useSelector((state) => state.Auth.permissions);
  const dialogueOpen = useSelector((state) => state.UserSettings.newRecordDialogueOpen);
  useSelector((state) => state.Configuration);
  useEffect(() => {
    const categories: string[] = [];
    const hasWritePermissionOnPlant = Object.keys(permissions).some(
      (key) => permissions[key].id.includes('PLANT') && permissions[key].can_write
    );

    if (hasWritePermissionOnPlant) {
      categories.push('Plant');
    }
    setActivityCategorySelectOptions(categories);
  }, [accessRoles]);

  useEffect(() => {
    if (!newRecordDialogState.recordCategory) {
      setActivityTypeSelectOptions([]);
    } else {
      const types: string[] = [];
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
      const subtypeOptions: Array<ActivitySubtype> = [];
      const subTypes = ActivitySubtypeRelations[newRecordDialogState.recordCategory][newRecordDialogState.recordType];
      subTypes.forEach((subtype) => {
        const userHasSubtypeWritePermission = ActivitySubtypePermissionCategory[subtype].some(
          (permission: EPermission_Category) =>
            permissions?.[permission]?.can_write && !subtypeOptions.includes(subtype)
        );
        if (userHasSubtypeWritePermission) {
          subtypeOptions.push(subtype);
        }
      });
      setActivitySubTypeSelectOptions(subtypeOptions);
    }
  }, [newRecordDialogState.recordType]);

  const insert_record = async () => {
    dispatch(
      Activity.createReq({ type: newRecordDialogState.recordType, subType: newRecordDialogState.recordSubtype })
    );
    history.push('/Records/Activity:/form');
  };

  const setNewRecordDialogState = (value: INewRecordDialogState) => {
    dispatch(UserSettings.setNewRecordDialogueState(value));
  };

  const handleRecordCategoryChange = (event) => {
    setNewRecordDialogState({
      ...newRecordDialogState,
      recordCategory: event.target.value,
      recordType: '',
      recordSubtype: ''
    });
  };

  const handleRecordTypeChange = (event) => {
    setNewRecordDialogState({ ...newRecordDialogState, recordType: event.target.value, recordSubtype: '' });
  };

  const handleRecordSubtypeChange = (event) => {
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
              <MenuItem key={option} value={option}>
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
              <MenuItem key={option} value={option}>
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
              <MenuItem key={option} value={option}>
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
