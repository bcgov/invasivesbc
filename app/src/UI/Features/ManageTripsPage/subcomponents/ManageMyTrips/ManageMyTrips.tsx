import { useEffect, useState } from 'react';
import './manageMyTrips.css';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { IPlanMyTripRepositoryMetadata, PlanMyTripCacheService } from 'utils/plan-my-trip-cache';
import { useSelector } from 'utils/use_selector';
import MyTrip from './subcaches/MyTrip';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { TileCacheDownloadProgress } from 'UI/Features/TileCache/TileCacheDownloadProgress';
import { Downloading } from '@mui/icons-material';
import EmptyCollection from 'UI/Features/LegacyMap/LayerPicker/EmptyCollection/EmptyCollection';

const ManageMyTrips = () => {
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
    <div id="manage-my-trips">
      <div className="my-trips">
        <h2>My Trips</h2>
        <p>These are the trips you currently have planned</p>
        {repositories.map((r) => (
          <MyTrip trip={r} key={r.id} />
        ))}
        {repositories.length === 0 && <EmptyCollection text="You have no trips planned" />}
      </div>
      <div className="downloads">
        <h2>Map Downloads</h2>
        <p>Monitor active downloads and progress in this section.</p>
        <Accordion title="Map Download Progress" icon={<Downloading />}>
          <TileCacheDownloadProgress />
        </Accordion>
      </div>
    </div>
  );
};
export default ManageMyTrips;
