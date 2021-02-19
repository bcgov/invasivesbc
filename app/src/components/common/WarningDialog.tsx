import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React from 'react';

interface IWarningDialog {
  isOpen: boolean;
  handleDisagree: Function;
  handleAgree: Function;
  message: string;
  heading: string;
}

const WarningDialog: React.FC<IWarningDialog> = (props) => {
  const { isOpen, heading, message, handleAgree, handleDisagree } = props;

  return (
    <Dialog
      open={isOpen}
      onClose={() => handleDisagree()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{heading}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleDisagree()} color="primary">
          Disagree
        </Button>
        <Button onClick={() => handleAgree()} color="primary" autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarningDialog;
