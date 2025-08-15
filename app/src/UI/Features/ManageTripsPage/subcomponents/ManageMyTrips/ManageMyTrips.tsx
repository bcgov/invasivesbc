import { useEffect, useState } from 'react';
import './manageMyTrips.css';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { IPlanMyTripRepositoryMetadata, PlanMyTripCacheService } from 'utils/plan-my-trip-cache';
import { useSelector } from 'utils/use_selector';
import MyTrip from './subcaches/MyTrip';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { TileCacheDownloadProgress } from 'UI/Features/TileCache/TileCacheDownloadProgress/TileCacheDownloadProgress';
import { Downloading, SdStorage } from '@mui/icons-material';
import EmptyCollection from 'UI/Features/LegacyMap/LayerPicker/EmptyCollection/EmptyCollection';
import { TileCacheList } from 'UI/Features/TileCache/TileCacheList/TileCacheList';

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
      <div className="map-downloads">
        <h2>Map Downloads</h2>
        <p>Monitor active downloads and progress in this section.</p>
        <Accordion title="Download Progress" icon={<Downloading />}>
          <h3>Download Progress</h3>
          <p>Check the status of caches being downloaded for offline access.</p>
          <TileCacheDownloadProgress />
        </Accordion>
        <Accordion title="Downloaded Maps" icon={<SdStorage />}>
          <h3>Downloaded Maps</h3>
          <p>These caches are currently saved on your device</p>
          <TileCacheList />
        </Accordion>
      </div>
    </div>
  );
};
export default ManageMyTrips;
