import React from 'react';

import { selectAuth } from 'state/reducers/auth';
import { useSelector } from 'util/use_selector';
import { Button, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import {
  AUTH_FORGET_OFFLINE_USER,
  AUTH_MAKE_OFFLINE_USER_CURRENT,
  AUTH_OPEN_OFFLINE_USER_SELECTION_DIALOG
} from 'state/actions';

import './OfflineUserMenu.css';

const UserSelection = ({ user, handleClose }) => {
  const dispatch = useDispatch();

  return (
    <div className={'userSelection'}>

      <Button
        variant={'outlined'}
        className={'userButton'}
        onClick={() => {
          dispatch({ type: AUTH_MAKE_OFFLINE_USER_CURRENT, payload: { displayName: user.displayName } });
          handleClose();
        }}>
        Work As {user.displayName}
      </Button>
      <Button
        variant={'text'}
        onClick={() => {
          dispatch({ type: AUTH_FORGET_OFFLINE_USER, payload: { displayName: user.displayName } });
          handleClose();
        }}>
        Forget This User
      </Button>
    </div>
  );
};

export const OfflineUserMenu: React.FC = () => {

  const { offlineUsers, offlineUserDialogOpen, displayName, authenticated } = useSelector(selectAuth);
  const dispatch = useDispatch();

  const closeHandler = () => {
    dispatch({ type: AUTH_OPEN_OFFLINE_USER_SELECTION_DIALOG, payload: { state: false } });
  };

  return (
    <Dialog
      open={offlineUserDialogOpen}
      onClose={closeHandler}>
      <DialogTitle>Select A User</DialogTitle>
      <DialogContent>
        <Typography variant={'subtitle1'} className={'offlineUserDialogSubtitle'}>
          While working offline, online features will not be available. You can create activities for later
          upload.
        </Typography>
        <div className={'userList'}>
          {offlineUsers.map(u => {
            return (<UserSelection key={`${u.displayName}`} user={u} handleClose={closeHandler} />);
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
