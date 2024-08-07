import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, Typography } from '@mui/material';
import './UserInputModals.css';

/**
 * @type {Props} Confirmation Modal Prompts
 * @property {function} callback Function to trigger on user confirmation
 * @property {function} closeModal Handler for closing modal after response
 * @property {boolean} open state variable for modal opening
 * @property {string} title Title for modal
 * @property {string[] | string} prompt Main text body, Can use array to handle multiple paragraphs
 * @property {string} cancelText Text override for 'Cancel' button text
 * @property {string} confirmText Text override for 'Confirm' button text
 */
type Props = {
  callback: () => void;
  closeModal: () => void;
  open: boolean;
  title: string;
  prompt: string[] | string;
  cancelText?: string;
  confirmText?: string;
};
const ConfirmationModal = ({ open, callback, closeModal, prompt, title, confirmText, cancelText }: Props) => {
  const handleConfirmation = () => {
    callback();
    closeModal();
  };
  return (
    <Modal open={open} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
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
          <Button onClick={closeModal}>{cancelText || 'Cancel'}</Button>
          <Button onClick={handleConfirmation}>{confirmText || 'Confirm'}</Button>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
