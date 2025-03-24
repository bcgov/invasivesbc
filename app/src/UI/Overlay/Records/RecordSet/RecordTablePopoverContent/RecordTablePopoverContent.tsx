import { Button } from '@mui/material';
import { useHistory } from 'react-router';
import './RecordTablePopoverContent.css';
import { RecordSetType } from 'interfaces/UserRecordSet';

/**
 * @property { string } recordDisplayId Short ID / Site ID for a Record, displayed in the Popover
 * @property { string } recordLookupId Long ID for a Record, used to lookup the record data from API/Cache
 * @property { RecordSetType } recordType Type of Record in context
 */
type PropTypes = {
  recordDisplayId: string;
  recordLookupId: string;
  recordType: RecordSetType;
};
const RecordTablePopoverContent = ({ recordDisplayId: id, recordLookupId, recordType }: PropTypes) => {
  const history = useHistory();

  const label = (() => {
    switch (recordType) {
      case RecordSetType.Activity:
        return 'Record ID';
      case RecordSetType.IAPP:
        return 'IAPP Site ID';
    }
  })();

  return (
    <div id="record-table-popover-content">
      <p>
        {label}: {id}
      </p>
      <Button
        onClick={() => {
          const url =
            recordType === RecordSetType.Activity
              ? '/Records/Activity:' + recordLookupId + '/form'
              : '/Records/IAPP/' + recordLookupId + '/summary';
          history.push(url);
        }}
        variant="contained"
      >
        Open
      </Button>
    </div>
  );
};

export default RecordTablePopoverContent;
