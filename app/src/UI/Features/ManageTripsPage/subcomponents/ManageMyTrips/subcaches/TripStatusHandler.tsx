import { Delete, Refresh, Save, Stop } from '@mui/icons-material';
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
    <div>
      <p>
        Status: <span>{status}</span>
      </p>
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
              <IconButton onClick={handleRestartDownload}>
                <Refresh />
              </IconButton>
              <IconButton onClick={handleDelete}>
                <Delete />
              </IconButton>
            </>
          ),
          [Status.IN_PROGRESS]: (
            <span>
              <p>Download in Progress...</p>
              <IconButton onClick={handleStop}>
                <Stop />
              </IconButton>
            </span>
          ),
          [Status.NOT_CACHED]: (
            <>
              {downloadSpecsOverride ? (
                downloadSpecsOverride
              ) : (
                <>
                  <p>Download Data </p>
                  <IconButton onClick={handleStartDownload}>
                    <Save />
                  </IconButton>
                </>
              )}
            </>
          ),
          [Status.NO_DATA]: (
            <>
              <p>No data found in the selected area </p>
              <IconButton onClick={handleStartDownload}>
                <Refresh />
              </IconButton>
            </>
          ),
          [Status.UNAVAILABLE]: <p>This is currently Unavailable</p>
        }[status]
      }
    </div>
  );
};

export default TripStatusHandler;
