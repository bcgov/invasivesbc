import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { selectOfflineActivity } from 'state/reducers/offlineActivity';
import { useSelector } from 'util/use_selector';
import { useDispatch } from 'react-redux';
import { ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE } from 'state/actions';
import { OfflineDataSyncTable } from 'UI/OfflineDataSync/OfflineDataSyncTable';

import './OfflineDataSync.css';

export const OfflineDataSyncDialog = () => {
  const { statusDialogOpen } = useSelector(selectOfflineActivity);
  const dispatch = useDispatch();

  return (
    <Dialog
      open={statusDialogOpen}
      maxWidth={'xl'}
      onClose={() => {
        dispatch({ type: ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE, payload: { open: false } });
      }}>

      <DialogTitle>
        Offline Sync Status
      </DialogTitle>

      <DialogContent>
        <OfflineDataSyncTable />
      </DialogContent>

    </Dialog>
  );

};
