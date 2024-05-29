import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

export const RecordTableHeader = (props) => {};

export const RecordTable = (props) => {
  const unmappedRows = useSelector((state: any) => state.Map?.recordTables?.[props.setID]?.rows);

  const tableType = useSelector((state: any) => state.UserSettings?.recordSets?.[props.setID]?.recordSetType);
  //  const tableType = userSettingsState?.recordSets?.[props.setID]?.recordSetType;
  const dispatch = useDispatch();
  const quickPanToRecord = useSelector((state: any) => state.Map?.quickPanToRecord);
  const isTouch = detectTouchDevice();

  // maybe useful for when there's no headers during dev for adding new types:
  /*
  const unmappedColumns = mapAndRecordsState?.recordTables?.[props.setID]?.rows[0]
    ? Object.keys(mapAndRecordsState?.recordTables?.[props.setID]?.rows[0])
    : [];
   */

  const mappedRows = unmappedRows?.map((row) => {
    const unnestedRow = tableType === 'Activity' ? getUnnestedFieldsForActivity(row) : getUnnestedFieldsForIAPP(row);
    const mappedRow = {};
    Object.keys(unnestedRow).forEach((key) => {
      mappedRow[key] = unnestedRow[key];
    });
    return mappedRow;
  });

  const sortColumn = useSelector((state: any) => state.UserSettings?.recordSets?.[props.setID]?.sortColumn);
  const sortOrder = useSelector((state: any) => state.UserSettings?.recordSets?.[props.setID]?.sortOrder);

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
              ? activityColumnsToDisplay.map((col: any, i) => {
                  return (
                    <th
                      className={'record_table_header_column'}
                      key={i}
                      onClick={() => {
                        if (validActivitySortColumns.includes(col.key))
                          dispatch({ type: RECORDSET_SET_SORT, payload: { setID: props.setID, sortColumn: col.key } });
                      }}
                    >
                      {col.name}{' '}
                      {validActivitySortColumns.includes(sortColumn) && sortColumn === col.key
                        ? sortOrder === 'ASC'
                          ? '▲'
                          : '▼'
                        : ''}
                    </th>
                  );
                })
              : iappColumnsToDisplay.map((col: any, i) => {
                  return (
                    <th
                      className="record_table_header_column"
                      key={i}
                      onClick={() => {
                        if (validIAPPSortColumns.includes(col.key))
                          dispatch({ type: RECORDSET_SET_SORT, payload: { setID: props.setID, sortColumn: col.key } });
                      }}
                    >
                      {col.name}{' '}
                      {validIAPPSortColumns.includes(sortColumn) && sortColumn === col.key
                        ? sortOrder === 'ASC'
                          ? '▲'
                          : '▼'
                        : ''}
                    </th>
                  );
                })}
          </tr>
          {mappedRows?.map((row, i) => {
            return (
              <tr
                onContextMenu={(event) => {
                  {
                    event.preventDefault();
                    event.stopPropagation();
                  }
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
                onMouseOver={() => {
                  dispatch({
                    type: USER_HOVERED_RECORD,
                    payload: {
                      recordType: tableType,
                      id: tableType === 'Activity' ? row.activity_id : row.site_id,
                      row: row
                    }
                  });
                }}
                onTouchStart={(e) => {
                  console.log('e');
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
                key={i}
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
                  ? activityColumnsToDisplay.map((col, j) => {
                      return (
                        <td className="record_table_row_column" key={j}>
                          {row[col.key]}
                        </td>
                      );
                    })
                  : iappColumnsToDisplay.map((col, j) => {
                      return (
                        <td className="record_table_row_column" key={j}>
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
