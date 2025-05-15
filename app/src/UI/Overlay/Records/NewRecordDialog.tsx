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
import { useSelector } from 'utils/use_selector';
import Activity from 'state/actions/activity/Activity';

export interface INewRecordDialogState {
  recordCategory: string;
  recordSubtype: string;
  recordType: string;
}

const NewRecordDialog = () => {
  const handleClose = () => {
    dispatch({ type: CLOSE_NEW_RECORD_MENU });
  };
  const dispatch = useDispatch();
  const history = useHistory();

  const accessRoles = useSelector((state) => state.Auth.accessRoles);
  const dialogueOpen = useSelector((state) => state.UserSettings.newRecordDialogueOpen);
  const writePrivilege = useSelector((state) => state.Auth.writePrivilege);

  // Options
  const [activityCategorySelectOptions, setActivityCategorySelectOptions] = useState<string[]>([]);
  const [activityTypeSelectOptions, setActivityTypeSelectOptions] = useState<string[]>([]);
  const [activitySubTypeSelectOptions, setActivitySubTypeSelectOptions] = useState<ActivitySubtype[]>([]);

  // Selections
  const [recordType, setRecordType] = useState<string>('');
  const [recordCategory, setRecordCategory] = useState<string>('');
  const [recordSubtype, setRecordSubtype] = useState<string>('');

  useEffect(() => {
    const activityCategories: Array<string> = [];
    const plantSubtypes = Object.values(ActivitySubtypeRelations['Plant']).flatMap((value) => value);
    if (writePrivilege.some((subtype) => plantSubtypes.includes(subtype))) {
      activityCategories.push('Plant');
    }
    setActivityCategorySelectOptions(activityCategories);
  }, [accessRoles]);

  useEffect(() => {
    if (!recordCategory) {
      setActivityTypeSelectOptions([]);
    } else {
      const types: string[] = [];
      Object.keys(ActivitySubtypeRelations[recordCategory]).forEach((key) => {
        types.push(key);
      });
      setActivityTypeSelectOptions(types);
    }
  }, [recordCategory]);

  useEffect(() => {
    if (!recordType || !recordCategory) {
      setActivitySubTypeSelectOptions([]);
    } else {
      const subTypes = ActivitySubtypeRelations[recordCategory][recordType];
      const availableSubTypes = subTypes.filter((subtype) => writePrivilege.includes(subtype));
      setActivitySubTypeSelectOptions(availableSubTypes);
    }
  }, [recordType]);

  const insert_record = async () => {
    dispatch(Activity.createReq({ type: recordType, subType: recordSubtype }));
    history.push('/Records/Activity:/form');
  };

  const handleRecordCategoryChange = (event) => {
    setRecordCategory(event.target.value);
    setRecordType('');
    setRecordSubtype('');
  };

  const handleRecordTypeChange = (event) => {
    setRecordType(event.target.value);
    setRecordSubtype('');
  };

  const handleRecordSubtypeChange = (event) => {
    setRecordSubtype(event.target.value);
  };

  return (
    <Dialog open={dialogueOpen || false} id="new_record_dialog">
      <DialogTitle>Create New Record</DialogTitle>

      <Box className={'vertical_grid content'}>
        <FormControl>
          <InputLabel>Record Category</InputLabel>
          <Select
            value={recordCategory}
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
            disabled={recordCategory === ''}
            value={recordType}
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
            disabled={recordType === ''}
            value={recordSubtype}
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" aria-label="Create Record" disabled={recordSubtype === ''} onClick={insert_record}>
          New Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewRecordDialog;
