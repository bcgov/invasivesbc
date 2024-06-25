import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import { OfflineActivityRecord, OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { Badge, Button, CircularProgress } from '@mui/material';
import { ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE } from 'state/actions';
import Sync from '@mui/icons-material/Sync';
import SyncProblem from '@mui/icons-material/SyncProblem';

export const OfflineSyncHeaderButton = () => {
  const dispatch = useDispatch();
  const { working, serial, serializedActivities } = useSelector(selectOfflineActivity);

  const iconComponent = useMemo(() => {
    if (working) {
      return <CircularProgress />;
    }
    const buckets = Object.values(serializedActivities)
      .map((s) => (s as OfflineActivityRecord).sync_state)
      .reduce(
        (a, c) => ({
          ...a,
          [c]: (a[c] || 0) + 1
        }),
        {
          // they don't actually /need/ to be defined here, this is just for clarity of the logic below
          [OfflineActivitySyncState.LOCALLY_MODIFIED]: 0,
          [OfflineActivitySyncState.SYNCHRONIZED]: 0,
          [OfflineActivitySyncState.ERROR]: 0,
          [OfflineActivitySyncState.OPTIMISTIC_LOCKING_FAILURE]: 0
        }
      );

    if (
      buckets[OfflineActivitySyncState.ERROR] > 0 ||
      buckets[OfflineActivitySyncState.OPTIMISTIC_LOCKING_FAILURE] > 0
    ) {
      // errors take precedence, show a warning
      const errorCount =
        buckets[OfflineActivitySyncState.ERROR] + buckets[OfflineActivitySyncState.OPTIMISTIC_LOCKING_FAILURE];
      return (
        <Badge badgeContent={`${errorCount}`} color={'error'}>
          <SyncProblem fontSize={'medium'} />
        </Badge>
      );
    }

    if (buckets[OfflineActivitySyncState.LOCALLY_MODIFIED] > 0) {
      return (
        <Badge badgeContent={`${buckets[OfflineActivitySyncState.LOCALLY_MODIFIED]}`} color={'primary'}>
          <Sync fontSize={'medium'} />
        </Badge>
      );
    }

    return <Sync />;
  }, [working, serial]);

  return (
    <>
      <Button
        onClick={() => {
          dispatch({ type: ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE, payload: { open: true } });
        }}
      >
        {iconComponent}
      </Button>
    </>
  );
};
