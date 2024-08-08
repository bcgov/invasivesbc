import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Modal,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import './UserInputModals.css';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

/**
 * @type {Props} Confirmation Modal Prompts
 * @property {function} callback Function to trigger on user confirmation
 * @property {string} cancelText Text override for 'Cancel' button text
 * @property {string} confirmText Text override for 'Confirm' button text
 * @property {function} closeModal Handler for closing modal after response
 * @property {string} label Override label for user input field
 * @property {number} max
 * @property {number} min
 * @property {boolean} open state variable for modal opening
 * @property {number[]} selectOptions set of numbers user can select
 * @property {string} title Title for modal
 */
type Props = {
  callback: () => void;
  cancelText?: string;
  closeModal: () => void;
  confirmText?: string;
  label?: string;
  max?: Date;
  min?: Date;
  open: boolean;
  prompt: string[] | string;
  title: string;
};
const DateModal = ({ open, callback, closeModal, prompt, title, confirmText, cancelText, min, max, label }: Props) => {
  const [userDate, setUserDate] = useState<Dayjs>(dayjs());
  const [validationError, setValidationError] = useState<string>('');
  /**
   * @desc change handler for select menu
   */
  const handleChange = (value: Dayjs) => {
    setUserDate(value);
    validateUserInput();
  };
  /**
   * @desc Validate number input against supplied props.
   *       Has to explicitly check if undefined as 0 is falsey.
   * @returns numbers pass validation, or true if none supplied.
   */
  const validateUserInput = (): boolean => {
    const currDate = userDate.toDate();
    let error = '';
    if (min && max && !(min <= currDate && currDate <= max)) {
      error = `Date needs to occur between ${min.toLocaleDateString()} and ${max.toLocaleDateString()}`;
    } else if (min && !(min <= currDate)) {
      error = `Date needs to occur on or after ${min.toLocaleDateString()}`;
    } else if (max && !(currDate <= max)) {
      error = `Date needs to occur on or before ${max.toLocaleDateString()}`;
    }
    setValidationError(error);
    return error === '';
  };

  const handleConfirmation = () => {
    const inputIsValid = validateUserInput();
    if (inputIsValid) {
      callback();
      closeModal();
    }
  };
  return (
    <Modal open={open} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box id="confirmationModal">
        <DialogTitle className="modalTitle">{title}</DialogTitle>
        <Divider />
        <DialogContent>
          {Array.isArray(prompt) ? (
            prompt.map((item, index) => <Typography key={index}>{item}</Typography>)
          ) : (
            <Typography>{prompt}</Typography>
          )}
        </DialogContent>
        <FormControl className="inputCont">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={label || 'Enter date of event'}
              value={userDate}
              onChange={(newVal) => newVal && handleChange(newVal)}
            />
            <FormHelperText error={!!validationError}>{validationError}</FormHelperText>
          </LocalizationProvider>
        </FormControl>
        <Divider />
        <DialogActions>
          <Button onClick={closeModal}>{cancelText || 'Cancel'}</Button>
          <Button onClick={handleConfirmation}>{confirmText || 'Confirm'}</Button>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default DateModal;
