import {
  IPlanMyTripCacheStatus,
  IPlanMyTripCacheStatuses,
  IPlanMyTripRepositoryMetadata
} from 'utils/plan-my-trip-cache';
import { useDispatch, useSelector } from 'utils/use_selector';
import TripStatusHandler from 'UI/Features/ManageTripsPage/subcomponents/Shared/TripStatusHandler';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import RecordCache from 'state/actions/cache/RecordCache';
import { RecordSetType } from 'interfaces/UserRecordSet';

type PropTypes = {
  id: string;
  status: IPlanMyTripCacheStatus;
  cacheKey: keyof IPlanMyTripCacheStatuses;
  trip: IPlanMyTripRepositoryMetadata;
};

const TripRecordsetModule = ({ status, id, cacheKey, trip }: PropTypes) => {
  const handleDelete = () => dispatch(PlanMyTrip.removeSubCache({ id: trip.id, cache: cacheKey }));
  const handleRestartDownload = () => dispatch(RecordCache.pauseDownload({ setId: id }));
  const handleStop = () => RecordCache.stopDownload({ setId: id });
  const handleStartDownload = () => {
    if (doesRecordsetExist) {
      dispatch(RecordCache.requestCaching({ setId: id }));
    } else {
      const recordSetType = cacheKey === 'activityRecordset' ? RecordSetType.Activity : RecordSetType.IAPP;
      dispatch(
        PlanMyTrip.Recordset.create({
          tripId: trip.id,
          recordSetType: recordSetType,
          recordName: trip.name,
          geojson: trip.geojson
        })
      );
    }
  };

  const doesRecordsetExist = useSelector((state) => !!state.UserSettings.recordSets?.[id]);

  const dispatch = useDispatch();

  return (
    <TripStatusHandler
      status={status}
      handleDelete={handleDelete}
      handleRestartDownload={handleRestartDownload}
      handleStop={handleStop}
      handleStartDownload={handleStartDownload}
    />
  );
};

export default TripRecordsetModule;
