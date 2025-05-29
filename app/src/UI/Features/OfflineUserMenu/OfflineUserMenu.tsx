import React from 'react';

import { selectAuth } from 'state/reducers/auth';
import { useSelector } from 'utils/use_selector';
import { Button, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';

import 'UI/Features/OfflineUserMenu/OfflineUserMenu.css';
import { AuthActions } from 'state/actions/auth/Auth';

const UserSelection = ({ user, handleClose }) => {
  const dispatch = useDispatch();

  return (
    <div className={'userSelection'}>
      <Button
        variant={'outlined'}
        className={'userButton'}
        onClick={() => {
          dispatch(AuthActions.makeOfflineUserCurrent({ displayName: user.displayName }));
          handleClose();
        }}
      >
        Work As {user.displayName}
      </Button>
      <Button
        variant={'text'}
        onClick={() => {
          dispatch(AuthActions.forgetOfflineUser({ displayName: user.displayName }));
          handleClose();
        }}
      >
        Forget This User
      </Button>
    </div>
  );
};

export const OfflineUserMenu: React.FC = () => {
  const { offlineUsers, offlineUserDialogOpen } = useSelector(selectAuth);
  const dispatch = useDispatch();

  const closeHandler = () => {
    dispatch(AuthActions.openOfflineUserSelectionDialog(false));
  };

  return (
    <Dialog open={offlineUserDialogOpen} onClose={closeHandler}>
      <DialogTitle>Select A User</DialogTitle>
      <DialogContent>
        <Typography variant={'subtitle1'} className={'offlineUserDialogSubtitle'}>
          While working offline, online features will not be available. You can create activities for later upload.
        </Typography>
        <div className={'userList'}>
          {offlineUsers.map((u) => {
            return <UserSelection key={`${u.displayName}`} user={u} handleClose={closeHandler} />;
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
