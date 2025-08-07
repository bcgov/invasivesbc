import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { IPlanMyTripRepositoryMetadata, PlanMyTripCacheService } from 'utils/plan-my-trip-cache';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { useDispatch, useSelector } from 'utils/use_selector';
import LpPlanMyTripOption from './LpPlanMyTripOption';
import './lpPlanMyTrip.css';
import EmptyCollection from '../EmptyCollection/EmptyCollection';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import TileCache from 'state/actions/cache/TileCache';

type PropTypes = {
  closePicker: () => void;
};

const LpPlanMyTrip = ({ closePicker }: PropTypes) => {
  const TRIP_TOOLTIP = 'Easily access and manage layers relevant to your trip in one place.';

  const dispatch = useDispatch();

  const tripRef = useRef<PlanMyTripCacheService>();

  const lastUpdate = useSelector((state) => state.PlanMyTrip?.lastUpdate);

  const [trips, setTrips] = useState<IPlanMyTripRepositoryMetadata[]>([]);
  const [ready, setReady] = useState<boolean>();

  useEffect(() => {
    (async () => {
      if (!tripRef.current) return;
      await tripRef.current.listRepositories().then((trips) => {
        setTrips([...trips]);
      });
    })();
  }, [ready, lastUpdate]);

  useEffect(() => {
    if (tripRef?.current) return;
    (async () => {
      tripRef.current = await PlanMyTripCacheServiceFactory.getPlatformInstance();
      setReady(tripRef.current != undefined);
      dispatch(TileCache.repositoryList()); // Ensure TileCache repository is running when this option is used.
    })();
  }, []);

  return (
    <div id="lp-plan-my-trip">
      <h3>
        My Trips <TooltipWithIcon tooltipText={TRIP_TOOLTIP} />
      </h3>
      {trips.length > 0 ? (
        <div>
          {trips.map((t) => (
            <LpPlanMyTripOption key={t.id} trip={t} />
          ))}
        </div>
      ) : (
        <EmptyCollection text="You do not have any trips booked." />
      )}
      <nav className="control">
        <Link to="/ManageTrips" onClick={closePicker}>
          Go to Manage Trips
        </Link>
      </nav>
    </div>
  );
};
export default LpPlanMyTrip;
