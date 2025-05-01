import { ArrowLeftIcon, ArrowRightIcon } from '@mui/x-date-pickers/icons';
import { UserRecordSet } from 'interfaces/UserRecordSet';
import { useDispatch } from 'react-redux';
import { PAGE_OR_LIMIT_UPDATE } from 'state/actions';
import { useSelector } from 'utils/use_selector';

type PropTypes = {
  recordSet: UserRecordSet;
};
const RecordSetFooter = ({ recordSet }: PropTypes) => {
  const handleUpdatePage = (change: number) => {
    dispatch({
      type: PAGE_OR_LIMIT_UPDATE,
      payload: {
        setID: recordSet.id,
        page: recordTable?.page + change,
        limit: recordTable?.limit
      }
    });
  };

  const dispatch = useDispatch();
  const recordTable = useSelector((state) => state.Map.recordTables?.[recordSet.id]);

  const loading = recordTable?.loading;
  const totalRecords = recordSet.idList.length;
  const firstRowIndex = recordTable?.page * recordTable?.limit;
  const lastRowIndex =
    totalRecords < firstRowIndex + recordTable?.limit ? totalRecords : firstRowIndex + recordTable?.limit;
  const shouldDisplayNext = totalRecords > lastRowIndex && !loading;
  const shouldDisplayPrevious = firstRowIndex > 0 && !loading;

  const recordDisplayString = (() => {
    if (!loading) {
      if (totalRecords && totalRecords > 0 && !isNaN(firstRowIndex) && !isNaN(lastRowIndex)) {
        return `${firstRowIndex + 1} to ${lastRowIndex} of ${totalRecords} records`;
      } else if (totalRecords === 0) {
        return 'No records found';
      }
    }
    return 'Loading...';
  })();

  return (
    <div className="recordSet_footer">
      <div className="recordSet_pagePrevious">
        {shouldDisplayPrevious && <ArrowLeftIcon onClick={handleUpdatePage.bind(this, -1)} />}
      </div>
      <div className="recordSet_pageOfAndTotal">{recordDisplayString}</div>
      <div className="recordSet_pageNext">
        {shouldDisplayNext && <ArrowRightIcon onClick={handleUpdatePage.bind(this, 1)} />}
      </div>
    </div>
  );
};

export default RecordSetFooter;
