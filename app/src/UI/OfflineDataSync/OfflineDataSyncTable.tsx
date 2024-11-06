import React, { useEffect, useState } from 'react';
import { Button, IconButton, LinearProgress } from '@mui/material';
import { OfflineActivityRecord, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import { ACTIVITY_OFFLINE_DELETE_ITEM, ACTIVITY_RUN_OFFLINE_SYNC } from 'state/actions';
import Delete from '@mui/icons-material/Delete';
import './OfflineDataSync.css';
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

  const history = useHistory();

  const dispatch = useDispatch();

  useEffect(() => {
    if (working) {
      setSyncDisabled(true);
    } else if (workingOffline || !authenticated) {
      setSyncDisabled(true);
    } else if (!connected) {
      setSyncDisabled(true);
    } else {
      setSyncDisabled(false);
    }
  }, [working, workingOffline, authenticated, connected]);

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
                <React.Fragment key={`${key}`}>
                  <tr>
                    <td>
                      <IconButton
                        disabled={!(workingOffline || authenticated)}
                        color="primary"
                        onClick={() => {
                          dispatch(Activity.getLocal(key));
                          history.push(`/Records/Activity:${key}/form`);
                        }}
                      >
                        <FileOpen></FileOpen>
                      </IconButton>
                    </td>
                    <td>{`${(value as OfflineActivityRecord).short_id}`}</td>
                    <td>{`${ActivitySubtypeShortLabels[(value as OfflineActivityRecord).record_type] || 'Unknown'}`}</td>
                    <td>{`${moment((value as OfflineActivityRecord).saved_at)}`}</td>
                    <td>{`${(value as OfflineActivityRecord).sync_state}`}</td>
                    <td>
                      <IconButton
                        onClick={() => {
                          dispatch({ type: ACTIVITY_OFFLINE_DELETE_ITEM, payload: { id: key } });
                        }}
                        color="primary"
                      >
                        <Delete />
                      </IconButton>
                    </td>
                  </tr>
                  {(value as OfflineActivityRecord).sync_state == 'Error' && (
                    <tr>
                      <td></td>
                      <td>
                        {(value as OfflineActivityRecord).error_detail
                          ? (value as OfflineActivityRecord).error_detail
                          : 'Error'}
                      </td>
                      <td colSpan={3}>
                        <pre>{JSON.stringify((value as OfflineActivityRecord).error_object, null, 2)}</pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {syncDisabled && (
        <span className="syncDisabledMessage">Synchronization requires that you be online and authenticated.</span>
      )}
      {working && <LinearProgress className={'progressBar'} />}
      <div className="control">
        <Button
          disabled={syncDisabled}
          variant={'contained'}
          onClick={() => {
            dispatch({ type: ACTIVITY_RUN_OFFLINE_SYNC });
          }}
        >
          Run Sync
        </Button>
      </div>
    </>
  );
};
