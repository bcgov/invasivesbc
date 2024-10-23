import { Link } from 'react-router-dom';
import { useSelector } from 'utils/use_selector';
import './LpRecordSet.css';
import LpRecordSetOption from './LpRecordSetOption';
import { nanoid } from '@reduxjs/toolkit';

type PropTypes = {
  closePicker: () => void;
};

const LpRecordSet = ({ closePicker }: PropTypes) => {
  const DEFAULT_RECORD_SETS = ['1', '2', '3'];
  const handleGoToRecords = () => {
    closePicker();
  };
  const recordSets = useSelector((state) => state.UserSettings?.recordSets);
  const defaultRecordSets: Record<string, any>[] = [];
  const customRecordSets: Record<string, any>[] = [];
  Object.keys(recordSets).forEach((recordSet) => {
    if (DEFAULT_RECORD_SETS.includes(recordSet)) {
      defaultRecordSets.push(recordSets[recordSet]);
    } else {
      customRecordSets.push(recordSets[recordSet]);
    }
  });
  console.log(customRecordSets);
  return (
    <div id="lp-record-set">
      <h3>Default Recordsets</h3>
      <ul className="">
        {defaultRecordSets.map((recordSet, index) => (
          <LpRecordSetOption
            canColour={false}
            key={nanoid()}
            recordSet={recordSet}
            lastChild={Object.keys(recordSets).length - 1 === index}
          />
        ))}
      </ul>
      <h3>Custom Recordsets</h3>
      <ul className="">
        {customRecordSets.map((recordSet, index) => (
          <LpRecordSetOption
            canColour={false}
            key={nanoid()}
            recordSet={recordSet}
            lastChild={Object.keys(recordSets).length - 1 === index}
          />
        ))}
      </ul>
      <Link to="/Records" onClick={handleGoToRecords}>
        Go To Records
      </Link>
    </div>
  );
};

export default LpRecordSet;
