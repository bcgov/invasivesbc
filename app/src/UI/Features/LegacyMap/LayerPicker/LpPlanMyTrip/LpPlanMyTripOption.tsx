import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import RecordSetControl from 'UI/Features/Records/RecordSetControl';
import OfflineMapControls from 'UI/Reusable/OfflineMapControls/OfflineMapControls';
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
  return (
    <div className="lp-plan-my-trip-option">
      <h4>{trip.name}</h4>
      <ul className="option-list">
        {ibcRecordset && (
          <>
            <li className="row">
              <p>InvasiveBC Recordset</p>
              <RecordSetControl
                isDefaultRecordset={false}
                recordset={ibcRecordset}
                omit={{ cache: true, delete: true }}
              />
            </li>
          </>
        )}
        {iappRecordset && (
          <>
            <hr />
            <li>
              <p>IAPP Recordset</p>
              <RecordSetControl
                isDefaultRecordset={false}
                recordset={iappRecordset}
                omit={{ cache: true, delete: true }}
              />
            </li>
          </>
        )}
        {trip.cacheStatuses.mapTiles === IPlanMyTripCacheStatus.CACHED && (
          <>
            <hr />
            <li>
              <p>Offline Maps</p>
              <OfflineMapControls id={trip.id} omit={{ delete: true }} />
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default LpPlanMyTripOption;
