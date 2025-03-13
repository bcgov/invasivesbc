import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'utils/use_selector';
import './LpRecordSet.css';
import LpRecordSetOption from './LpRecordSetOption';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetId, UserRecordSet } from 'interfaces/UserRecordSet';
import filterRecordsetsByNetworkState from 'utils/filterRecordsetsByNetworkState';
import { MOBILE } from 'state/build-time-config';
import Activity from 'state/actions/activity/Activity';
type PropTypes = {
  closePicker: () => void;
};

const LpRecordSet = ({ closePicker }: PropTypes) => {
  const defaultRecordSetIds = Object.values(RecordSetId) as string[];

  const handleGoToRecords = () => {
    closePicker();
  };
  const handleToggleVisibility = (id: string) => {
    if (id === RecordSetId.OfflineActivities) {
      dispatch(Activity.Offline.setAllShapeVisibility());
    }

    dispatch(UserSettings.RecordSet.toggleVisibility(id));
  };
  const handleCycleColour = (id: string) => dispatch(UserSettings.RecordSet.cycleColourById(id));
  const handleToggleLabels = (id: string) => {
    if (id === RecordSetId.OfflineActivities) {
      dispatch(Activity.Offline.setLabelVisibility());
    }
    dispatch(UserSettings.RecordSet.toggleLabelVisibility(id));
  };
  const connected = useSelector((state) => state.Network.connected);
  const recordSets = useSelector((state) => state.UserSettings?.recordSets);
  const defaultRecordSets: UserRecordSet[] = [];
  const customRecordSets: UserRecordSet[] = [];

  const dispatch = useDispatch();
  const userIsMobileAndOffline = MOBILE && !connected;
  filterRecordsetsByNetworkState(recordSets, userIsMobileAndOffline).forEach((recordSet) => {
    if (defaultRecordSetIds.includes(recordSet)) {
      defaultRecordSets.push({ ...recordSets[recordSet], id: recordSet });
    } else {
      customRecordSets.push({ ...recordSets[recordSet], id: recordSet });
    }
  });

  return (
    <div id="lp-record-set">
      <h3>Default Recordsets</h3>
      <ul>
        {defaultRecordSets.map((recordSet, index) => (
          <LpRecordSetOption
            canColour={false}
            cycleColour={handleCycleColour}
            key={recordSet.id}
            lastChild={index === defaultRecordSets.length - 1}
            recordSet={recordSet}
            toggleLabelVisibility={handleToggleLabels}
            toggleVisibility={handleToggleVisibility}
          />
        ))}
      </ul>
      {customRecordSets.length > 0 && <h3>Custom Recordsets</h3>}
      <ul>
        {customRecordSets.map((recordSet, index) => (
          <LpRecordSetOption
            canColour={true}
            cycleColour={handleCycleColour}
            key={recordSet.id}
            lastChild={index === customRecordSets.length - 1}
            recordSet={recordSet}
            toggleLabelVisibility={handleToggleLabels}
            toggleVisibility={handleToggleVisibility}
          />
        ))}
      </ul>

      <div className="guide">
        <p>You can modify or create new Recordsets from the Records page. </p>
        <Link to="/Records" onClick={handleGoToRecords}>
          Go To Records
        </Link>
      </div>
    </div>
  );
};

export default LpRecordSet;
