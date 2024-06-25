import React from 'react';
import { Button, LinearProgress } from '@mui/material';
import { OfflineActivityRecord, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import { ACTIVITY_GET_LOCAL_REQUEST, ACTIVITY_OFFLINE_DELETE_ITEM, ACTIVITY_RUN_OFFLINE_SYNC } from 'state/actions';
import Delete from '@mui/icons-material/Delete';
import './OfflineDataSync.css';
import moment from 'moment';
import { FileOpen } from '@mui/icons-material';
import { ActivitySubtypeShortLabels } from 'sharedAPI';

export const OfflineDataSyncTable = () => {
  const { working, serializedActivities } = useSelector(selectOfflineActivity);
  const dispatch = useDispatch();

  if (Object.values(serializedActivities).length === 0) {
    return <p>There are no locally-stored activities to synchronize.</p>;
  }

  return (
    <>
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
              <tr key={`${key}`}>
                <td>
                  <Button
                    onClick={() => {
                      dispatch({ type: ACTIVITY_GET_LOCAL_REQUEST, payload: { activityID: key } });
                    }}
                  >
                    <FileOpen></FileOpen>
                  </Button>
                </td>
                <td>{`${(value as OfflineActivityRecord).short_id}`}</td>
                <td>{`${ActivitySubtypeShortLabels[(value as OfflineActivityRecord).record_type] || 'Unknown'}`}</td>
                <td>{`${moment((value as OfflineActivityRecord).saved_at)}`}</td>
                <td>{`${(value as OfflineActivityRecord).sync_state}`}</td>
                <td>
                  <Button>
                    <Delete
                      onClick={() => {
                        dispatch({ type: ACTIVITY_OFFLINE_DELETE_ITEM, payload: { id: key } });
                      }}
                    />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Button
        disabled={working}
        variant={'contained'}
        onClick={() => {
          dispatch({ type: ACTIVITY_RUN_OFFLINE_SYNC });
        }}
      >
        Run Sync
      </Button>
      {working && <LinearProgress className={'progressBar'} />}
    </>
  );
};
