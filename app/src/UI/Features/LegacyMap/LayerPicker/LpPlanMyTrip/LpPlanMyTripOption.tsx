import { UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import RecordSetControl from 'UI/Features/Records/RecordSetControl';
import OfflineMapControls from 'UI/Reusable/OfflineMapControls/OfflineMapControls';
import Spacer from 'UI/Reusable/Spacer/Spacer';
import { IPlanMyTripCacheStatus, IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';
import { useSelector } from 'utils/use_selector';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const LpPlanMyTripOption = ({ trip }: PropTypes) => {
  const ibcRecordset = useSelector(
    (state) => state.UserSettings.recordSets?.[PlanMyTrip.Recordset.ACTIVITY_PRE + trip.id]
  );
  const iappRecordset = useSelector(
    (state) => state.UserSettings.recordSets?.[PlanMyTrip.Recordset.IAPP_PRE + trip.id]
  );
  const online = useSelector((state) => state.Network.connected);

  const canIbcRender = (online && !!ibcRecordset) || ibcRecordset?.cacheMetadataStatus === UserRecordCacheStatus.CACHED;
  const canIappRender =
    (online && !!iappRecordset) || iappRecordset?.cacheMetadataStatus === UserRecordCacheStatus.CACHED;
  const canOfflineMapsRender = trip.cacheStatuses.mapTiles === IPlanMyTripCacheStatus.CACHED;
  return (
    <div className="lp-plan-my-trip-option">
      <h4>{trip.name}</h4>
      <ul className="option-list">
        {canIbcRender && (
          <li className="row">
            <RecordSetControl isDefaultRecordset={false} recordset={ibcRecordset} hideCache hideDelete hideColour />
            <p>Activity Recordset</p>
          </li>
        )}
        {canIappRender && (
          <>
            <hr />
            <li>
              <RecordSetControl isDefaultRecordset={false} recordset={iappRecordset} hideCache hideDelete hideColour />
              <p>IAPP Recordset</p>
            </li>
          </>
        )}
        {canOfflineMapsRender && (
          <>
            <hr />
            <li>
              <OfflineMapControls id={trip.id} name={trip.name} />
              <Spacer x={40} y={40} />
              <p>Offline Maps</p>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default LpPlanMyTripOption;
