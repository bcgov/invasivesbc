import { Delete, Refresh, Save, Stop, StopCircle, StopCircleOutlined } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import { ReactNode } from 'react';
import Prompt from 'state/actions/prompts/Prompt';
import { IPlanMyTripCacheStatus as Status } from 'utils/plan-my-trip-cache';
import { useDispatch } from 'utils/use_selector';

interface PropTypes {
  handleDelete: () => void;
  handleRestartDownload: () => void;
  handleStop: () => void;
  status: Status;
}

type TripStatusHandlerProps =
  | (PropTypes & { handleStartDownload: () => void; downloadSpecsOverride?: never })
  | (PropTypes & { handleStartDownload?: never; downloadSpecsOverride?: ReactNode });

const TripStatusHandler = ({
  handleDelete,
  handleStartDownload,
  handleRestartDownload,
  handleStop,
  status,
  downloadSpecsOverride
}: TripStatusHandlerProps) => {
  const dispatch = useDispatch();

  const confirmDelete = () => {
    dispatch(
      Prompt.confirmation({
        title: 'Delete Cached Data',
        prompt: 'Are you sure you want to delete this data? It will no longer be available for offline use',
        callback: (confirm: boolean) => {
          if (confirm) handleDelete();
        }
      })
    );
  };
  return (
    <div className="trip-module">
      {
        {
          [Status.CACHED]: (
            <IconButton color={'error'} onClick={confirmDelete}>
              <Delete />
            </IconButton>
          ),
          [Status.DELETING]: (
            <Button variant="text" onClick={handleDelete}>
              Deleting...
            </Button>
          ),
          [Status.FAILED]: (
            <>
              <IconButton color="primary" onClick={handleRestartDownload}>
                <Refresh />
              </IconButton>
              <IconButton color="error" onClick={handleDelete}>
                <Delete />
              </IconButton>
            </>
          ),
          [Status.IN_PROGRESS]: (
            <>
              <p>Download in Progress...</p>
              <IconButton color="error" onClick={handleStop}>
                <StopCircleOutlined />
              </IconButton>
            </>
          ),
          [Status.NOT_CACHED]: (
            <>
              {downloadSpecsOverride ? (
                downloadSpecsOverride
              ) : (
                <>
                  <p>Download Data </p>
                  <IconButton color="primary" onClick={handleStartDownload}>
                    <Save />
                  </IconButton>
                </>
              )}
            </>
          ),
          [Status.NO_DATA]: (
            <>
              <p>No data in selected area </p>
              <IconButton color="primary" onClick={handleStartDownload}>
                <Refresh />
              </IconButton>
            </>
          ),
          [Status.UNAVAILABLE]: <p>Caching unavailable</p>
        }[status]
      }
    </div>
  );
};

export default TripStatusHandler;
