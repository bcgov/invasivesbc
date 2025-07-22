import { useEffect, useRef, useState } from 'react';
import TileCache from 'state/actions/cache/TileCache';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import { IPlanMyTripCacheStatuses, PlanMyTripCacheService } from 'utils/plan-my-trip-cache';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { useDispatch, useSelector } from 'utils/use_selector';
import PmtCacheStatus from './subcomponents/PmtCacheStatus';

const ManageTripsPage = () => {
  const service = useRef<PlanMyTripCacheService>();
  const dispatch = useDispatch();

  const bounds = useSelector((state) => state.TileCache?.drawnShapeBounds);
  const drawnShape = useSelector((state) => state.PlanMyTrip?.drawnShape);
  const [trips, setTrips] = useState<any[]>([]);
  const [tripName, setTripName] = useState<string>('');

  const addTrip = () => {
    (async () => {
      const name = tripName;
      setTripName('');
      await dispatch(
        PlanMyTrip.create({
          name: name,
          wellData: true,
          zoom: 5
        })
      );
      getAllTrips();
    })();
  };

  const removeSubCache = (id: string, cache: keyof IPlanMyTripCacheStatuses) => {
    (async () => {
      const response = await dispatch(PlanMyTrip.removeSubCache({ id, cache }));
      if (response.meta.requestStatus === 'fulfilled') getAllTrips();
    })();
  };
  const getAllTrips = () => {
    (async () => {
      if (!service.current) return;
      await service.current.listRepositories().then((trips) => {
        setTrips(structuredClone(trips));
      });
    })();
  };

  const deleteTrip = (id: string) => {
    (async () => {
      if (service.current) {
        await dispatch(PlanMyTrip.delete(id));
        getAllTrips();
      }
    })();
  };
  useEffect(() => {
    if (service.current) return;
    (async () => {
      service.current = await PlanMyTripCacheServiceFactory.getPlatformInstance();
      getAllTrips();
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
        <p>Cache Service Status: {service.current != null ? 'Ready' : 'Not Ready'}</p>
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
            <p>
              <b>Bounds:</b> {JSON.stringify(bounds)}
            </p>
            <p>
              <b>Original Shape:</b> {JSON.stringify(drawnShape) ?? 'null'}
            </p>
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
                <button style={{ backgroundColor: 'darkred', color: 'white' }} onClick={() => deleteTrip(trip.id)}>
                  Delete This Cache
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageTripsPage;
