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
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorIcon from '@mui/icons-material/Error';
import React, { useEffect, useState } from 'react';

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
      <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '7px' }}>
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
