import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './RecordSet.css';
import { useHistory } from 'react-router';
import { Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, IconButton } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ExcelExporter from '../ExcelExporter';
import RecordSetFooter from './RecordSetFooter';
import Filter from './Filter';
import { useSelector } from 'utils/use_selector';
import { MOBILE } from 'state/build-time-config';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { OfflineActivityRecord, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { detectTouchDevice } from 'utils/detectTouch';
import { offlineActivityColumnsToDisplay } from './RecordTableHelpers';
import { validActivitySortColumns } from 'sharedAPI/src/misc/sortColumns';
import { RECORDSET_SET_SORT, USER_CLICKED_RECORD, USER_HOVERED_RECORD, USER_TOUCHED_RECORD } from 'state/actions';
import UserRecord from 'interfaces/UserRecord';
import { ActivitySubtypeShortLabels } from 'sharedAPI/src/constants';
import moment from 'moment';
type PropTypes = { setID: string };

// display only locally modified/stored ones, if synchronized dont display (?)
export const OfflineRecordSet = ({ setID }: PropTypes) => {
  const onUserHoveredRecord = (row: UserRecord) => {
    dispatch({
      type: USER_HOVERED_RECORD,
      payload: {
        recordType: RecordSetType.Activity,
        id: row.activity_id,
        row: row
      }
    });
  };
  const viewFilters = useSelector((state) => state.Map.viewFilters);
  const connected = useSelector((state) => state.Network.connected);
  const history = useHistory();
  const dispatch = useDispatch();

  const onClickBackButton = () => {
    history.push('/Records');
  };
  const [userOfflineMobile, setUserOfflineMobile] = useState<boolean>(!connected && MOBILE);
  const recordSet = useSelector((state) => state.UserSettings?.recordSets?.[setID]);
  const { working, serializedActivities } = useSelector(selectOfflineActivity);
  const isTouch = detectTouchDevice();
  const activitySortColumns = userOfflineMobile ? [] : validActivitySortColumns;
  const sortColumn = useSelector((state: any) => state.UserSettings?.recordSets?.[setID]?.sortColumn);
  const sortOrder = useSelector((state: any) => state.UserSettings?.recordSets?.[setID]?.sortOrder);
  const parsedObj = Object.fromEntries(
    Object.entries(serializedActivities).map(([key, value]) => {
      const typedValue = value as OfflineActivityRecord;
      return [key, { ...typedValue, data: JSON.parse(typedValue.data) }];
    })
  );
  console.log(parsedObj);
  const updatedObject = Object.fromEntries(
    Object.entries(parsedObj).map(([key, value]) => [
      key,
      {
        ...value,
        data: {
          ...value.data,
          activity_subtype: `${ActivitySubtypeShortLabels[(value as OfflineActivityRecord).record_type] || 'Unknown'}`,
          activity_date: new Date(
            value.data?.form_data?.activity_data?.activity_date_time ??
              value.data?.form_data?.activity_data?.activity_date_time ??
              null
          )
            .toISOString()
            .substring(0, 10)
        }
      }
    ])
  );
  // Object.keys(parsedObj).forEach((key) => {
  //   parsedObj[key].data.a = `Updated ${myObject[key].data.a}`;
  //   parsedObj[key].data.b = `Updated ${myObject[key].data.b}`;
  // });

  const tableType = recordSet?.recordSetType;

  useEffect(() => {
    setUserOfflineMobile(MOBILE && !connected);
  }, [connected]);

  const onlyFilterIsForDrafts =
    recordSet?.tableFilters?.length === 1 && recordSet?.tableFilters[0]?.field === 'form_status';
  if (!recordSet) {
    return;
  }
  if (!updatedObject) {
    return (
      <div className="no-records">
        <p>There are no records matching your current filters.</p>
      </div>
    );
  }
  return (
    <>
      <div className="stickyHeader">
        <div className="recordSet_header" style={{ backgroundColor: recordSet?.color + `50` }}>
          <div className="recordSet_back_button">
            <Button onClick={onClickBackButton} variant="contained">
              {'< Back'}
            </Button>
          </div>
          <div className="recordSet_header_name">
            {recordSet?.recordSetName || `New Recordset - ${recordSet?.recordSetType}`}
          </div>
        </div>
      </div>
      <div className="recordSet_container">
        <div className="recordSet_filter_buttons_container">
          <div className="recordSet_clear_filter_button">
            <Tooltip classes={{ tooltip: 'toolTip' }} title="Clear all filters and refetch all data for this layer.">
              <span>
                <Button
                  size={'small'}
                  disabled={userOfflineMobile}
                  onClick={() => dispatch(UserSettings.RecordSet.clearFilters({ setID }))}
                  variant="contained"
                >
                  Clear Filters
                  <FilterAltOffIcon />
                </Button>
              </span>
            </Tooltip>
          </div>
          <div className="recordSet_toggleView_filter_button">
            <Tooltip classes={{ tooltip: 'toolTip' }} title="Toggle hiding filters - does not toggle applying them.">
              <span>
                <Button
                  size={'small'}
                  disabled={userOfflineMobile}
                  onClick={() => dispatch(UserSettings.RecordSet.hideFilters())}
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
              </span>
            </Tooltip>
          </div>
          <div className="recordSet_new_filter_button">
            <Tooltip
              classes={{ tooltip: 'toolTip' }}
              title="Add a new filter, drawn, uploaded KML, or just text search on a field."
            >
              <span>
                <Button
                  size={'small'}
                  disabled={userOfflineMobile}
                  onClick={() =>
                    dispatch(
                      UserSettings.RecordSet.addFilter({
                        field: tableType === RecordSetType.Activity ? 'short_id' : 'site_id',
                        filterType: 'tableFilter',
                        operator: 'CONTAINS',
                        operator2: 'AND',
                        setID: setID
                      })
                    )
                  }
                  variant="contained"
                >
                  Add Filter + <FilterAltIcon />
                </Button>
              </span>
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
                  {recordSet.tableFilters.map((filter) => {
                    if (filter.field !== 'form_status') {
                      return (
                        <Filter
                          key={filter.id}
                          recordSetType={recordSet.recordSetType}
                          setID={setID}
                          filterSet={filter}
                          userOfflineMobile={userOfflineMobile}
                        />
                      );
                    }
                  })}
                </tbody>
              </table>
            )}
          </div>
          <ExcelExporter setName={setID} />
        </div>

        <div className="record_table_container">
          <table className="record_table">
            <tbody>
              <tr className="record_table_header">
                {isTouch && (
                  <th className="record_table_header_column" style={{ width: '50px' }}>
                    View/Edit
                  </th>
                )}
                {offlineActivityColumnsToDisplay.map((col: any) => (
                  <th
                    className={'record_table_header_column'}
                    key={col.key}
                    onClick={() => {
                      if (activitySortColumns.includes(col.key)) {
                        dispatch({ type: RECORDSET_SET_SORT, payload: { setID: setID, sortColumn: col.key } });
                      }
                    }}
                  >
                    {col.name}{' '}
                    {activitySortColumns.includes(sortColumn) &&
                      sortColumn === col.key &&
                      (sortOrder === 'ASC' ? '▲' : '▼')}
                  </th>
                ))}
              </tr>
              {Object.entries(updatedObject).map(([key, value]) => {
                console.log('--->', key, value.data);

                return (
                  <tr
                    onContextMenu={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={() => {
                      if (!isTouch) {
                        dispatch({
                          type: USER_CLICKED_RECORD,
                          payload: {
                            recordType: tableType,
                            id: key,
                            row: value.data
                          }
                        });
                      }
                    }}
                    onMouseOver={() => onUserHoveredRecord(value.data)}
                    onFocus={() => onUserHoveredRecord(value.data)}
                    onTouchStart={() => {
                      dispatch({
                        type: USER_TOUCHED_RECORD,
                        payload: {
                          recordType: tableType,
                          id: key,
                          row: value.data
                        }
                      });
                    }}
                    className="record_table_row"
                    key={value?.data?.activity_id}
                  >
                    {isTouch && (
                      <td
                        onTouchStart={() => {
                          dispatch({
                            type: USER_CLICKED_RECORD,
                            payload: {
                              recordType: tableType,
                              id: key,
                              row: value.data
                            }
                          });
                        }}
                        className="record_table_row_column"
                        style={{ width: '50px' }}
                      >
                        <VisibilityIcon />
                      </td>
                    )}
                    {offlineActivityColumnsToDisplay.map((col) => {
                      console.log(value.data[col.key], col.key);

                      return (
                        <td className="record_table_row_column" key={col.key + col.name}>
                          {value.data[col.key]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <RecordSetFooter setID={setID} />
    </>
  );
};
