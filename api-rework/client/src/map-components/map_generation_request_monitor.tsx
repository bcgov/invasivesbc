import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'client';
import { CONFIG } from 'configuration';
import { MapRecord } from 'map-components/map_generation_records_table';
import { MapGenerationExecutionResponse } from 'map-components/map_generation_request_form';
import { useParams } from 'react-router';

type MapGenerationRequestMonitoringResponse = MapGenerationExecutionResponse & {
  status: 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';
  tile_definition_source_name: string;
  total_tile_count: number;
  intermediate_results?: {
    tiles_downloaded: number;
    tiles_remaining: number;
    cache_hits: number;
    cache_misses: number;
    status_information: string;
  };
  generation_record: MapRecord;
};

const MapGenerationRequestMonitor: React.FC<{ setMap: (m: MapRecord) => void }> = ({ setMap }) => {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { state: auth } = useContext(AuthContext);

  const [response, setResponse] = useState<MapGenerationRequestMonitoringResponse | undefined>(undefined);

  const [tick, setTick] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);

  useEffect(() => {
    if (finished) {
      return;
    }

    const intervalID = setInterval(() => {
      setTick((tick: number) => tick + 1);
    }, 2000);

    return () => clearInterval(intervalID);
  }, [finished]);

  useEffect(() => {
    if (finished) {
      return;
    }
    if (loading) {
      return;
    }
    setLoading(true);
    fetch(`${CONFIG.API_URL}/maps/requests/${id}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          const serverResult: MapGenerationRequestMonitoringResponse = await res.json();
          setResponse(serverResult);
          if (['FAILED', 'COMPLETED'].includes(serverResult.status)) {
            setFinished(true);
          }
          if (serverResult.generation_record) {
            setMap(serverResult.generation_record);
          }
        } else {
          setResponse(undefined);
          setError(true);
        }
      })
      .catch((reason) => {
        setLoading(false);
        setError(true);
        setErrorMessage(`${reason}`);
      });
  }, [tick, finished]);

  if (loading || !response) return <div>Waiting for data...</div>;

  if (error) {
    return <p className={'warning'}>{errorMessage}</p>;
  }

  return (
    <div>
      <dl>
        <dt>Status</dt>
        <dd>
          {response.status} {finished || <span>(Updating in real time...)</span>}
        </dd>
        <dt>Tile Data Source</dt>
        <dd>{response.tile_definition_source_name}</dd>
        <dt>Area (square kilometers)</dt>
        <dd>{response.area_km2}</dd>

        <dt>Progress</dt>
        <dd>
          {response.intermediate_results?.tiles_downloaded || 0}/{response.total_tile_count}
        </dd>
        <dt>Cache Information</dt>
        <dd>
          {response.intermediate_results?.cache_hits} hits ({response.intermediate_results?.cache_misses} misses)
        </dd>
        <dt>Status</dt>
        <dd>{response.intermediate_results?.status_information}</dd>
        {response.generation_record && (
          <>
            <dt>Download</dt>
            <dd>
              <a href={`${CONFIG.OBJECTSTORE_ROOT}/${response.generation_record.file_name}`}>
                Download ({response.generation_record.file_size} bytes)
              </a>
            </dd>
          </>
        )}
      </dl>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
};
export default MapGenerationRequestMonitor;
