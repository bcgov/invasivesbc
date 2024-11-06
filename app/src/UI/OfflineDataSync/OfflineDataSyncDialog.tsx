import { Dialog, DialogTitle, IconButton } from '@mui/material';
import { selectOfflineActivity } from 'state/reducers/offlineActivity';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import { ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE } from 'state/actions';
import { OfflineDataSyncTable } from 'UI/OfflineDataSync/OfflineDataSyncTable';
import { Close } from '@mui/icons-material';
import './OfflineDataSync.css';

export const OfflineDataSyncDialog = () => {
  const { statusDialogOpen } = useSelector(selectOfflineActivity);
  const dispatch = useDispatch();
  const handleClose = () => dispatch({ type: ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE, payload: { open: false } });
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
