import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React from 'react';

export interface IWarningDialog {
  dialogTitle?: String;
  dialogContentText?: String;
  dialogOpen?: boolean;
  dialogActions?: IDialogAction[];
}

interface IDialogAction {
  actionName: String;
  actionOnClick: () => void;
  autoFocus?: boolean;
}

export const WarningDialog = (props: IWarningDialog) => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(props.dialogOpen || false);
  }, [props.dialogOpen]);

  return (
    <Dialog open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{props.dialogTitle}</DialogTitle>
      {props.dialogContentText && (
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{props.dialogContentText}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        {props.dialogActions?.map((action) => {
          return (
            <Button
              onClick={action.actionOnClick}
              color="primary"
              autoFocus={action.autoFocus ? action.autoFocus : false}>
              {action.actionName}
            </Button>
          );
        })}
      </DialogActions>
    </Dialog>
  );
};
