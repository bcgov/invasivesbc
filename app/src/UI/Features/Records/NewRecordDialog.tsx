import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDispatch } from 'react-redux';
import {
  ActivitySubtype,
  ActivitySubtypeRelations,
  ActivitySubtypesRelations,
  ActivitySubtypes,
  ActivitySubtypesShortLabels
} from 'sharedAPI';
import 'UI/Features/Records/NewRecordDialog.css';
import { useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { useNavigate } from 'react-router';
import FormActions from 'state/actions/activity/FormActions';

export interface INewRecordDialogState {
  recordCategory: string;
  recordSubtype: string;
  recordType: string;
}

const NewRecordDialog = () => {
  const handleClose = () => {
    dispatch(UserSettings.closeNewRecordDialogue());
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const accessRoles = useSelector((state) => state.Auth.accessRoles);
  const open = useSelector((state) => state.UserSettings.newRecordDialogueState.open);
  const mode = useSelector((state) => state.UserSettings.newRecordDialogueState.viewLayout);
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
  }, [accessRoles, writePrivilege]);

  useEffect(() => {
    if (!recordCategory) {
      setActivityTypeSelectOptions([]);
    } else {
      const types: string[] = [];
      Object.keys(ActivitySubtypesRelations[recordCategory]).forEach((key) => {
        types.push(key);
      });
      setActivityTypeSelectOptions(types);
    }
  }, [recordCategory]);

  useEffect(() => {
    if (!recordType || !recordCategory) {
      setActivitySubTypeSelectOptions([]);
    } else {
      const subTypes = ActivitySubtypesRelations[recordCategory][recordType];
      //TODO: Refactor to limit creation logic
      // const availableSubTypes = subTypes.filter((subtype) => writePrivilege.includes(subtype));
      setActivitySubTypeSelectOptions(subTypes);
    }
  }, [recordType]);

  const createNewRecord = async () => {
    if (mode === 'new') {
      dispatch(FormActions.createNewForm(recordSubtype as ActivitySubtypes));
    } else {
      dispatch(FormActions.duplicateForm({ subtype: recordSubtype }));
    }
    navigate('/Records/HookForm');
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
    <Dialog open={!!open} id="new_record_dialog">
      <DialogTitle>Create New Record</DialogTitle>
      {mode === 'duplicate' && <DialogContent>Select activity subtype you want to copy data into</DialogContent>}
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
                {ActivitySubtypesShortLabels[option] ?? option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          aria-label="Create Record"
          disabled={recordSubtype === ''}
          onClick={createNewRecord}
        >
          New Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewRecordDialog;
