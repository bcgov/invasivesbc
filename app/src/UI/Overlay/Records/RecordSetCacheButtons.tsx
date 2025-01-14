import { UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { Button, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { LinearProgress, Box } from '@mui/material';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CloseIcon from '@mui/icons-material/Close';
import { MouseEvent, useEffect, useState } from 'react';
import RecordCache from 'state/actions/cache/RecordCache';
import { useDispatch, useSelector } from 'utils/use_selector';
import Prompt from 'state/actions/prompts/Prompt';

interface PropTypes {
  recordSet: UserRecordSet;
  setId: string;
}

const RecordSetCacheButtons = ({ recordSet, setId }: PropTypes) => {
  const dispatch = useDispatch();
  const connected = useSelector((state) => state.Network.connected);
  const [cacheActionEnabled, setCacheActionEnabled] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
        // dispatch(RecordCache.requestCaching({ setId }));
        setShowProgress(true);
        setProgress(0);
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

  const handlePausePlayClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsPaused((prev) => !prev);
  };

  const handleCancelClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowProgress(false);
    setProgress(0);
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

  useEffect(() => {
    // to test out progress bar; to be removed
    let timer: NodeJS.Timeout;
    if (showProgress && !isPaused) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 5;
        });
      }, 500);
    }

    return () => clearInterval(timer);
  }, [showProgress, isPaused]);

  return (
    <Tooltip classes={{ tooltip: 'toolTip' }} title="Click to save this layer and it's records">
      <span>
        {!showProgress && (
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

        {showProgress && (
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap={2}
            sx={{
              border: '1px solid #1976d2',
              borderRadius: '8px',
              padding: '10px'
            }}
          >
            <Button onClick={handlePausePlayClick}>{isPaused ? <PlayCircleIcon /> : <PauseCircleIcon />}</Button>
            <Box display="flex" flexDirection="column" gap={2}>
              <LinearProgress variant={'determinate'} value={progress} style={{ width: '300px' }} />
              <div>{progress}% Completed</div>
            </Box>
            <Button color={'error'} onClick={handleCancelClick}>
              <CloseIcon />
            </Button>
          </Box>
        )}
      </span>
    </Tooltip>
  );
};

export { RecordSetCacheButtons };
