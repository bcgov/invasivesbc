import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, Typography } from '@mui/material';
import './UserInputModals.css';
import { ConfirmationModalInterface, ReduxPayload } from 'interfaces/prompt-interfaces';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import Prompt from 'state/actions/prompts/Prompt';

/**
 * @desc Customizable Input Modal for collecting boolean responses from a user.
 */
const ConfirmationModal = ({
  callback,
  disableCancel,
  id,
  prompt,
  title,
  confirmText,
  cancelText
}: ConfirmationModalInterface) => {
  const dispatch = useDispatch();
  const handleRedux = (redux: ReduxPayload[]) => {
    for (const action of redux) {
      dispatch(action as UnknownAction);
    }
  };
  const handleConfirmation = () => {
    handleRedux(callback(true) ?? []);
    dispatch(Prompt.closeOne(id!));
  };
  const handleClose = () => {
    handleRedux(callback(false) ?? []);
    dispatch(Prompt.closeOne(id!));
  };
  return (
    <Modal open={true} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box id="confirmationModal">
        <DialogTitle className="modalTitle">{title}</DialogTitle>
        <Divider />
        <DialogContent>
          {typeof prompt === typeof [] ? (
            (prompt as string[]).map((item) => <Typography key={item}>{item}</Typography>)
          ) : (
            <Typography>{prompt}</Typography>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          {!disableCancel && <Button onClick={handleClose}>{cancelText ?? 'Cancel'}</Button>}
          <Button onClick={handleConfirmation}>{confirmText ?? 'Confirm'}</Button>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
