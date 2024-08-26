import { Button } from '@mui/material';
import { ArrowLeftIcon, ArrowRightIcon } from '@mui/x-date-pickers/icons';
import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { WHATS_HERE_PAGE_ACTIVITY, WHATS_HERE_PAGE_POI } from 'state/actions';
import { useDispatch, useSelector } from 'react-redux';
import './WhatsHerePagination.css';

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
        {pageNumber <= 0 ? (
          <Button disabled sx={{ m: 0, p: 0 }} size={'small'}>
            <DoubleArrowLeftIcon />
          </Button>
        ) : (
          <Button
            sx={{ m: 0, p: 0 }}
            size={'small'}
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
            <DoubleArrowLeftIcon />
          </Button>
        )}
        {pageNumber <= 0 ? (
          <Button disabled sx={{ m: 0, p: 0 }} size={'small'}>
            <ArrowLeftIcon></ArrowLeftIcon>
          </Button>
        ) : (
          <Button
            sx={{ m: 0, p: 0 }}
            size={'small'}
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
            <ArrowLeftIcon />
          </Button>
        )}
        <span>
          {pageNumber + 1} / {Math.ceil(setLength / pageLimit)}
        </span>
        {(pageNumber + 1) * pageLimit >= setLength ? (
          <Button disabled sx={{ m: 0, p: 0 }} size={'small'}>
            <ArrowRightIcon />
          </Button>
        ) : (
          <Button
            sx={{ m: 0, p: 0 }}
            size={'small'}
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
            <ArrowRightIcon />
          </Button>
        )}
      </div>
      <div key={'paginationRecords'}>
        <span>
          Showing records {pageLimit * (pageNumber + 1) - pageLimit + 1} -{' '}
          {setLength < pageLimit * (pageNumber + 1) ? setLength : pageLimit * (pageNumber + 1)} out of {setLength}
        </span>
      </div>
    </div>
  );
};

export default WhatsHerePagination;
