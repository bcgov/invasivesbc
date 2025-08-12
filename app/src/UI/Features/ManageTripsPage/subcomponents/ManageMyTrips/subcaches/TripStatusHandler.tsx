import { Delete, Refresh, Save, Stop, StopCircle, StopCircleOutlined } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import { ReactNode } from 'react';
import { IPlanMyTripCacheStatus as Status } from 'utils/plan-my-trip-cache';

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
  return (
    <div className="trip-module">
      {
        {
          [Status.CACHED]: (
            <IconButton color={'error'} onClick={handleDelete}>
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
