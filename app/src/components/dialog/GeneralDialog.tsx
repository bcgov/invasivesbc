import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React, { ReactNode } from 'react';

export interface IGeneralDialog {
  children?: ReactNode;
  dialogTitle: String;
  dialogContentText?: String;
  dialogOpen: boolean;
  dialogActions: IDialogAction[];
}

interface IDialogAction {
  actionName: String;
  children?: any;
  usesChildren?: boolean;
  actionOnClick: () => void;
  autoFocus?: boolean;
}

export const GeneralDialog = (props: IGeneralDialog) => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(props.dialogOpen);
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
        {props.dialogActions.map((action) => {
          {
            return action.usesChildren ? (
              action.children
            ) : (
              <Button
                onClick={action.actionOnClick}
                color="primary"
                autoFocus={action.autoFocus ? action.autoFocus : false}>
                {action.actionName}
              </Button>
            );
          }
        })}
      </DialogActions>
      {props.children}
    </Dialog>
  );
};
