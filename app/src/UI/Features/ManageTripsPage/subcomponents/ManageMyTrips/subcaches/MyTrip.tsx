import { Delete } from '@mui/icons-material';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';
import TripRecordsetModule from './TripRecordsetModule';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import TripMapTileModule from './TripMapTileModule';
import TripWellModule from './TripWellModule';
import { Button } from '@mui/material';
import { useDispatch } from 'utils/use_selector';
import MyTripAtAGlance from './MyTripAtAGlance';
import {
  IappRecordsetIcon,
  InvasivesRecordsetIcon,
  OfflineMapIcon,
  WellIcon
} from 'UI/Features/ManageTripsPage/iconography';
import Prompt from 'state/actions/prompts/Prompt';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};

const MyTrip = ({ trip }: PropTypes) => {
  const dispatch = useDispatch();
  const handleDeleteTrip = () => {
    dispatch(
      Prompt.confirmation({
        title: `Delete Trip ${trip.name}`,
        prompt: `Are you sure you want to delete your trip "${trip.name}". You'll no longer be able to access this data while offline.`,
        callback: (confirm: boolean) => {
          if (confirm) dispatch(PlanMyTrip.delete(trip.id));
        }
      })
    );
  };
  return (
    <div className="trip-main">
      <Accordion title={trip.name} icon={<MyTripAtAGlance statuses={trip.cacheStatuses} />}>
        <ul>
          <li className="trip-invasives trip-option">
            <div className="cache-status">
              <InvasivesRecordsetIcon />
              <p>
                InvasivesBC Recordset:&nbsp;
                <span className="emphasis">{trip.cacheStatuses.activityRecordset}</span>
              </p>
            </div>
            <TripRecordsetModule
              trip={trip}
              cacheKey={'activityRecordset'}
              id={PlanMyTrip.Recordset.ACTIVITY_PRE + trip.id}
              status={trip.cacheStatuses.activityRecordset}
            />
          </li>
          <li className="trip-iapp trip-option">
            <div className="cache-status">
              <IappRecordsetIcon />
              <p>
                IAPP Recordset: <span className="emphasis">{trip.cacheStatuses.iappRecordset}</span>
              </p>
            </div>
            <TripRecordsetModule
              trip={trip}
              cacheKey={'iappRecordset'}
              id={PlanMyTrip.Recordset.IAPP_PRE + trip.id}
              status={trip.cacheStatuses.iappRecordset}
            />
          </li>
          <li>
            <div className="cache-status">
              <WellIcon />
              <p>
                Well Data:&nbsp;
                <span className="emphasis">{trip.cacheStatuses.wellData}</span>
              </p>
            </div>
            <TripWellModule trip={trip} />
          </li>
          <li className="trip-maps trip-option">
            <div className="cache-status">
              <OfflineMapIcon />{' '}
              <p>
                Offline Maps:&nbsp; <span className="emphasis">{trip.cacheStatuses.mapTiles}</span>
              </p>
            </div>
            <TripMapTileModule trip={trip} />
          </li>
          <li className="delete-trip trip-option">
            <Button color={'error'} onClick={handleDeleteTrip}>
              Delete This Trip <Delete />
            </Button>
          </li>
        </ul>
      </Accordion>
    </div>
  );
};

export default MyTrip;
