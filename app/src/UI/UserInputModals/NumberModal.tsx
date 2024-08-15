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
import { NumberModalInterface, ReduxPayload } from 'interfaces/prompt-interfaces';
import { closeModal } from 'utils/userPrompts';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';

const NumberModal = ({
  callback,
  prompt,
  disableCancel,
  title,
  id,
  confirmText,
  cancelText,
  min,
  max,
  selectOptions,
  label,
  acceptFloats
}: NumberModalInterface) => {
  const [userNumber, setUserNumber] = useState<number>(0);
  const [validationError, setValidationError] = useState<string>('');
  const dispatch = useDispatch();
  const handleRedux = (redux: ReduxPayload[]) => {
    for (const action of redux) {
      dispatch(action as UnknownAction);
    }
  };
  const handleConfirmation = () => {
    const inputIsValid = validateUserInput();
    if (inputIsValid) {
      handleRedux(callback(userNumber) ?? []);
      handleClose();
    }
  };
  /**
   * @desc change handler for select menu
   */
  const handleChange = (value: string) => {
    if (value === '') {
      setUserNumber(0);
    } else if (acceptFloats) {
      const result = parseFloat(value);
      if (!isNaN(result)) {
        setUserNumber(result);
      }
    } else {
      const result = parseInt(value);
      if (!isNaN(result)) {
        setUserNumber(result);
      }
    }
    validateUserInput();
  };

  const handleClose = () => {
    dispatch(closeModal(id!));
  };
  /**
   * @desc Validate number input against supplied props.
   *       Has to explicitly check if undefined as 0 is falsey.
   * @returns numbers pass validation, defaults true if no validators supplied.
   */
  const validateUserInput = (): boolean => {
    let error: string = '';
    if (selectOptions && !selectOptions.includes(userNumber)) {
      error = 'Must select a value from the select menu';
    } else if (min !== undefined && max !== undefined && (userNumber < min || max < userNumber)) {
      error = `Number must be between (${min}) and (${max})`;
    } else if (min !== undefined && userNumber < min) {
      error = `Number must be greater than or equal to (${min})`;
    } else if (max !== undefined && max < userNumber) {
      error = `Number must be less than or equal to (${max})`;
    }
    setValidationError(error);
    return error === '';
  };

  return (
    <Modal open aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box id="confirmationModal">
        <DialogTitle className="modalTitle">{title}</DialogTitle>
        <Divider />
        <DialogContent>
          {Array.isArray(prompt) ? (
            prompt.map((item) => <Typography key={item}>{item}</Typography>)
          ) : (
            <Typography>{prompt}</Typography>
          )}
        </DialogContent>
        <FormControl className="inputCont">
          {selectOptions ? (
            <TextField
              error={!!validationError}
              helperText={validationError}
              label={label ?? 'Select a value'}
              onBlur={validateUserInput}
              onChange={(evt) => handleChange(evt.target.value)}
              select
              value={userNumber?.toString()}
            >
              {selectOptions.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              aria-label="Number Input"
              error={!!validationError}
              helperText={validationError}
              inputProps={{ type: 'number' }}
              label={label ?? 'Enter response'}
              onBlur={validateUserInput}
              onChange={(evt) => handleChange(evt.currentTarget.value)}
              value={userNumber}
            />
          )}
        </FormControl>
        <Divider />
        <DialogActions>
          {!disableCancel && <Button onClick={handleClose}>{cancelText ?? 'Cancel'}</Button>}
          <Button onClick={handleConfirmation}>{confirmText ?? 'Confirm'}</Button>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default NumberModal;
