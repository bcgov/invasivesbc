import { Button } from '@mui/material';
import { ArrowLeftIcon, ArrowRightIcon } from '@mui/x-date-pickers/icons';
import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { WHATS_HERE_PAGE_ACTIVITY, WHATS_HERE_PAGE_POI } from 'state/actions';
import { useDispatch, useSelector } from 'react-redux';

type PropTypes = {
  type: string;
};

const WhatsHerePagination = ({ type }: PropTypes) => {
  const dispatch = useDispatch();
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);

  let pageNumber = 0;
  let pageLimit = 5;
  let setLength = 1;
  let actionType = '';
  if (whatsHere) {
    if (type === 'activity' && whatsHere?.activityRows && whatsHere?.activityRows.length > 0) {
      setLength = whatsHere?.ActivityIDs.length;
      actionType = WHATS_HERE_PAGE_ACTIVITY;
      pageNumber = whatsHere?.ActivityPage;
      pageLimit = whatsHere?.ActivityLimit;
    } else if (type === 'iapp' && whatsHere?.IAPPIDs && whatsHere?.IAPPIDs.length > 0) {
      setLength = whatsHere?.IAPPIDs.length;
      actionType = WHATS_HERE_PAGE_POI;
      pageNumber = whatsHere?.IAPPPage;
      pageLimit = whatsHere?.IAPPLimit;
    }
  }

  return (
    <div key={'pagination'} className={'whatsHere-pagination'}>
      <div key={'paginationControls'}>
        <Button
          className="whiteBg"
          disabled={pageNumber <= 0}
          onClick={(e) => {
            e.stopPropagation();
            dispatch({
              type: actionType,
              payload: {
                page: 0,
                limit: pageLimit
              }
            });
          }}
        >
          <DoubleArrowLeftIcon sx={{ color: 'black' }} />
        </Button>
        <Button
          className="whiteBg"
          disabled={pageNumber <= 0}
          onClick={(e) => {
            e.stopPropagation();
            dispatch({
              type: actionType,
              payload: {
                page: pageNumber - 1,
                limit: pageLimit
              }
            });
          }}
        >
          <ArrowLeftIcon sx={{ color: 'black' }} />
        </Button>
        <span style={{ margin: '0 5pt' }}>
          {pageNumber + 1} / {Math.ceil(setLength / pageLimit)}
        </span>
        <Button
          className="whiteBg"
          disabled={(pageNumber + 1) * pageLimit >= setLength}
          onClick={(e) => {
            e.stopPropagation();
            dispatch({
              type: actionType,
              payload: {
                page: pageNumber + 1,
                limit: pageLimit
              }
            });
          }}
        >
          <ArrowRightIcon sx={{ color: 'black' }} />
        </Button>
      </div>
      <div key={'paginationRecords'}>
        Showing records {pageLimit * (pageNumber + 1) - pageLimit + 1} -{' '}
        {setLength < pageLimit * (pageNumber + 1) ? setLength : pageLimit * (pageNumber + 1)} out of {setLength}
      </div>
    </div>
  );
};

export default WhatsHerePagination;
