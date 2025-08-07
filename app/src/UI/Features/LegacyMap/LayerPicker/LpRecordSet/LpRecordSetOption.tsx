import { UserRecordSet } from 'interfaces/UserRecordSet';
import RecordSetControl from 'UI/Features/Records/RecordSetControl';

type PropTypes = {
  recordSet: UserRecordSet;
  lastChild: boolean;
  isDefaultRecordset: boolean;
};

const LpRecordSetOption = ({ recordSet, lastChild, isDefaultRecordset }: PropTypes) => {
  const getBgColor = () => (recordSet?.color ? `${recordSet.color}25` : 'white');
  return (
    <>
      <li data-testid="record-set" className="lp-record-set-option" style={{ backgroundColor: getBgColor() }}>
        <div>
          <RecordSetControl
            hideCache={true}
            hideDelete={true}
            recordset={recordSet}
            isDefaultRecordset={isDefaultRecordset}
          />
        </div>
        <p>{recordSet?.recordSetName || `New Recordset - ${recordSet.recordSetType}`}</p>
      </li>
      {!lastChild && <hr />}
    </>
  );
};

export default LpRecordSetOption;
