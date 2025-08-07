import { Link } from 'react-router-dom';
import { useSelector } from 'utils/use_selector';
import './LpRecordSet.css';
import LpRecordSetOption from './LpRecordSetOption';
import { RecordSetId, UserRecordSet } from 'interfaces/UserRecordSet';
import filterRecordsetsByNetworkState from 'utils/filterRecordsetsByNetworkState';
import { useEffect, useState } from 'react';

type PropTypes = {
  closePicker: () => void;
};

const LpRecordSet = ({ closePicker }: PropTypes) => {
  const defaultRecordSetIds = Object.values(RecordSetId) as string[];

  const handleGoToRecords = () => {
    closePicker();
  };

  const connected = useSelector((state) => state.Network.connected);
  const { MOBILE } = useSelector((state) => state.Configuration.current.build);
  const recordSets = useSelector((state) => state.UserSettings.recordSets);

  const [defaultRecordSets, setDefaultRecordSets] = useState<UserRecordSet[]>([]);
  const [customRecordSets, setCustomRecordSets] = useState<UserRecordSet[]>([]);

  const [userIsMobileAndOffline, setUserIsMobileAndOffline] = useState(false);

  useEffect(() => {
    if (MOBILE && !connected) {
      setUserIsMobileAndOffline(true);
    } else {
      setUserIsMobileAndOffline(false);
    }
  }, [connected]);

  useEffect(() => {
    const newDefaultRecordSets: UserRecordSet[] = [];
    const newCustomRecordSets: UserRecordSet[] = [];

    filterRecordsetsByNetworkState(recordSets, userIsMobileAndOffline).forEach((recordSet) => {
      if (defaultRecordSetIds.includes(recordSet)) {
        newDefaultRecordSets.push({ ...recordSets[recordSet], id: recordSet });
      } else {
        newCustomRecordSets.push({ ...recordSets[recordSet], id: recordSet });
      }
    });

    setDefaultRecordSets(newDefaultRecordSets);
    setCustomRecordSets(newCustomRecordSets);
  }, [userIsMobileAndOffline, recordSets]);

  return (
    <div id="lp-record-set">
      <h3>Default Recordsets</h3>
      <ul>
        {defaultRecordSets.map((recordSet, index) => (
          <LpRecordSetOption
            isDefaultRecordset={false}
            key={recordSet.id}
            lastChild={index === defaultRecordSets.length - 1}
            recordSet={recordSet}
          />
        ))}
      </ul>
      {customRecordSets.length > 0 && <h3>Custom Recordsets</h3>}
      <ul>
        {customRecordSets.map((recordSet, index) => (
          <LpRecordSetOption
            isDefaultRecordset={true}
            key={recordSet.id}
            lastChild={index === customRecordSets.length - 1}
            recordSet={recordSet}
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
