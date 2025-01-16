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
          // <div className="record-set-control">
          //   <Tooltip title="Toggle viewing the labels on the map for this layer.  If more than 200 are in the extent, you may need to zoom in to see what you are looking for.  For people on slow computers - it recalculates on drag and zoom so fewer small drags will decrease loading time.">
          //     <IconButton onClick={handlePausePlayClick} color="primary">
          //       {isPaused ? <PlayCircleIcon /> : <PauseCircleIcon />}
          //     </IconButton>
          //   </Tooltip>
          //   <Tooltip title="progress bar">
          //     <LinearProgress variant={'determinate'} value={progress} />
          //   </Tooltip>
          //   <Tooltip title="cancel">
          //     <IconButton color={'error'} onClick={handleCancelClick}>
          //       <CloseIcon />
          //     </IconButton>
          //   </Tooltip>
          // </div>

          // <Box
          //   display="flex"
          //   flexDirection="column"
          //   alignItems="center"
          //   sx={{
          //     border: '1px solid #1976d2',
          //     borderRadius: '8px',
          //     padding: '10px'
          //   }}
          // >
          //   <Grid spacing={2}>
          //     <Grid xs={3}>
          //       <IconButton onClick={handlePausePlayClick} color="primary">
          //         {isPaused ? <PlayCircleIcon /> : <PauseCircleIcon />}
          //       </IconButton>
          //     </Grid>
          //     <Grid xs={6}>
          //       <LinearProgress variant={'determinate'} value={progress} />
          //     </Grid>
          //     <Grid xs={3}>
          //       <IconButton color={'error'} onClick={handleCancelClick}>
          //         <CloseIcon />
          //       </IconButton>
          //     </Grid>
          //   </Grid>
          //   <Grid>
          //     <Grid xs={12}>
          //       <div>{progress}% Completed</div>
          //     </Grid>
          //   </Grid>
          // </Box>

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
                <LinearProgress variant={'determinate'} value={progress} sx={{ height: 5 }} />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  color={'error'}
                  onClick={handleCancelClick}
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
              <Grid item xs={12}>
                <Typography variant="caption" align="center">
                  {`${progress}% completed`}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </span>
    </Tooltip>
  );
};

export { RecordSetCacheButtons };
