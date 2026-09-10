import { IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';
import TripStatusHandler from 'UI/Features/ManageTripsPage/subcomponents/Shared/TripStatusHandler';
import { useDispatch } from 'utils/use_selector';
import WellCache from 'state/actions/cache/WellCache';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const TripWellModule = ({ trip }: PropTypes) => {
  const handleDelete = () => dispatch(PlanMyTrip.removeSubCache({ id: trip.id, cache: 'wellData' }));
  const handleStartDownload = () => {
    if (trip?.geojson?.bbox) {
      dispatch(WellCache.requestCaching({ id: trip.id, bounds: trip.geojson.bbox }));
    }
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
