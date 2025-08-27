import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Button, IconButton, LinearProgress } from '@mui/material';
import { OfflineActivityRecord, OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import Delete from '@mui/icons-material/Delete';
import 'UI/Features/OfflineDataSync/OfflineDataSync.css';
import moment from 'moment';
import { FileOpen } from '@mui/icons-material';
import { ActivitySubtypeShortLabels } from 'sharedAPI';
import { useHistory } from 'react-router-dom';
import Activity from 'state/actions/activity/Activity';

export const OfflineDataSyncTable = () => {
  const { working, serializedActivities } = useSelector(selectOfflineActivity);
  const { authenticated, workingOffline } = useSelector((state) => state.Auth);
  const connected = useSelector((state) => state.Network.connected);
  const [syncDisabled, setSyncDisabled] = useState(false);

  const numUnsynchronizedRecords = useMemo(
    () =>
      Object.keys(serializedActivities).filter(
        (key: PropertyKey) => serializedActivities[key]?.sync_state !== OfflineActivitySyncState.SYNCHRONIZED
      ).length,
    [serializedActivities]
  );

  const history = useHistory();

  const dispatch = useDispatch();

  useEffect(() => {
    if (numUnsynchronizedRecords === 0) {
      setSyncDisabled(true); // We have nothing to sync!
    } else if (working) {
      setSyncDisabled(true);
    } else if (workingOffline || !authenticated) {
      setSyncDisabled(true);
    } else if (!connected) {
      setSyncDisabled(true);
    } else {
      setSyncDisabled(false);
    }
  }, [working, workingOffline, authenticated, connected, numUnsynchronizedRecords]);

  if (Object.values(serializedActivities).length === 0) {
    return <p>There are no locally-stored activities to synchronize.</p>;
  }

  return (
    <>
      <div className="dialog-table">
        <table className={'offlineDataSyncTable'}>
          <thead>
            <tr>
              <th>Load</th>
              <th>Activity</th>
              <th>Record Type</th>
              <th>Locally Modified</th>
              <th>Status</th>
              <th>Delete Local</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(serializedActivities).map(([key, value]) => {
              return (
                <React.Fragment key={key}>
                  <tr>
                    <td>
                      <IconButton
                        disabled={!(workingOffline || authenticated)}
                        color="primary"
                        onClick={() => {
                          history.push(`/Records/Activity:${key}/form`);
                          dispatch(Activity.Offline.setSyncDialogueWindow({ open: false }));
                        }}
                      >
                        <FileOpen />
                      </IconButton>
                    </td>
                    <td>{`${(value as OfflineActivityRecord).short_id}`}</td>
                    <td>{`${ActivitySubtypeShortLabels[(value as OfflineActivityRecord).record_type] || 'Unknown'}`}</td>
                    <td>{`${moment((value as OfflineActivityRecord).saved_at)}`}</td>
                    <td>{`${(value as OfflineActivityRecord).sync_state}`}</td>
                    <td>
                      <IconButton
                        onClick={() => {
                          dispatch(Activity.Offline.delete(key));
                        }}
                        color="primary"
                      >
                        <Delete />
                      </IconButton>
                    </td>
                  </tr>
                  {(value as OfflineActivityRecord).sync_state == 'Error' && (
                    <tr>
                      <td>
                        <Fragment />
                      </td>
                      <td>
                        {(value as OfflineActivityRecord).error_detail
                          ? (value as OfflineActivityRecord).error_detail
                          : 'Error'}
                      </td>
                      <td colSpan={4}>
                        <pre>
                          {(value as OfflineActivityRecord).error_object?.hasOwnProperty('message')
                            ? JSON.stringify((value as OfflineActivityRecord).error_object?.message)
                            : JSON.stringify((value as OfflineActivityRecord).error_object)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="status-info">
        {syncDisabled && numUnsynchronizedRecords > 0 && (
          <p>Synchronization requires that you be online and authenticated.</p>
        )}
        <p>
          Unsynced Records: <span>{numUnsynchronizedRecords}</span>
        </p>
        {working && <LinearProgress className={'progressBar'} />}
      </div>
      <div className="control">
        <Button
          disabled={syncDisabled}
          variant={'contained'}
          onClick={() => {
            dispatch(Activity.Offline.syncRun());
          }}
        >
          Run Sync
        </Button>
      </div>
    </>
  );
};
