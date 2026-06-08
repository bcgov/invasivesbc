import { useEffect, useState } from 'react';
import './TripList.css';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { IPlanMyTripRepositoryMetadata, PlanMyTripCacheService } from 'utils/plan-my-trip-cache';
import { useSelector } from 'utils/use_selector';
import TripView from 'UI/Features/ManageTripsPage/subcomponents/Shared/TripView';
import EmptyCollection from 'UI/Features/LegacyMap/LayerPicker/EmptyCollection/EmptyCollection';

const TripList = () => {
  const lastUpdate = useSelector((state) => state.PlanMyTrip?.lastUpdate);

  const [tripService, setTripService] = useState<PlanMyTripCacheService>();
  const [repositories, setRepositories] = useState<IPlanMyTripRepositoryMetadata[]>([]);

  // Update Repositories when changes noted or service ready
  useEffect(() => {
    if (!tripService) return;
    (async () => {
      const repositories = await tripService.listRepositories();
      setRepositories(repositories);
    })();
  }, [tripService, lastUpdate]);

  // Get Service on Page load
  useEffect(() => {
    (async () => {
      const service = await PlanMyTripCacheServiceFactory.getPlatformInstance();
      setTripService(service);
    })();
  }, []);

  return (
    <div className="my-trips">
      <h2>My Trips</h2>
      <p>These are the trips you currently have planned</p>
      {repositories.map((r) => (
        <TripView trip={r} key={r.id} />
      ))}
      {repositories.length === 0 && <EmptyCollection text="You have no trips planned" />}
    </div>
  );
};
export default TripList;
