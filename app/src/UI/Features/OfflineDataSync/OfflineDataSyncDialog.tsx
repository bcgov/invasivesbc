import { Dialog, DialogTitle, IconButton } from '@mui/material';
import { selectOfflineActivity } from 'state/reducers/offlineActivity';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import { OfflineDataSyncTable } from 'UI/Features/OfflineDataSync/OfflineDataSyncTable';
import { Close } from '@mui/icons-material';
import 'UI/Features/OfflineDataSync/OfflineDataSync.css';
import { useEffect } from 'react';
import { AuthActions } from 'state/actions/auth/Auth';
import Activity from 'state/actions/activity/Activity';

export const OfflineDataSyncDialog = () => {
  const { statusDialogOpen } = useSelector(selectOfflineActivity);
  const dispatch = useDispatch();
  const handleClose = () => dispatch(Activity.Offline.setSyncDialogueWindow({ open: false }));

  useEffect(() => {
    if (statusDialogOpen) {
      // a hint that we should make sure our tokens are valid
      dispatch(AuthActions.tokenValidationRequest());
    }
  }, [statusDialogOpen]);

  return (
    <Dialog open={statusDialogOpen} id="offline-data-sync-dialog" maxWidth={'xl'} onClose={handleClose}>
      <div className="dialog-header">
        <DialogTitle>Offline Sync Status</DialogTitle>
        <IconButton color="inherit" onClick={handleClose}>
          <Close />
        </IconButton>
      </div>
      <div className="dialog-content">
        <OfflineDataSyncTable />
      </div>
    </Dialog>
  );
};
