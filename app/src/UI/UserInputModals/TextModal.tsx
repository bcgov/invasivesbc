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
import { TextModalInterface } from 'interfaces/prompt-interfaces';
import { closeModal } from 'utils/userPrompts';

const TextModal = ({
  callback,
  prompt,
  regex,
  regexErrorText,
  id,
  title,
  min,
  max,
  confirmText,
  cancelText,
  selectOptions,
  label
}: TextModalInterface) => {
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
      closeModal(id);
    }
  };

  return (
    <Modal open={true} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
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
          <Button onClick={closeModal.bind(this, id)}>{cancelText || 'Cancel'}</Button>
          <Button onClick={handleConfirmation}>{confirmText || 'Confirm'}</Button>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default TextModal;
