import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'utils/use_selector';
import './LpRecordSet.css';
import LpRecordSetOption from './LpRecordSetOption';
import { nanoid } from '@reduxjs/toolkit';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { UserRecordSet } from 'interfaces/UserRecordSet';

type PropTypes = {
  closePicker: () => void;
};

const LpRecordSet = ({ closePicker }: PropTypes) => {
  const DEFAULT_RECORD_TYPES = ['1', '2', '3'];
  const handleGoToRecords = () => {
    closePicker();
  };
  const handleToggleVisibility = (id: string) => dispatch(UserSettings.RecordSet.toggleVisibility(id));
  const handleCycleColour = (id: string) => dispatch(UserSettings.RecordSet.cycleColourById(id));
  const handleToggleLabels = (id: string) => dispatch(UserSettings.RecordSet.toggleLabelVisibility(id));
  const recordSets = useSelector((state) => state.UserSettings?.recordSets);
  const defaultRecordSets: UserRecordSet[] = [];
  const customRecordSets: UserRecordSet[] = [];

  const dispatch = useDispatch();
  Object.keys(recordSets).forEach((recordSet) => {
    if (DEFAULT_RECORD_TYPES.includes(recordSet)) {
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
            key={nanoid()}
            lastChild={index === defaultRecordSets.length - 1}
            recordSet={recordSet}
            toggleLabelVisibility={handleToggleLabels}
            toggleVisibility={handleToggleVisibility}
          />
        ))}
      </ul>
      <h3>Custom Recordsets</h3>
      <ul>
        {customRecordSets.map((recordSet, index) => (
          <LpRecordSetOption
            canColour={true}
            cycleColour={handleCycleColour}
            key={nanoid()}
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
