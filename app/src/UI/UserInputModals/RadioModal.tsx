import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import './UserInputModals.css';
import { RadioModalInterface, ReduxPayload } from 'interfaces/prompt-interfaces';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ChangeEvent, useState } from 'react';
import Prompt from 'state/actions/prompts/Prompt';

/**
 * @desc Customizable Input Modal for collecting boolean responses from a user.
 */
const RadioModal = ({
  callback,
  disableCancel,
  id,
  prompt,
  title,
  confirmText,
  cancelText,
  options,
  label
}: RadioModalInterface) => {
  const [userInput, setUserInput] = useState<number | string>('');
  const dispatch = useDispatch();
  const handleRedux = (redux: ReduxPayload[]) => {
    for (const action of redux) {
      dispatch(action as UnknownAction);
    }
  };
  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (typeof options[0] === 'number') {
      setUserInput(parseFloat(evt.target.value));
    } else {
      setUserInput(evt.target.value);
    }
  };
  const handleClose = () => {
    dispatch(Prompt.closeOne(id!));
  };
  const handleConfirmation = () => {
    handleRedux(callback(userInput) ?? []);
    handleClose();
  };
  return (
    <Modal open={true} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box id="confirmationModal">
        <DialogTitle className="modalTitle">{title}</DialogTitle>
        <Divider />
        <DialogContent>
          {typeof prompt === typeof [] ? (
            (prompt as string[]).map((item) => (
              <Typography key={item} sx={{ my: 1 }}>
                {item}
              </Typography>
            ))
          ) : (
            <Typography>{prompt}</Typography>
          )}
          <FormControl sx={{ pt: 2 }}>
            <FormLabel id="user-options-form-group">{label ?? 'Select from the available options:'}</FormLabel>
            <RadioGroup
              aria-labelledby="user-options-form-group"
              value={userInput}
              onChange={handleChange}
              name="user-options-group"
            >
              {options.map((item: number | string) => (
                <FormControlLabel key={item} value={item} control={<Radio />} label={item} />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions>
          {!disableCancel && <Button onClick={handleClose}>{cancelText ?? 'Cancel'}</Button>}
          <Button onClick={handleConfirmation} disabled={!(options as any[]).includes(userInput)}>
            {confirmText ?? 'Confirm'}
          </Button>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default RadioModal;
