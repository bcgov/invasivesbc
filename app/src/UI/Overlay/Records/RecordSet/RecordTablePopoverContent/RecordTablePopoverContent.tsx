import { Button } from '@mui/material';
import { useHistory } from 'react-router';
import { useSelector } from 'utils/use_selector';
import './RecordTablePopoverContent.css';

type PropTypes = {
  id: string;
};
const RecordTablePopoverContent = ({ id }: PropTypes) => {
  const history = useHistory();
  const userRecordOnClickRecordType = useSelector((state) => state.Map.userRecordOnClickRecordType);
  const userRecordOnClickRecordID = useSelector((state) => state.Map.userRecordOnClickRecordID);

  return (
    <div id="record-table-popover-content">
      <p>
        {userRecordOnClickRecordType}: {id}
      </p>
      <Button
        onClick={() => {
          const url =
            userRecordOnClickRecordType === 'Activity'
              ? '/Records/Activity:' + userRecordOnClickRecordID + '/form'
              : '/Records/IAPP/' + userRecordOnClickRecordID + '/summary';
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
