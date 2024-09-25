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
import { ReduxPayload, TextModalInterface } from 'interfaces/prompt-interfaces';
import { closeModal } from 'state/actions/userPrompts/userPrompts';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';

const TextModal = ({
  callback,
  disableCancel,
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
  const dispatch = useDispatch();

  const handleChange = (value: string) => setUserResponse(value);
  const handleClose = () => dispatch(closeModal(id!));
  const handleRedux = (redux: ReduxPayload[]) => {
    for (const action of redux) {
      dispatch(action as UnknownAction);
    }
  };

  const handleConfirmation = () => {
    if (validateUserInput()) {
      handleRedux(callback(userResponse) ?? []);
      handleClose();
    }
  };
  const validateUserInput = (): boolean => {
    let error = '';
    let resLength = userResponse.length;
    if (selectOptions?.length && !selectOptions.includes(userResponse)) {
      error = 'You need to select an option from the menu';
    } else if (regex && !regex.test(userResponse)) {
      error = regexErrorText ?? `Response does not match pattern ${regex}`;
    } else if (min !== undefined && max !== undefined && (resLength < min || max < resLength)) {
      error = `Response must be between (${min}) and (${max}) characters in length`;
    } else if (min !== undefined && resLength < min) {
      error = `Response must be greater than or equal to (${max}) characters in length`;
    } else if (max !== undefined && max < resLength) {
      error = `Response must be less than or equal to (${max}) characters in length`;
    }
    setValidationError(error);
    return error === '';
  };

  return (
    <Modal open={true} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
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
              label={label ?? 'Select a response from the list'}
              onBlur={validateUserInput}
              onChange={(evt) => handleChange(evt.target.value)}
              select
              value={userResponse}
            >
              {selectOptions.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              aria-label="Text Input"
              error={!!validationError}
              helperText={validationError}
              label={label ?? 'Enter your response'}
              onBlur={validateUserInput}
              onChange={(evt) => handleChange(evt.currentTarget.value)}
              value={userResponse}
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

export default TextModal;
