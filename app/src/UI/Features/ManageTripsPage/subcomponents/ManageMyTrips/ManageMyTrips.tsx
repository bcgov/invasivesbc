import { useEffect, useRef, useState } from 'react';
import './ManageMyTrips.css';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { IPlanMyTripRepositoryMetadata, PlanMyTripCacheService } from 'utils/plan-my-trip-cache';
import { useSelector } from 'utils/use_selector';
import MyTrip from './subcaches/MyTrip';

const ManageMyTrips = () => {
  const [tripService, setTripService] = useState<PlanMyTripCacheService>();
  const [repositories, setRepositories] = useState<IPlanMyTripRepositoryMetadata[]>([]);
  const lastUpdate = useSelector((state) => state.PlanMyTrip?.lastUpdate);
  console.log(repositories, tripService);

  useEffect(() => {
    if (!tripService) return;
    (async () => {
      const repositories = await tripService.listRepositories();
      setRepositories(repositories);
    })();
  }, [tripService, lastUpdate]);

  useEffect(() => {
    (async () => {
      const service = await PlanMyTripCacheServiceFactory.getPlatformInstance();
      setTripService(service);
    })();
  }, []);

  return (
    <div id="manage-my-trips">
      <h2>My Trips</h2>
      {repositories.map((r) => (
        <MyTrip trip={r} key={r.id} />
      ))}
    </div>
  );
};
export default ManageMyTrips;
