import { Fragment, MouseEvent, TouchEvent, useEffect, useMemo, useState } from 'react';
import { Button, IconButton, LinearProgress } from '@mui/material';
import { OfflineActivityRecord, OfflineActivitySyncState } from 'state/reducers/offlineActivity';
import { useDispatch, useSelector } from 'utils/use_selector';
import 'UI/Features/OfflineDataSync/OfflineDataSync.css';
import moment from 'moment';
import { MoreVert } from '@mui/icons-material';
import { ActivitySubtypesShortLabels } from 'sharedAPI';
import Activity from 'state/actions/activity/Activity';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import { useNavigate } from 'react-router';
import Prompt from 'state/actions/prompts/Prompt';

type PropTypes = {
  handleClose: () => void;
};
export const OfflineDataSyncTable = ({ handleClose }: PropTypes) => {
  const clearSyncedActivities = () => {
    dispatch(
      Prompt.confirmation({
        title: 'Remove all Synchronized Records?',
        prompt: [
          'This will permanently remove synchronized records from this device.',
          'This action cannot be undone, but it will not affect your data stored in the InvasivesBC database.'
        ],
        confirmText: 'Delete Locally',
        cancelText: 'Keep Records',
        callback: (confirm) => {
          if (confirm) dispatch(Activity.Offline.removeSyncedRecords());
        }
      })
    );
  };
  const serializedActivities = useSelector((state) => state.OfflineActivity.serializedActivities);
  const working = useSelector((state) => state.OfflineActivity.working);
  const { authenticated, workingOffline } = useSelector((state) => state.Auth);
  const connected = useSelector((state) => state.Network.connected);

  const [syncDisabled, setSyncDisabled] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [contextRecord, setContextRecord] = useState<string>();

  const numUnsynchronizedRecords = useMemo(
    () =>
      Object.keys(serializedActivities).filter(
        (key: PropertyKey) => serializedActivities[key]?.sync_state !== OfflineActivitySyncState.SYNCHRONIZED
      ).length,
    [serializedActivities]
  );

  const navigate = useNavigate();

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
    return (
      <div className="content">
        <p>There are no locally-stored activities to synchronize.</p>
      </div>
    );
  }
  const handleDelete = () => {
    if (!contextRecord) return;
    if (confirmDelete) {
      dispatch(Activity.Offline.delete(contextRecord));
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };
  const handleLoad = () => {
    if (!contextRecord) return;
    navigate(`/Records/HookForm/${contextRecord}/form`);
    dispatch(Activity.Offline.setSyncDialogueWindow({ open: false }));
  };
  const handleOpenMenu = (evt: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>, key: string) => {
    setAnchorEl(evt.currentTarget);
    setContextRecord(key);
    setConfirmDelete(false);
  };
  return (
    <>
      <div className="content">
        {contextRecord && (
          <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }} disablePortal>
            <div className="popover-menu">
              <p>Activity: {serializedActivities?.[contextRecord]?.short_id}</p>
              <Button variant="contained" disabled={!(workingOffline || authenticated)} onClick={handleLoad}>
                Open
              </Button>
              <Button variant="contained" onClick={handleDelete} color={confirmDelete ? 'error' : 'primary'}>
                {confirmDelete ? 'Are you sure?' : 'Delete Locally'}
              </Button>
            </div>
          </CustomPopover>
        )}
        <div className="dialog-table">
          <table className={'offline-data-sync-table'}>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Record Type</th>
                <th>Last Modified</th>
                <th colSpan={2}>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(serializedActivities).map(([key, value]) => {
                return (
                  <Fragment key={key}>
                    <tr>
                      <td>{`${(value as OfflineActivityRecord).short_id}`}</td>
                      <td className="record-type">{`${ActivitySubtypesShortLabels[(value as OfflineActivityRecord).record_type] ?? 'Unknown'}`}</td>
                      <td className="modified-time">
                        {`${moment((value as OfflineActivityRecord).saved_at).fromNow()}`}
                      </td>
                      <td className="sync-status">{`${(value as OfflineActivityRecord).sync_state}`}</td>
                      <td>
                        <IconButton onClick={(e) => handleOpenMenu(e, key)}>
                          <MoreVert />
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
                        <td colSpan={4}>
                          <pre>
                            {(value as OfflineActivityRecord).error_object?.hasOwnProperty('message')
                              ? JSON.stringify((value as OfflineActivityRecord).error_object?.message)
                              : JSON.stringify((value as OfflineActivityRecord).error_object)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="status-info">
          <p>
            Unsynced Records: <span>{numUnsynchronizedRecords}</span>
          </p>
          {!connected && <p className="deep-red">Synchronization requires that you be online and authenticated.</p>}
          {working && <LinearProgress className={'progress-bar'} />}
        </div>
      </div>
      <div className="control">
        {numUnsynchronizedRecords !== Object.keys(serializedActivities).length && (
          <Button variant={'outlined'} onClick={clearSyncedActivities} className="clear-synced" color={'primary'}>
            Remove Synced Records
          </Button>
        )}
        <Button onClick={handleClose}>Close</Button>
        <Button disabled={syncDisabled} variant={'contained'} onClick={() => dispatch(Activity.Offline.syncRun())}>
          Run Sync
        </Button>
      </div>
    </>
  );
};
