import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'utils/use_selector';

import './ProtomapsImplementation.css';
import './ProtomapsList.css';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { Button, LinearProgress } from '@mui/material';
import OfflineProtomaps from 'state/actions/cache/OfflineProtomaps';
import { convertBytesToReadableString } from 'utils/humanize_units';

import {
  AssignmentTurnedInOutlined,
  ErrorOutlined,
  FileDownloadDoneOutlined,
  PendingActionsOutlined,
  Refresh
} from '@mui/icons-material';

type MapGenerationRequestWithProgress = {
  id: number;
  generation_record: number | null;
  minimum_zoom: number;
  maximum_zoom: number;
  total_tile_count: number;
  centroid: GeoJSON.Point;
  trip_name: string;
  area_km2: number;
  file_name: string | null;
  file_size: number | null;
  updated: string;
  time_to_expiry: string;
  progress: null | {
    seconds_elapsed: number | null;
    downloaded: number;
    total: number;
  };
  status: string;
};

const ProtomapsList = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const NORMALIZED_API_BASE = useSelector((state) => state.Configuration.current.runtime.NORMALIZED_API_BASE);

  const [maps, setMaps] = useState<MapGenerationRequestWithProgress[]>([]);
  const [serial, setSerial] = useState(0);
  const [monitoringProgress, setMonitoringProgress] = useState(false);

  const incrementSerialIfNeeded = useCallback(() => {
    if (monitoringProgress) {
      setSerial(serial + 1);
    }
  }, [serial, setSerial, monitoringProgress]);

  const protomapDefinitions = useSelector((state) => state.Protomaps.definitions);
  const installationsInProgress = useSelector((state) => state.Protomaps.installationsRequested);

  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);
    setError(false);

    (async () => {
      fetch(`${NORMALIZED_API_BASE}/maps/requests/offline_maps_page_list`, {
        headers: {
          Authorization: await getCurrentJWT(),
          'Content-Type': 'application/json'
        },
        method: 'GET'
      })
        .then(async (res) => {
          setLoading(false);
          if (res.status === 200) {
            const serverResult: MapGenerationRequestWithProgress[] = await res.json();
            setMonitoringProgress(serverResult.some((r) => ['PENDING', 'PROCESSING', 'STALE'].includes(r.status)));
            setMaps(serverResult);
          } else {
            setMaps([]);
            setError(true);
          }
        })
        .catch((reason) => {
          setLoading(false);
          setError(true);
          setErrorMessage(`${reason}`);
        });
    })();
  }, [serial]);

  useEffect(() => {
    const intervalID = setInterval(() => {
      incrementSerialIfNeeded();
    }, 3000);

    return () => {
      clearInterval(intervalID);
    };
  }, [incrementSerialIfNeeded]);

  useEffect(() => {
    // not pretty, but it works
    dispatch(OfflineProtomaps.syncTripService());
  }, [monitoringProgress, loading]);

  const renderStatus = (r: MapGenerationRequestWithProgress) => {
    switch (r.status) {
      case 'PENDING':
        return (
          <span className={'status'}>
            <PendingActionsOutlined />
            QUEUED
          </span>
        );
      case 'PROCESSING':
        return (
          <span className={'status'}>
            <PendingActionsOutlined />
            PREPARING
            {r.progress !== null && (
              <>
                &nbsp;{Math.round((r.progress.downloaded / r.progress.total) * 100.0)} %
                <LinearProgress
                  className={'progress'}
                  variant={'determinate'}
                  value={100 * (r.progress.downloaded / r.progress.total)}
                />
              </>
            )}
          </span>
        );
      case 'EXPIRED':
        return (
          <span className={'status'}>
            <PendingActionsOutlined />
            EXPIRED (CAN BE REGENERATED)
          </span>
        );
      case 'STALE':
        return (
          <span className={'status'}>
            <PendingActionsOutlined />
            LONGER WAIT THAN EXPECTED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className={'status'}>
            <AssignmentTurnedInOutlined />
            FINISHED
          </span>
        );
      case 'FAILED':
        return (
          <span className={'status'}>
            <ErrorOutlined />
            SERVER ERROR OCCURRED
          </span>
        );
      default:
        return r.status;
    }
  };

  const renderActions = (r: MapGenerationRequestWithProgress) => {
    const installed = protomapDefinitions.some((d) => d.tripName === r.trip_name);
    const installable = !installed && r.status === 'COMPLETED' && r.trip_name !== null && r.generation_record !== null;
    const installationInProgress = installationsInProgress.some((d) => d.tripName === r.trip_name);
    const canBeRegenerated = r.status === 'EXPIRED';

    if (installationInProgress) {
      return (
        <>
          <Button disabled={true}>Installing</Button>
          <LinearProgress
            className={'progress'}
            variant={'determinate'}
            value={installationsInProgress.find((i) => i.tripName == r.trip_name)?.percent || -1}
          />
        </>
      );
    } else if (installed) {
      return (
        <Button
          onClick={() => {
            dispatch(OfflineProtomaps.remove({ name: r.trip_name }));
          }}
        >
          Uninstall
        </Button>
      );
    } else if (installable) {
      return (
        <Button
          onClick={() => {
            if (r.generation_record !== null) {
              dispatch(OfflineProtomaps.install({ generationRecordId: r.generation_record }));
            }
          }}
        >
          Install
        </Button>
      );
    } else if (canBeRegenerated) {
      return (
        <Button
          onClick={() => {
            dispatch(OfflineProtomaps.regenerate({ id: r.id, tripId: r.trip_name }));
          }}
        >
          Regenerate
        </Button>
      );
    }

    return null;
  };

  const renderInstalled = (r: MapGenerationRequestWithProgress) => {
    const installed = protomapDefinitions.some((d) => d.tripName === r.trip_name);

    if (installed) {
      return (
        <span>
          <FileDownloadDoneOutlined />
        </span>
      );
    }
    return null;
  };

  const renderISO8601TimeInLocalTime = (t: string) => {
    const systemTZ = Temporal.Now.timeZoneId();

    try {
      const instant = Temporal.Instant.from(t);
      return instant.toZonedDateTimeISO(systemTZ).toLocaleString(navigator.language, {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch {
      return t;
    }
  };

  const renderISO8601Duration = (t: string) => {
    try {
      const duration = Temporal.Duration.from(t);
      return duration.toLocaleString();
    } catch {
      return t;
    }
  };

  return (
    <div className={'protomaps-list'}>
      <Button
        disabled={loading || monitoringProgress}
        onClick={() => {
          setSerial(serial + 1);
        }}
      >
        <Refresh
          sx={{
            animation: loading || monitoringProgress ? 'spin 1.5s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}
        />
        {monitoringProgress ? 'Auto-Refreshing' : 'Refresh'}
      </Button>
      {error && <span className={'error'}>{errorMessage}</span>}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Trip Name</th>
              <th>Updated</th>
              <th>Expires</th>
              <th>Size</th>
              <th>Status</th>
              <th>Installed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {maps.map((r) => (
              <tr key={r.id}>
                <td>{r.trip_name}</td>
                <td>{renderISO8601TimeInLocalTime(r.updated)}</td>
                <td>{r.time_to_expiry && renderISO8601Duration(r.time_to_expiry)}</td>
                <td>{r.file_size !== null && convertBytesToReadableString(r.file_size)}</td>
                <td>{renderStatus(r)}</td>
                <td>{renderInstalled(r)}</td>
                <td>{renderActions(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProtomapsList;
export type { MapGenerationRequestWithProgress };
