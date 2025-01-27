import { UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { Button, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { MouseEvent, useEffect, useState } from 'react';
import RecordCache from 'state/actions/cache/RecordCache';
import { useDispatch, useSelector } from 'utils/use_selector';
import Prompt from 'state/actions/prompts/Prompt';
import { shallowEqual } from 'react-redux';
import ProgressControlPanel from './ProgressControlPanel';

interface PropTypes {
  recordSet: UserRecordSet;
  setId: string;
}

const RecordSetCacheButtons = ({ recordSet, setId }: PropTypes) => {
  const dispatch = useDispatch();
  const connected = useSelector((state) => state.Network.connected);
  const [cacheActionEnabled, setCacheActionEnabled] = useState<boolean>(false);

  const downloadProgress = useSelector(
    (state) => state.UserSettings?.recordSets[setId].cacheDownloadProgress,
    shallowEqual
  );
  const activeDownloads = downloadProgress.normalizedProgress != 0;

  // Ensure the pause/resume button reflects the correct state if the user refreshes after pausing
  const [isPaused, setIsPaused] = useState(activeDownloads ? activeDownloads : false);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    switch (recordSet.cacheMetadataStatus) {
      case UserRecordCacheStatus.NOT_CACHED:
        downloadCache();
        break;
      case UserRecordCacheStatus.DOWNLOADING:
        cancelCacheDownload();
        break;
      case UserRecordCacheStatus.ERROR:
      case UserRecordCacheStatus.CACHED:
      case UserRecordCacheStatus.PAUSED:
        deleteCache();
        break;
    }
  };

  const cancelCacheDownload = () => {
    const callback = (confirmation: boolean) => {
      if (confirmation) {
        dispatch(RecordCache.stopDownload({ setId }));
      }
    };
    dispatch(
      Prompt.confirmation({
        title: 'Cancel Download',
        prompt: 'Would you like to cancel the download in progress?',
        callback
      })
    );
  };

  const downloadCache = () => {
    const callback = (confirmation: boolean) => {
      if (confirmation) {
        dispatch(RecordCache.requestCaching({ setId }));
        setIsPaused(false);
      }
    };

    dispatch(
      Prompt.confirmation({
        title: 'Download Records',
        prompt: 'Would you like to download this cache? The record sets will be available for offline use.',
        confirmText: 'Download Records',
        callback
      })
    );
  };

  const deleteCache = () => {
    const callback = (confirmation: boolean) => {
      if (confirmation) dispatch(RecordCache.deleteCache({ setId }));
    };
    dispatch(
      Prompt.confirmation({
        title: 'Delete Records',
        prompt: [
          'Do you want to remove these records from your device? They will no longer be accessible offline.',
          'This action will not delete the records from the database.'
        ],
        confirmText: 'Delete Records',
        callback
      })
    );
  };

  /** Modify the existing status key to be more user readable */
  const formatStatusKey = (cacheStatus: UserRecordCacheStatus): string => {
    if (!cacheStatus) {
      return 'Unknown';
    } else if (cacheStatus === UserRecordCacheStatus.NOT_CACHED) {
      return 'Save';
    }
    return cacheStatus.replaceAll('_', ' ');
  };

  const handlePauseResumeClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (recordSet.cacheMetadataStatus == UserRecordCacheStatus.DOWNLOADING) {
      dispatch(RecordCache.pauseDownload({ setId }));
      setIsPaused(true);
    } else if (recordSet.cacheMetadataStatus == UserRecordCacheStatus.PAUSED) downloadCache();
  };

  useEffect(() => {
    setCacheActionEnabled(
      connected &&
        [
          UserRecordCacheStatus.CACHED,
          UserRecordCacheStatus.NOT_CACHED,
          UserRecordCacheStatus.ERROR,
          UserRecordCacheStatus.DOWNLOADING
        ].includes(recordSet.cacheMetadataStatus)
    );
  }, [recordSet.cacheMetadataStatus, connected]);

  return (
    <Tooltip classes={{ tooltip: 'toolTip' }} title="Click to save this layer and it's records">
      <span>
        {activeDownloads ? (
          <ProgressControlPanel
            isPaused={isPaused}
            downloadProgress={downloadProgress}
            handlePauseResume={handlePauseResumeClick}
            handleCancel={handleClick}
          />
        ) : (
          <Button
            disabled={!cacheActionEnabled}
            className="records__set__layer_cache"
            onClick={handleClick}
            variant="outlined"
          >
            {formatStatusKey(recordSet.cacheMetadataStatus)}
            <SaveIcon />
          </Button>
        )}
      </span>
    </Tooltip>
  );
};

export { RecordSetCacheButtons };
