import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  MenuItem,
  Modal,
  TextField,
  Typography
} from '@mui/material';
import './UserInputModals.css';
import { useState } from 'react';

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
 * @property {string[] | string} prompt Main text body, Can use array to handle multiple paragraphs
 * @property {number[]} selectOptions set of numbers user can select
 * @property {string} title Title for modal
 */
type Props = {
  callback: () => void;
  cancelText?: string;
  closeModal: () => void;
  confirmText?: string;
  label?: string;
  max?: number;
  min?: number;
  open: boolean;
  prompt: string[] | string;
  selectOptions?: number[];
  title: string;
};
const NumberModal = ({
  open,
  callback,
  closeModal,
  prompt,
  title,
  confirmText,
  cancelText,
  min,
  max,
  selectOptions,
  label
}: Props) => {
  const [userNumber, setUserNumber] = useState<number>(0);
  const [validationError, setValidationError] = useState<string>('');
  /**
   * @desc change handler for select menu
   */
  const handleChange = (value: string) => {
    setUserNumber(parseInt(value));
    validateUserInput();
  };
  /**
   * @desc Validate number input against supplied props.
   *       Has to explicitly check if undefined as 0 is falsey.
   * @returns numbers pass validation, or true if none supplied.
   */
  const validateUserInput = (): boolean => {
    let error: string = '';
    if (selectOptions && !selectOptions.includes(userNumber)) {
      error = 'Must select a value from the select menu';
    } else if (min !== undefined && max !== undefined && !(min <= userNumber && userNumber <= max)) {
      error = `Number must be between (${min}) and (${max})`;
    } else if (min !== undefined && !(min <= userNumber)) {
      error = `Number must be greater than or equal to (${min})`;
    } else if (max !== undefined && !(userNumber <= max)) {
      error = `Number must be less than or equal to (${max})`;
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
          {selectOptions ? (
            <>
              <TextField
                error={!!validationError}
                helperText={validationError}
                label={label || 'Select a number'}
                onBlur={validateUserInput}
                onChange={(evt) => handleChange(evt.target.value)}
                select
                value={userNumber?.toString()}
              >
                {selectOptions.map((item) => (
                  <MenuItem value={item}>{item}</MenuItem>
                ))}
              </TextField>
            </>
          ) : (
            <TextField
              aria-label="Number Input"
              error={!!validationError}
              helperText={validationError}
              inputProps={{ type: 'number' }}
              label={label || 'Select a value'}
              onBlur={validateUserInput}
              onChange={(evt) => handleChange(evt.currentTarget.value)}
              value={userNumber}
            />
          )}
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

export default NumberModal;
