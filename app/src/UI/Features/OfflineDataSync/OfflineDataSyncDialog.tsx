import { selectOfflineActivity } from 'state/reducers/offlineActivity';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import { OfflineDataSyncTable } from 'UI/Features/OfflineDataSync/OfflineDataSyncTable';
import 'UI/Features/OfflineDataSync/OfflineDataSync.css';
import { useEffect } from 'react';
import { AuthActions } from 'state/actions/auth/Auth';
import Activity from 'state/actions/activity/Activity';
import StyledModal from 'UI/Reusable/StyledModal/StyledModal';

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
    <StyledModal open={statusDialogOpen} className="offline-data-sync-dialog" onClose={handleClose}>
      <div className="header">Offline Sync Status</div>
      <OfflineDataSyncTable handleClose={handleClose} />
    </StyledModal>
  );
};
