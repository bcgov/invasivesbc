import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'utils/use_selector';

import './ProtomapsImplementation.css';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { Button } from '@mui/material';
import OfflineProtomaps from 'state/actions/cache/OfflineProtomaps';
import { convertBytesToReadableString } from 'utils/humanize_units';
import { Refresh } from '@mui/icons-material';

type MapGenerationRequestWithProgress = {
  id: number;
  generation_record: number | null;
  minimum_zoom: number;
  maximum_zoom: number;
  total_tile_count: number;
  centroid: GeoJSON.Point;
  trip_name: string | null;
  area_km2: number;
  file_name: string | null;
  file_size: number | null;
  updated: string;
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

  const protomapDefinitions = useSelector((state) => state.Protomaps.definitions);

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

  const renderStatus = (r: MapGenerationRequestWithProgress) => {
    const installed = protomapDefinitions.some((d) => d.tripName === r.trip_name);
    if (r.status === 'PROCESSING' && r.progress !== null) {
      return `${r.progress.downloaded} / ${r.progress.total}`;
    }
    return `${r.status} ${(installed && '(INSTALLED)') || ''}`;
  };

  const renderActions = (r: MapGenerationRequestWithProgress) => {
    const installed = protomapDefinitions.some((d) => d.tripName === r.trip_name);
    const installable = !installed && r.status === 'COMPLETED' && r.trip_name !== null && r.generation_record !== null;

    return (
      <>
        {installable && (
          <Button
            onClick={() => {
              if (r.generation_record !== null) {
                dispatch(OfflineProtomaps.install({ generationRecordId: r.generation_record }));
              }
            }}
          >
            Install
          </Button>
        )}
      </>
    );
  };

  return (
    <div className={'protomapsList'}>
      <Button
        disabled={loading}
        onClick={() => {
          setSerial(serial + 1);
        }}
      >
        <Refresh />
        Refresh
      </Button>
      {error && <span className={'error'}>{errorMessage}</span>}
      <table>
        <thead>
          <tr>
            <th>Trip Name</th>
            <th>Updated</th>
            <th>Size</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {maps.map((r) => (
            <tr key={r.id}>
              <td>{r.trip_name}</td>
              <td>{r.updated}</td>
              <td>{r.file_size !== null && convertBytesToReadableString(r.file_size)}</td>
              <td>{renderStatus(r)}</td>
              <td>{renderActions(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProtomapsList;
