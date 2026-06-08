import { useEffect, useMemo, useState } from 'react';
import { Slider } from '@mui/material';

import bbox from '@turf/bbox';
import { bboxPolygon } from '@turf/turf';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { MapGenerationEstimateRequest, MapGenerationEstimateResponse, MapRecord } from './definitions';
import MapEstimateRenderer from 'UI/Features/TileCache/ProtomapsImplementation/MapEstimateRenderer';
import { useSelector } from 'utils/use_selector';
import debounce from 'lodash.debounce';

import './ProtomapsImplementation.css';

type PropTypes = {
  drawnShape: GeoJSON.Polygon;
  zoom: number;
  setZoom: (newVal: number) => void;
  valid: boolean;
  setValid: (valid: boolean) => void;
};

const MapEstimator = ({ drawnShape, setZoom, zoom, valid, setValid }: PropTypes) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const NORMALIZED_API_BASE = useSelector((state) => state.Configuration.current.runtime.NORMALIZED_API_BASE);

  const debouncedZoomChange = useMemo(() => {
    return debounce(
      (z: number) => {
        setZoom(z);
      },
      50,
      { trailing: true }
    );
  }, []);

  useEffect(() => {
    return () => {
      debouncedZoomChange.cancel();
    };
  }, []);

  const [estimateResponse, setEstimateResponse] = useState<MapGenerationEstimateResponse | undefined>(undefined);

  const [estimateRequest, setEstimateRequest] = useState<MapGenerationEstimateRequest>({
    minimum_zoom: 0,
    maximum_zoom: 10,
    bounds: undefined
  });

  useEffect(() => {
    setEstimateRequest({
      ...estimateRequest,
      maximum_zoom: zoom,
      bounds: bboxPolygon(bbox(drawnShape)).geometry
    });
  }, [drawnShape, zoom]);

  useEffect(() => {
    if (!estimateRequest.bounds) return;

    setLoading(true);
    setError(false);

    (async () => {
      fetch(`${NORMALIZED_API_BASE}/maps/requests/estimate`, {
        headers: {
          Authorization: await getCurrentJWT(),
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(estimateRequest)
      })
        .then(async (res) => {
          setLoading(false);
          if (res.status === 200) {
            const serverResult: MapRecord[] = await res.json();
            const newEstimate = serverResult as unknown as MapGenerationEstimateResponse;
            setEstimateResponse(newEstimate);
            setValid(newEstimate.is_size_valid);
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
    })();
  }, [estimateRequest]);

  return (
    <div>
      <p>Select Zoom Level:</p>
      <Slider
        value={zoom}
        disabled={loading}
        step={1}
        aria-label={'Zoom Level'}
        marks={[
          { label: 'Min', value: 12 },
          { label: '1:70k', value: 13 },
          { label: '1:36k', value: 14 },
          { label: '1:18k', value: 15 },
          { label: '1:9k', value: 16 },
          { label: '1:4k', value: 17 },
          { label: '1:2k', value: 18 },
          { label: 'Max', value: 19 }
        ]}
        sx={{ width: '80%' }}
        color={valid ? 'primary' : 'error'}
        min={12}
        max={19}
        onChange={(_e, value) => {
          if (typeof value === 'number') {
            setLoading(true);
            debouncedZoomChange(value);
          }
        }}
      />
      <div className={`${loading ? 'loading' : ''} estimateDetails`}>
        <>{!valid && <p className={'red'}>Too many tiles. Please reduce the drawn area or the zoom level.</p>}</>
        <>{error && <p className={'red'}>An error occurred: {errorMessage}</p>}</>
        <>{valid && estimateResponse && <MapEstimateRenderer estimate={estimateResponse} />}</>
      </div>
    </div>
  );
};

export default MapEstimator;
