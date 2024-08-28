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
  const [userNumber, setUserNumber] = useState<string>();
  const [validationError, setValidationError] = useState<string>('');
  const dispatch = useDispatch();
  const handleRedux = (redux: ReduxPayload[]) => {
    for (const action of redux) {
      dispatch(action as UnknownAction);
    }
  };
  const handleConfirmation = () => {
    const inputIsValid = validateUserInput(parseFloat(userNumber!));
    if (inputIsValid) {
      const responseNum = parseFloat(userNumber!);
      handleRedux(callback(responseNum) ?? []);
      handleClose();
    }
  };
  /**
   * @desc change handler user input. Uses regex validation for updating input.
   */
  const handleChange = (value: string) => {
    const floatReg = /^[+-]?\d*(?:[.,]\d*)?$/;
    const intReg = /^[+-]?\d*$/;
    const regex = acceptFloats ? floatReg : intReg;
    if (!value) {
      setUserNumber(undefined);
    } else if (regex.test(value)) {
      setUserNumber(value);
    }
    validateUserInput(parseFloat(value));
  };

  const handleClose = () => {
    dispatch(closeModal(id!));
  };
  /**
   * @desc Validate number input against supplied props.
   *       Has to explicitly check if undefined as 0 is falsey.
   * @returns numbers pass validation, defaults true if no validators supplied.
   */
  const validateUserInput = (userNumber: number): boolean => {
    let error: string = '';
    if (isNaN(userNumber)) {
      error = 'Value cannot be blank.';
    } else if (selectOptions && !selectOptions.includes(userNumber)) {
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
              onBlur={() => validateUserInput(parseFloat(userNumber!))}
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
              label={label ?? 'Enter response'}
              onChange={(evt) => handleChange(evt.currentTarget.value)}
              value={userNumber ?? ''}
            />
          )}
        </FormControl>
        <Divider />
        <DialogActions>
          {!disableCancel && <Button onClick={handleClose}>{cancelText ?? 'Cancel'}</Button>}
          <Button onClick={handleConfirmation} disabled={validationError !== '' || !userNumber}>
            {confirmText ?? 'Confirm'}
          </Button>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default NumberModal;
