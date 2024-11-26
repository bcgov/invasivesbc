import { useDispatch } from 'react-redux';
import './RecordTable.css';
import {
  activityColumnsToDisplay,
  getUnnestedFieldsForActivity,
  getUnnestedFieldsForIAPP,
  iappColumnsToDisplay
} from './RecordTableHelpers';
import { RECORDSET_SET_SORT, USER_CLICKED_RECORD, USER_HOVERED_RECORD, USER_TOUCHED_RECORD } from 'state/actions';
import { validActivitySortColumns, validIAPPSortColumns } from 'sharedAPI/src/misc/sortColumns';
import { detectTouchDevice } from 'utils/detectTouch';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { useSelector } from 'utils/use_selector';
import UserRecord from 'interfaces/UserRecord';

type PropTypes = {
  setID: string;
  userOfflineMobile: boolean;
};

export const RecordTable = ({ setID, userOfflineMobile }: PropTypes) => {
  const onUserHoveredRecord = (row: UserRecord) => {
    dispatch({
      type: USER_HOVERED_RECORD,
      payload: {
        recordType: tableType,
        id: tableType === RecordSetType.Activity ? row.activity_id : row.site_id,
        row: row
      }
    });
  };
  const unmappedRows = useSelector((state) => state.Map?.recordTables?.[setID]?.rows);
  const tableType = useSelector((state) => state.UserSettings?.recordSets?.[setID].recordSetType);
  const activitySortColumns = userOfflineMobile ? [] : validActivitySortColumns;
  const dispatch = useDispatch();
  const isTouch = detectTouchDevice();
  const mappedRows = unmappedRows?.map((row) => {
    const unnestedRow =
      tableType === RecordSetType.Activity ? getUnnestedFieldsForActivity(row) : getUnnestedFieldsForIAPP(row);
    const mappedRow = {};
    Object.keys(unnestedRow).forEach((key) => {
      mappedRow[key] = unnestedRow[key];
    });
    return mappedRow;
  });

  const sortColumn = useSelector((state: any) => state.UserSettings?.recordSets?.[setID]?.sortColumn);
  const sortOrder = useSelector((state: any) => state.UserSettings?.recordSets?.[setID]?.sortOrder);

  return (
    <div className="record_table_container">
      <table className="record_table">
        <tbody>
          <tr className="record_table_header">
            {isTouch && (
              <th className="record_table_header_column" style={{ width: '50px' }}>
                View/Edit
              </th>
            )}
            {tableType === 'Activity'
              ? activityColumnsToDisplay.map((col: any, i) => (
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
                ))
              : iappColumnsToDisplay.map((col: any) => (
                  <th
                    className="record_table_header_column"
                    key={col.key}
                    onClick={() => {
                      if (validIAPPSortColumns.includes(col.key)) {
                        dispatch({ type: RECORDSET_SET_SORT, payload: { setID: setID, sortColumn: col.key } });
                      }
                    }}
                  >
                    {col.name}{' '}
                    {validIAPPSortColumns.includes(sortColumn) &&
                      sortColumn === col.key &&
                      (sortOrder === 'ASC' ? '▲' : '▼')}
                  </th>
                ))}
          </tr>
          {mappedRows?.map((row: UserRecord) => {
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
                        id: tableType === 'Activity' ? row.activity_id : row.site_id,
                        row: row
                      }
                    });
                  }
                }}
                onMouseOver={() => onUserHoveredRecord(row)}
                onFocus={() => onUserHoveredRecord(row)}
                onTouchStart={(e) => {
                  dispatch({
                    type: USER_TOUCHED_RECORD,
                    payload: {
                      recordType: tableType,
                      id: tableType === 'Activity' ? row.activity_id : row.site_id,
                      row: row
                    }
                  });
                }}
                className="record_table_row"
                key={row?.activity_id}
              >
                {isTouch && (
                  <td
                    onTouchStart={(e) => {
                      dispatch({
                        type: USER_CLICKED_RECORD,
                        payload: {
                          recordType: tableType,
                          id: tableType === 'Activity' ? row.activity_id : row.site_id,
                          row: row
                        }
                      });
                    }}
                    className="record_table_row_column"
                    style={{ width: '50px' }}
                  >
                    <VisibilityIcon />
                  </td>
                )}
                {tableType === 'Activity'
                  ? activityColumnsToDisplay.map((col) => {
                      return (
                        <td className="record_table_row_column" key={col.key + col.name}>
                          {row[col.key]}
                        </td>
                      );
                    })
                  : iappColumnsToDisplay.map((col, j) => {
                      return (
                        <td className="record_table_row_column" key={col.key + col.name}>
                          {row[col.key]}
                        </td>
                      );
                    })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
