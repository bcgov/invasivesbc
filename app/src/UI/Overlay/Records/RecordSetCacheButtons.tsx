import { UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { Button, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { LinearProgress, Box } from '@mui/material';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CloseIcon from '@mui/icons-material/Close';
import { MouseEvent, useEffect, useState } from 'react';
import RecordCache from 'state/actions/cache/RecordCache';
import { useDispatch, useSelector } from 'utils/use_selector';
import Prompt from 'state/actions/prompts/Prompt';
import { shallowEqual } from 'react-redux';

interface PropTypes {
  recordSet: UserRecordSet;
  setId: string;
}

const RecordSetCacheButtons = ({ recordSet, setId }: PropTypes) => {
  const dispatch = useDispatch();
  const connected = useSelector((state) => state.Network.connected);
  const [cacheActionEnabled, setCacheActionEnabled] = useState<boolean>(false);
  // const [showProgress, setShowProgress] = useState(false);
  // const [progress, setProgress] = useState(0);

  const downloadProgress = useSelector(
    (state) => state.UserSettings?.recordSets[setId].cacheDownloadProgress,
    shallowEqual
  );
  const activeDownloads = downloadProgress.normalizedProgress != 0;
  const [isPaused, setIsPaused] = useState(activeDownloads ? activeDownloads : false);
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    /**
     * Save -> Progress bar shows up
     * For Progress bar:
     * * Get the total no.of records in the recordset
     * * Get the number of caches being downloaded and move the progress bar accordingly
     * * Check how the system works when there are multiple progress bars
     *
     * Cancel:
     * * Add the previous method to this button / prompts to be shown as before
     *
     * Pause/Play: Next iteration / brain storm all use cases
     *
     * UI clean up: Make the box look better
     *
     * Code refactor and optimization (?)
     */
    e.stopPropagation();
    switch (recordSet.cacheMetadataStatus) {
      case UserRecordCacheStatus.NOT_CACHED: // UserRecordCacheStatus.PAUSED
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
        // setShowProgress(false);
        // setProgress(0);
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

        // setShowProgress(true);
        // setProgress(0);
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

    // for pause first
    if (recordSet.cacheMetadataStatus == UserRecordCacheStatus.DOWNLOADING)
      dispatch(RecordCache.pauseDownload({ setId }));
    else if (recordSet.cacheMetadataStatus == UserRecordCacheStatus.PAUSED) downloadCache();
    // previous implementation
    // dispatch(RecordCache.pauseOrResumeCache(setId));
    setIsPaused((prev) => !prev);
  };

  useEffect(() => {
    setCacheActionEnabled(
      connected &&
        [
          UserRecordCacheStatus.CACHED,
          UserRecordCacheStatus.NOT_CACHED,
          UserRecordCacheStatus.ERROR,
          UserRecordCacheStatus.DOWNLOADING,
          UserRecordCacheStatus.PAUSED
        ].includes(recordSet.cacheMetadataStatus)
    );
  }, [recordSet.cacheMetadataStatus, connected]);

  return (
    <Tooltip classes={{ tooltip: 'toolTip' }} title="Click to save this layer and it's records">
      <span>
        {!activeDownloads && (
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

        {activeDownloads && (
          <Box
            sx={{
              border: '1px solid #1976d2',
              borderRadius: '8px',
              padding: 2
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Grid container spacing={2} alignItems="center">
              {/* First row with buttons and progress bar */}
              <Grid item xs={2}>
                <IconButton
                  onClick={handlePausePlayClick}
                  color="primary"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%'
                  }}
                >
                  {isPaused ? <PlayCircleIcon /> : <PauseCircleIcon />}
                </IconButton>
              </Grid>
              <Grid item xs={8}>
                <LinearProgress variant={'determinate'} value={downloadProgress.normalizedProgress * 100} />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  color={'error'}
                  onClick={handleClick}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%'
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
              {/* Second row with progress text */}
              {/* {<Grid item xs={12}>
                <Typography variant="caption" align="center">
                  {`${Math.floor(downloadProgress.normalizedProgress * 100) == 0 ? (downloadProgress.normalizedProgress * 100).toFixed(1) : Math.floor(downloadProgress.normalizedProgress * 100)}% completed`}
                </Typography>
              </Grid>} */}
            </Grid>
          </Box>
        )}
      </span>
    </Tooltip>
  );
};

export { RecordSetCacheButtons };
