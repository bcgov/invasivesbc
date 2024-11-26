import { useDispatch } from 'react-redux';
import './RecordSet.css';
import Button from '@mui/material/Button';
import { useHistory } from 'react-router';
import { Tooltip } from '@mui/material';
import { RecordTable } from './RecordTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { RECORDSET_ADD_FILTER, RECORDSET_CLEAR_FILTERS, RECORDSETS_TOGGLE_VIEW_FILTER } from 'state/actions';

import { OverlayHeader } from '../../OverlayHeader';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ExcelExporter from '../ExcelExporter';
import RecordSetFooter from './RecordSetFooter';
import Filter from './Filter';
import { useSelector } from 'utils/use_selector';
import { MOBILE } from 'state/build-time-config';
import { useEffect, useState } from 'react';

export const RecordSet = (props) => {
  const viewFilters = useSelector((state) => state.Map.viewFilters);
  const connected = useSelector((state) => state.Network.connected);
  const history = useHistory();
  const dispatch = useDispatch();

  const onClickBackButton = () => {
    history.push('/Records');
  };
  const [userOfflineMobile, setUserOfflineMobile] = useState<boolean>(!connected && MOBILE);
  const recordSet = useSelector((state) => state.UserSettings?.recordSets?.[props.setID]);
  const tableType = recordSet?.recordSetType;

  useEffect(() => {
    setUserOfflineMobile(MOBILE && !connected);
  }, [connected]);
  const onlyFilterIsForDrafts =
    recordSet?.tableFilters?.length === 1 && recordSet?.tableFilters[0]?.field === 'form_status';
  if (!recordSet) {
    return;
  }
  return (
    <div className="recordSet_container">
      <OverlayHeader />
      <div className="stickyHeader">
        <div className="recordSet_header" style={{ backgroundColor: recordSet?.color + `50` }}>
          <div className="recordSet_back_button">
            <Button onClick={onClickBackButton} variant="contained">
              {'< Back'}
            </Button>
          </div>
          <div className="recordSet_header_name">{recordSet?.recordSetName}</div>
        </div>
      </div>
      <div className="recordSet_filter_buttons_container">
        <div className="recordSet_clear_filter_button">
          <Tooltip classes={{ tooltip: 'toolTip' }} title="Clear all filters and refetch all data for this layer.">
            <Button
              size={'small'}
              disabled={userOfflineMobile}
              onClick={() => {
                dispatch({
                  type: RECORDSET_CLEAR_FILTERS,
                  payload: {
                    setID: props.setID
                  }
                });
              }}
              variant="contained"
            >
              Clear Filters
              <FilterAltOffIcon />
            </Button>
          </Tooltip>
        </div>
        <div className="recordSet_toggleView_filter_button">
          <Tooltip classes={{ tooltip: 'toolTip' }} title="Toggle hiding filters - does not toggle applying them.">
            <Button
              size={'small'}
              disabled={userOfflineMobile}
              onClick={() => {
                dispatch({
                  type: RECORDSETS_TOGGLE_VIEW_FILTER
                });
              }}
              variant="contained"
            >
              {viewFilters ? (
                <>
                  Hide Filters
                  <VisibilityOffIcon />
                  <FilterAltIcon />
                </>
              ) : (
                <>
                  Show Filters{' '}
                  {(recordSet?.tableFilters?.length || 0) > 0 &&
                    !onlyFilterIsForDrafts &&
                    `(${recordSet?.tableFilters?.length})`}
                  <VisibilityIcon />
                  <FilterAltIcon />
                </>
              )}
            </Button>
          </Tooltip>
        </div>
        <div className="recordSet_new_filter_button">
          <Tooltip
            classes={{ tooltip: 'toolTip' }}
            title="Add a new filter, drawn, uploaded KML, or just text search on a field."
          >
            <Button
              size={'small'}
              disabled={userOfflineMobile}
              onClick={() => {
                dispatch({
                  type: RECORDSET_ADD_FILTER,
                  payload: {
                    filterType: 'tableFilter',
                    // short id if activity record set otherwise site_ID
                    field: tableType === 'Activity' ? 'short_id' : 'site_id',
                    setID: props.setID,
                    operator: 'CONTAINS',
                    operator2: 'AND',
                    blockFetchForNow: true
                  }
                });
              }}
              variant="contained"
            >
              Add Filter + <FilterAltIcon />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="recordSet_filters_container">
        <div className="recordSet_filters">
          {recordSet?.tableFilters?.length > 0 && !onlyFilterIsForDrafts && viewFilters && (
            <table className="recordSetFilterTable">
              <thead>
                <tr>
                  <th>Operator 1</th>
                  <th>Operator 2</th>
                  <th>Filter type</th>
                  <th>Filter On</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {recordSet?.tableFilters.map((filter: any, i) => {
                  if (filter.field !== 'form_status')
                    return (
                      <Filter
                        key={'filterIndex' + i}
                        setID={props.setID}
                        id={filter.id}
                        userOfflineMobile={userOfflineMobile}
                      />
                    );
                })}
              </tbody>
            </table>
          )}
          <ExcelExporter setName={props.setID} />
        </div>
      </div>
      <RecordTable setID={props.setID} userOfflineMobile={userOfflineMobile} />
      <RecordSetFooter setID={props.setID} />
    </div>
  );
};
