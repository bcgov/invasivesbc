import {
  IPlanMyTripCacheStatuses,
  IPlanMyTripRepositoryMetadata,
  PlanMyTripCacheService
} from 'utils/plan-my-trip-cache';
import PmtCacheStatus from '../PmtCacheStatus';
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'utils/use_selector';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import TileCache from 'state/actions/cache/TileCache';

const ManageTrips = () => {
  const [trips, setTrips] = useState<IPlanMyTripRepositoryMetadata[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const lastUpdate = useSelector((state) => state.PlanMyTrip?.lastUpdate);
  const service = useRef<PlanMyTripCacheService>();
  const removeSubCache = (id: string, cache: keyof IPlanMyTripCacheStatuses) => {
    dispatch(PlanMyTrip.removeSubCache({ id, cache }));
  };
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      if (!service.current) return;
      await service.current.listRepositories().then((trips) => {
        setTrips([...trips]);
      });
    })();
  }, [lastUpdate, ready]);

  const deleteTrip = (id: string) => {
    dispatch(PlanMyTrip.delete(id));
  };

  useEffect(() => {
    dispatch(TileCache.clearTileCacheShape());
    dispatch(PlanMyTrip.clearShape());
  }, []);

  useEffect(() => {
    if (service?.current) return;
    (async () => {
      service.current = await PlanMyTripCacheServiceFactory.getPlatformInstance();
      setReady(service.current != undefined);
    })();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2>Repos</h2>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {trips.length === 0 && <p>No Trips available</p>}
        {trips.map((trip) => (
          <div key={trip.id} style={{ border: '1pt solid black', margin: 5, padding: 5, width: 450 }}>
            <p>Trip Name: {trip.name}</p>
            <div>
              Offline Storage Status:
              {Object.keys(trip.cacheStatuses).map((key) => (
                <PmtCacheStatus
                  trip={trip}
                  onRemove={removeSubCache}
                  cacheKey={key as keyof IPlanMyTripCacheStatuses}
                  key={key}
                />
              ))}
              <Button sx={{ mt: 3, mb: 1 }} color="error" onClick={() => deleteTrip(trip.id)}>
                Delete
                <Delete />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageTrips;
