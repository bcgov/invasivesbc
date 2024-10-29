import './RecordHistory.css';

type PropTypes = {
  show: boolean;
  activityHistory: Array<{
    created_timestamp: string;
    form_status: string;
    iscurrent: boolean;
    updated_by: string;
    version: string | number;
  }>;
  handleClick: () => void;
};
const RecordHistory = ({ activityHistory, show, handleClick }: PropTypes) => {
  if (!show) {
    return;
  }
  return (
    <div id="record-history">
      <div className="history-header">
        <h2>Record History</h2>
      </div>
      <div className="history-content">
        <ul className="outer-record-history">
          {activityHistory.map((item, index) => (
            <li key={index}>
              <ul className="inner-record-history">
                <li>
                  <p>Version:</p>
                  <p>{item?.version + (item?.iscurrent ? ' (Current) ' : '')}</p>
                </li>
                <li>
                  <p>Updated By:</p>
                  <p>{item?.updated_by}</p>
                </li>
                <li>
                  <p>Activity Status:</p>
                  <p>{item?.form_status}</p>
                </li>
                <li>
                  <p>Created at:</p>
                  <p>{item?.created_timestamp ? new Date(item.created_timestamp).toLocaleString() : ''}</p>
                </li>
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="record-control">
        <button onClick={handleClick}>Close</button>
      </div>
    </div>
  );
};
export default RecordHistory;
