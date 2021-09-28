import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import DoneIcon from '@material-ui/icons/Done';

export interface IProgressDialog {
  dialogTitle: string;
  items: IProgressDialogItem[];
  dialogOpen: boolean;
  error?: boolean;
  done?: boolean;
}

export interface IProgressDialogItem {
  name: string;
  description?: string;
  state: 'complete' | 'error' | 'in_progress' | 'none';
}

export const ProgressDialog = (props: IProgressDialog) => {
  const [open, setOpen] = useState(props.dialogOpen);

  useEffect(() => {
    setOpen(props.dialogOpen);
  }, [props.dialogOpen]);

  return (
    <Dialog open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">
        <Typography variant="h4">
          {props.dialogTitle}
          {props.done && <DoneAllIcon style={{ fill: '#46A44D', marginLeft: 20, marginTop: 5 }} />}
          {props.error && <ErrorIcon style={{ fill: '#54101B', marginLeft: 20, marginTop: 5 }} />}
        </Typography>
      </DialogTitle>
      <List>
        {props.items.map((item) => (
          <ListItem>
            <ListItemAvatar>
              <Box style={{ position: 'relative', width: 25, height: 25, paddingLeft: 10 }}>
                {item.state === 'complete' && <DoneIcon style={{ fill: '#46A44D' }} />}
                {item.state === 'in_progress' && (
                  <CircularProgress size={25} style={{ position: 'relative', width: 25, height: 25 }} />
                )}
                {item.state === 'error' && <ErrorIcon style={{ fill: '#54101B' }} />}
              </Box>
            </ListItemAvatar>
            <ListItemText primary={item.name} secondary={item.description && item.description} />
          </ListItem>
        ))}
      </List>
      <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Button
          onClick={() => {
            setOpen(false);
          }}
          variant="contained">
          {props.done ? 'Close' : 'Cancell'}
        </Button>
      </Box>
    </Dialog>
  );
};
