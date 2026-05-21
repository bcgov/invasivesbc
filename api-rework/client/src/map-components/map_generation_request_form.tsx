import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'client';
import * as geojson from 'geojson';
import { MapRecord } from 'map-components/map_generation_records_table';
import { useNavigate } from 'react-router';
import { CONFIG } from 'configuration';

type MapGenerationEstimateRequest = {
  bounds: geojson.Polygon | undefined;
  minimum_zoom: number;
  maximum_zoom: number;
};
type MapGenerationCommonResponse = {
  total_tile_count: number;
  area_km2: number;
  minimum_zoom: number;
  maximum_zoom: number;
  bounds: geojson.Polygon;
  tile_definition_source_name: string;
};

type MapGenerationEstimateResponse = MapGenerationCommonResponse & {
  estimated_final_size: number;
  estimated_download_time_best_case: number;
  estimated_download_time_worst_case: number;
};

type MapGenerationExecutionResponse = MapGenerationCommonResponse & {
  id: number;
  status: string;
};

type MapGenerationRequest = MapGenerationEstimateRequest & {};

const MapGenerationRequestForm: React.FC<{ boundingPolygon: geojson.Polygon | undefined }> = ({ boundingPolygon }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { state: auth } = useContext(AuthContext);

  const [missingData, setMissingData] = useState<boolean>(true);

  const navigate = useNavigate();

  const [estimateResponse, setEstimateResponse] = useState<MapGenerationEstimateResponse | undefined>(undefined);

  const [estimateRequest, setEstimateRequest] = useState<MapGenerationEstimateRequest>({
    minimum_zoom: 0,
    maximum_zoom: 10,
    bounds: undefined
  });

  useEffect(() => {
    if (boundingPolygon) {
      setMissingData(false);
    }

    setEstimateRequest({
      ...estimateRequest,
      bounds: boundingPolygon
    });
  }, [boundingPolygon]);

  useEffect(() => {
    if (loading || missingData) return;

    setLoading(true);

    fetch(`${CONFIG.API_URL}/maps/requests/estimate`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(estimateRequest)
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          const serverResult: MapRecord[] = await res.json();
          setEstimateResponse(serverResult as unknown as MapGenerationEstimateResponse);
        } else {
          setEstimateResponse(undefined);
          setError(true);
        }
      })
      .catch((reason) => {
        setLoading(false);
        setError(true);
        setErrorMessage(`${reason}`);
      });
  }, [estimateRequest, missingData]);

  const generateMap = () => {
    fetch(`${CONFIG.API_URL}/maps/requests`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(estimateRequest)
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          const serverResult: MapGenerationExecutionResponse = await res.json();
          navigate(`/map/monitor/${serverResult.id}`);
        } else {
          setError(true);
        }
      })
      .catch((reason) => {
        setLoading(false);
        setError(true);
        setErrorMessage(`${reason}`);
      });
  };

  if (error) {
    return <p className={'warning'}>{errorMessage}</p>;
  }

  return (
    <div className={'form'}>
      <h2>Request a custom PMTiles archive</h2>
      {missingData && <span className={'warning'}>Click two points on the map to define a polygon</span>}
      <dl>
        <dt>Zoom Level</dt>
        <dt>
          <input
            name="maximum_zoom"
            type={'range'}
            value={estimateRequest.maximum_zoom}
            disabled={loading}
            min={6}
            max={20}
            onChange={(e) => {
              setEstimateRequest({
                ...estimateRequest,
                maximum_zoom: parseInt(e.target.value)
              });
            }}
          />
          {estimateRequest.maximum_zoom}
        </dt>
        {estimateResponse && (
          <>
            <dt>Tile Count</dt>
            <dd className={estimateResponse.total_tile_count >= 1000 ? 'warning' : ''}>
              {estimateResponse.total_tile_count}
            </dd>
            <dt>Estimated File Size</dt>
            <dd>{estimateResponse.estimated_final_size}</dd>
            <dt>Estimated Download time</dt>
            <dd>
              {estimateResponse.estimated_download_time_best_case} -{' '}
              {estimateResponse.estimated_download_time_worst_case} seconds
            </dd>
          </>
        )}
      </dl>

      <button disabled={loading || missingData} onClick={generateMap}>
        Generate
      </button>
    </div>
  );
};
export default MapGenerationRequestForm;

export type {
  MapGenerationRequest,
  MapGenerationEstimateRequest,
  MapGenerationEstimateResponse,
  MapGenerationExecutionResponse
};
