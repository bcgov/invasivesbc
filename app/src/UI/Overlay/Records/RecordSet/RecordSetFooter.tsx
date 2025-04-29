import { ArrowLeftIcon, ArrowRightIcon } from '@mui/x-date-pickers/icons';
import { UserRecordSet } from 'interfaces/UserRecordSet';
import { useDispatch } from 'react-redux';
import { PAGE_OR_LIMIT_UPDATE } from 'state/actions';
import { useSelector } from 'utils/use_selector';

type PropTypes = {
  recordSet: UserRecordSet;
};
const RecordSetFooter = ({ recordSet }: PropTypes) => {
  const recordTable = useSelector((state) => state.Map.recordTables?.[recordSet.id]);
  const loading = recordTable?.loading;
  const totalRecords = recordSet.idList.length;

  const loaded = !loading;
  const firstRowIndex = recordTable?.page * recordTable?.limit;
  const lastRowIndex =
    totalRecords < firstRowIndex + recordTable?.limit ? totalRecords : firstRowIndex + recordTable?.limit;

  let recordDisplayString = 'Loading...';
  if (loaded) {
    if (totalRecords !== undefined && totalRecords > 0 && !isNaN(firstRowIndex) && !isNaN(lastRowIndex)) {
      recordDisplayString = `${firstRowIndex + 1} to ${lastRowIndex} of ${totalRecords} records`;
    } else if (totalRecords === 0) {
      recordDisplayString = 'No records found';
    }
  }

  const shouldDisplayNextButton = totalRecords > lastRowIndex && !loading;
  const shouldDisplayPreviousButton = firstRowIndex > 0 && !loading;

  const dispatch = useDispatch();

  const onClickPrevious = () => {
    dispatch({
      type: PAGE_OR_LIMIT_UPDATE,
      payload: {
        setID: recordSet.id,
        page: recordTable?.page - 1,
        limit: recordTable?.limit
      }
    });
  };
  const onClickNext = () => {
    dispatch({
      type: PAGE_OR_LIMIT_UPDATE,
      payload: {
        setID: recordSet.id,
        page: recordTable?.page + 1,
        limit: recordTable?.limit
      }
    });
  };

  return (
    <div className="recordSet_footer">
      <div className="recordSet_pagePrevious">
        {shouldDisplayPreviousButton ? <ArrowLeftIcon onClick={onClickPrevious} /> : <></>}
      </div>
      <div className="recordSet_pageOfAndTotal">{recordDisplayString}</div>
      <div className="recordSet_pageNext">
        {shouldDisplayNextButton ? <ArrowRightIcon onClick={onClickNext} /> : <></>}
      </div>
    </div>
  );
};

export default RecordSetFooter;
