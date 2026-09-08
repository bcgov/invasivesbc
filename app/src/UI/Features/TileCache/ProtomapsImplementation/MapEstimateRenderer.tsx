import React, { useEffect, useState } from 'react';
import { thresholds, useTileSizeThresholds } from 'UI/Features/TileCache/tileSizeHook';
import { MapGenerationEstimateResponse } from 'UI/Features/TileCache/ProtomapsImplementation/definitions';
import moment from 'moment';
import { convertBytesToReadableString } from 'utils/humanize_units';
import './ProtomapsImplementation.css';

const MapDownloadEstimate: React.FC<{ estimate: MapGenerationEstimateResponse }> = ({ estimate }) => {
  const [className, setClassName] = useState('green');

  const { thresholdRange } = useTileSizeThresholds(estimate.estimated_final_size);

  const [timeEstimateHumanizedLow, timeEstimateHumanizedHigh] = [
    moment.duration({ seconds: estimate.estimated_download_time_best_case }).humanize(),
    moment.duration({ seconds: estimate.estimated_download_time_worst_case }).humanize()
  ];

  const timeEstimateRendered =
    timeEstimateHumanizedLow == timeEstimateHumanizedHigh
      ? timeEstimateHumanizedLow
      : `${timeEstimateHumanizedLow} to ${timeEstimateHumanizedHigh}`;

  useEffect(() => {
    switch (thresholdRange) {
      case null:
      case thresholds.GREEN:
        setClassName('green');
        break;
      case thresholds.ORANGE:
        setClassName('orange');
        break;
      case thresholds.RED:
        setClassName('red');
        break;
      case thresholds.DEEP_RED:
        setClassName('deep-red');
        break;
    }
  }, [thresholdRange]);

  return (
    <div className={'estimateDetails'}>
      <h3>Download Estimates</h3>
      <dl>
        <dt>Area</dt>
        <dd>{estimate.area_km2} km²</dd>

        <dt>Zoom Level</dt>
        <dd>{estimate.maximum_zoom}</dd>

        <dt>Tile Count</dt>
        <dd>{estimate.total_tile_count.toLocaleString()}</dd>

        <dt>Estimated Size</dt>
        <dd className={className}>{convertBytesToReadableString(estimate.estimated_final_size)}</dd>

        <dt>Estimated Processing Time</dt>
        <dd>{timeEstimateRendered}</dd>
      </dl>
    </div>
  );
};

export default MapDownloadEstimate;
