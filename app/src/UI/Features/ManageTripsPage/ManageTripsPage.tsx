import { useEffect, useRef, useState } from 'react';
import TileCache from 'state/actions/cache/TileCache';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import {
  IPlanMyTripCacheStatuses,
  IPlanMyTripRepositoryMetadata,
  PlanMyTripCacheService
} from 'utils/plan-my-trip-cache';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { useDispatch, useSelector } from 'utils/use_selector';
import PmtCacheStatus from './subcomponents/PmtCacheStatus';
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import Accordion from 'UI/Reusable/Accordion/Accordion';

const ManageTripsPage = () => {
  const service = useRef<PlanMyTripCacheService>();
  const dispatch = useDispatch();

  const bounds = useSelector((state) => state.TileCache?.drawnShapeBounds);
  const drawnShape = useSelector((state) => state.PlanMyTrip?.drawnShape);
  const [trips, setTrips] = useState<IPlanMyTripRepositoryMetadata[]>([]);
  const [tripName, setTripName] = useState<string>('');
  const lastUpdate = useSelector((state) => state.PlanMyTrip?.lastUpdate);

  const addTrip = () => {
    (async () => {
      const name = tripName;
      setTripName('');
      await dispatch(
        PlanMyTrip.create({
          name: name,
          wellData: true,
          zoom: 5,
          iapp: true,
          activities: true
        })
      );
    })();
  };

  const removeSubCache = (id: string, cache: keyof IPlanMyTripCacheStatuses) => {
    dispatch(PlanMyTrip.removeSubCache({ id, cache }));
  };

  useEffect(() => {
    (async () => {
      if (!service.current) return;
      await service.current.listRepositories().then((trips) => {
        setTrips([...trips]);
      });
    })();
  }, [lastUpdate, service.current]);

  const deleteTrip = (id: string) => {
    dispatch(PlanMyTrip.delete(id));
  };
  useEffect(() => {
    if (service.current) return;
    (async () => {
      service.current = await PlanMyTripCacheServiceFactory.getPlatformInstance();
    })();
  }, []);

  useEffect(() => {
    dispatch(TileCache.setMapTileCacheMode(true));
    return () => {
      dispatch(TileCache.setMapTileCacheMode(false));
    };
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
          <p>Add a Repo</p>
          <input type="text" placeholder="Name" value={tripName} onChange={(e) => setTripName(e.target.value)} />
          <button onClick={addTrip} disabled={tripName.length === 0}>
            Add One
          </button>
        </div>
        <h2>Shape</h2>
        <div
          style={{
            display: 'flex',
            width: '100vw',
            boxSizing: 'border-box',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ width: '400px', textWrap: 'wrap', wordBreak: 'break-word' }}>
            <Accordion title="shapes">
              <p>
                <b>Bounds:</b> {JSON.stringify(bounds)}
              </p>
              <p>
                <b>Original Shape:</b> {JSON.stringify(drawnShape) ?? 'null'}
              </p>
            </Accordion>
          </div>
        </div>
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
    </div>
  );
};

export default ManageTripsPage;
