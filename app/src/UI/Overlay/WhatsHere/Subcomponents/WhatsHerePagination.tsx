import { IconButton } from '@mui/material';
import { ArrowLeftIcon, ArrowRightIcon } from '@mui/x-date-pickers/icons';
import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { useDispatch, useSelector } from 'react-redux';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { RecordSet } from 'UI/Overlay/Records/RecordSet';

type PropTypes = {
  type: RecordSetType;
};

const WhatsHerePagination = ({ type }: PropTypes) => {
  const dispatch = useDispatch();
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);

  let pageNumber = 0;
  let pageLimit = 5;
  let setLength = 1;
  if (whatsHere) {
    if (type === RecordSetType.Activity && whatsHere?.activityRows && whatsHere?.activityRows.length > 0) {
      setLength = whatsHere.ActivityIDs.length;
      pageNumber = whatsHere.ActivityPage;
      pageLimit = whatsHere.ActivityLimit;
    } else if (RecordSetType.IAPP && whatsHere?.IAPPIDs && whatsHere?.IAPPIDs.length > 0) {
      setLength = whatsHere.IAPPIDs.length;
      pageNumber = whatsHere.IAPPPage;
      pageLimit = whatsHere.IAPPLimit;
    }
  }
  const handleClick = (page: number) => {
    switch (type) {
      case RecordSetType.Activity:
        dispatch(WhatsHere.page_activity({ page, limit: pageLimit }));
        break;
      case RecordSetType.IAPP:
        dispatch(WhatsHere.page_poi({ page, limit: pageLimit }));
        break;
    }
  };
  return (
    <div key={'pagination'} className={'whatsHere-pagination'}>
      <div key={'paginationControls'}>
        <IconButton
          disabled={pageNumber <= 0}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(0);
          }}
        >
          <DoubleArrowLeftIcon />
        </IconButton>
        <IconButton
          disabled={pageNumber <= 0}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(pageNumber - 1);
          }}
        >
          <ArrowLeftIcon />
        </IconButton>
        <span style={{ margin: '0 5pt' }}>
          {pageNumber + 1} / {Math.ceil(setLength / pageLimit)}
        </span>
        <IconButton
          disabled={(pageNumber + 1) * pageLimit >= setLength}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(pageNumber + 1);
          }}
        >
          <ArrowRightIcon />
        </IconButton>
      </div>
      <div key={'paginationRecords'}>
        Showing records {pageLimit * (pageNumber + 1) - pageLimit + 1} -{' '}
        {setLength < pageLimit * (pageNumber + 1) ? setLength : pageLimit * (pageNumber + 1)} out of {setLength}
      </div>
    </div>
  );
};

export default WhatsHerePagination;
