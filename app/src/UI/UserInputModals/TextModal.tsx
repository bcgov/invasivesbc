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
 * @property {function} closeModal Handler for closing modal after response
 * @property {string} confirmText Text override for 'Confirm' button text
 * @property {string} label Override label for user input field
 * @property {number} max Max length of characters for response
 * @property {number} min Min length of characters for response
 * @property {boolean} open state variable for modal opening
 * @property {string[] | string} prompt Main text body, Can use array to handle multiple paragraphs
 * @property {RegExp} regex Regex pattern to validate user input against
 * @property {string} regexErrorText Override error message for regex errors, otherwise shows pattern
 * @property {string[]} selectOptions set of numbers user can select
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
  regex?: RegExp;
  regexErrorText?: string;
  selectOptions?: string[];
  title: string;
};
const TextModal = ({
  open,
  callback,
  closeModal,
  prompt,
  regex,
  regexErrorText,
  title,
  min,
  max,
  confirmText,
  cancelText,
  selectOptions,
  label
}: Props) => {
  const [userResponse, setUserResponse] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  /**
   * @desc change handler for select menu
   */
  const handleChange = (value: string) => {
    setUserResponse(value);
  };

  const validateUserInput = (): boolean => {
    let error = '';
    let resLength = userResponse.length;
    if (selectOptions?.length && !selectOptions.includes(userResponse)) {
      error = 'You need to select an option from the menu';
    } else if (regex && !regex.test(userResponse)) {
      error = regexErrorText || `Response does not match pattern ${regex}`;
    } else if (min !== undefined && max !== undefined && !(min <= resLength && resLength <= max)) {
      error = `Response must be between (${min}) and (${max}) characters in length`;
    } else if (min !== undefined && !(min <= resLength)) {
      error = `Response must be greater than or equal to (${max}) characters in length`;
    } else if (max !== undefined && !(resLength <= max)) {
      error = `Response must be less than or equal to (${max}) characters in length`;
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
                label={label || 'Select a value from the list'}
                onBlur={validateUserInput}
                onChange={(evt) => handleChange(evt.target.value)}
                select
                value={userResponse}
              >
                {selectOptions.map((item) => (
                  <MenuItem value={item}>{item}</MenuItem>
                ))}
              </TextField>
            </>
          ) : (
            <TextField
              aria-label="Text Input"
              error={!!validationError}
              helperText={validationError}
              label={label || 'Select a value'}
              onBlur={validateUserInput}
              onChange={(evt) => handleChange(evt.currentTarget.value)}
              value={userResponse}
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

export default TextModal;
