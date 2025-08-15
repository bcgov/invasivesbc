import { IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';
import { useDispatch } from 'utils/use_selector';
import TripStatusHandler from './TripStatusHandler';
import MapSlider from 'UI/Features/TileCache/MapSlider';
import { Save } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useState } from 'react';
import { AVAILABLE_ZOOMS } from 'UI/Features/TileCache/constants';
import bbox from '@turf/bbox';
import TileCache from 'state/actions/cache/TileCache';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';

interface PropTypes {
  trip: IPlanMyTripRepositoryMetadata;
}
const TripMapTileModule = ({ trip }: PropTypes) => {
  const handleDelete = () => dispatch(PlanMyTrip.removeSubCache({ id: trip.id, cache: 'mapTiles' }));
  const handleStartDownload = () => {
    const [minX, minY, maxX, maxY] = bbox(trip.geojson);
    const bounds: RepositoryBoundingBoxSpec = {
      minLatitude: minY,
      maxLatitude: maxY,
      minLongitude: minX,
      maxLongitude: maxX
    };
    dispatch(
      TileCache.requestCaching({
        description: trip.name,
        id: trip.id,
        bounds: bounds,
        maxZoom: zoom
      })
    );
  };
  const [zoom, setZoom] = useState<number>(AVAILABLE_ZOOMS[0].value);

  const dispatch = useDispatch();
  return (
    <TripStatusHandler
      status={trip.cacheStatuses.mapTiles}
      handleRestartDownload={handleStartDownload}
      handleDelete={handleDelete}
      handleStop={handleDelete}
      downloadSpecsOverride={
        <div className="trip-map-module-download">
          <MapSlider drawnShape={trip.geojson} zoom={zoom} setZoom={setZoom} />
          <Button color="primary" variant="outlined" className="tmmd-button" onClick={handleStartDownload}>
            <Save />
            &nbsp;Download
          </Button>
        </div>
      }
    />
  );
};

export default TripMapTileModule;
