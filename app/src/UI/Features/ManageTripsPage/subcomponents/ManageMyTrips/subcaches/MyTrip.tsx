import { ManageSearch, Luggage, WaterDrop, Map } from '@mui/icons-material';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';
import TripRecordsetModule from './TripRecordsetModule';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import TripMapTileModule from './TripMapTileModule';
import TripWellModule from './TripWellModule';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};

const MyTrip = ({ trip }: PropTypes) => {
  return (
    <section className="trip-main">
      <Accordion title={trip.name} icon={<Luggage />}>
        <p>{trip.id}</p>
      </Accordion>
      <ul>
        <li>
          <div>
            <Map /> Offline Maps
          </div>
          <TripMapTileModule trip={trip} />
        </li>
        <li>
          <div>
            <WaterDrop />
            Well Data
          </div>
          <TripWellModule trip={trip} />
        </li>
        <li>
          <div>
            <ManageSearch /> InvasivesBC Recordset
          </div>
          <TripRecordsetModule
            trip={trip}
            cacheKey={'activityRecordset'}
            id={PlanMyTrip.Recordset.ACTIVITY_PRE + trip.id}
            status={trip.cacheStatuses.activityRecordset}
          />
        </li>
        <li>
          <div>
            <ManageSearch />
            IAPP Recordset
          </div>
          <TripRecordsetModule
            trip={trip}
            cacheKey={'iappRecordset'}
            id={PlanMyTrip.Recordset.IAPP_PRE + trip.id}
            status={trip.cacheStatuses.iappRecordset}
          />
        </li>
      </ul>
    </section>
  );
};

export default MyTrip;
