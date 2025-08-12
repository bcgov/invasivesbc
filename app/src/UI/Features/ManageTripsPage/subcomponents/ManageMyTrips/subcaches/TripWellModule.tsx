import { IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';
import TripStatusHandler from './TripStatusHandler';
import { useDispatch } from 'utils/use_selector';
import bbox from '@turf/bbox';
import WellCache from 'state/actions/cache/WellCache';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const TripWellModule = ({ trip }: PropTypes) => {
  const handleDelete = () => dispatch(PlanMyTrip.removeSubCache({ id: trip.id, cache: 'wellData' }));
  const handleStartDownload = () => {
    const [minX, minY, maxX, maxY] = bbox(trip.geojson);
    const bounds = {
      minLatitude: minY,
      maxLatitude: maxY,
      minLongitude: minX,
      maxLongitude: maxX
    };
    dispatch(WellCache.requestCaching({ id: trip.id, bounds: bounds }));
  };

  const dispatch = useDispatch();

  return (
    <TripStatusHandler
      status={trip.cacheStatuses.wellData}
      handleDelete={handleDelete}
      handleRestartDownload={handleStartDownload}
      handleStop={handleDelete}
      handleStartDownload={handleStartDownload}
    />
  );
};

export default TripWellModule;
