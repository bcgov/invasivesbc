import { ArrowLeftIcon, ArrowRightIcon } from '@mui/x-date-pickers/icons';
import { useDispatch } from 'react-redux';
import { PAGE_OR_LIMIT_UPDATE } from 'state/actions';
import { useSelector } from 'utils/use_selector';

const RecordSetFooter = (props) => {
  const layer = useSelector((state: any) => state.Map.layers?.filter((layer) => layer.recordSetID === props.setID)[0]);
  const recordTable = useSelector((state: any) => state.Map.recordTables?.[props.setID]);

  const loading = layer?.loading || recordTable?.loading;

  const totalRecords = layer?.IDList?.length;
  const loaded = !loading;
  const firstRowIndex = recordTable?.page * recordTable?.limit;
  const lastRowIndex =
    totalRecords < firstRowIndex + recordTable?.limit ? totalRecords : firstRowIndex + recordTable?.limit;
  let recordDisplayString = 'Loading...';
  if (loaded) {
    if (totalRecords !== undefined && totalRecords > 0 && !isNaN(firstRowIndex) && !isNaN(lastRowIndex)) {
      recordDisplayString = `${firstRowIndex + 1} to ${lastRowIndex} of ${totalRecords} records`;
    } else if (layer?.IDList && totalRecords < 1) {
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
        setID: props.setID,
        page: recordTable?.page - 1,
        limit: recordTable?.limit
      }
    });
  };
  const onClickNext = () => {
    dispatch({
      type: PAGE_OR_LIMIT_UPDATE,
      payload: {
        setID: props.setID,
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
