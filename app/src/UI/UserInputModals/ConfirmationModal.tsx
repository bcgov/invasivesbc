import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, Typography } from '@mui/material';
import './UserInputModals.css';
import { ConfirmationModalInterface } from 'interfaces/prompt-interfaces';
import { closeModal } from 'utils/userPrompts';

const ConfirmationModal = ({ callback, id, prompt, title, confirmText, cancelText }: ConfirmationModalInterface) => {
  const handleConfirmation = () => {
    callback();
    closeModal(id);
  };
  return (
    <Modal open={true} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box id="confirmationModal">
        <DialogTitle className="modalTitle">{title}</DialogTitle>
        <Divider />
        <DialogContent>
          {typeof prompt === typeof [] ? (
            (prompt as string[]).map((item, index) => <Typography key={index}>{item}</Typography>)
          ) : (
            <Typography>{prompt}</Typography>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={closeModal.bind(this, id)}>{cancelText || 'Cancel'}</Button>
          <Button onClick={handleConfirmation}>{confirmText || 'Confirm'}</Button>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
