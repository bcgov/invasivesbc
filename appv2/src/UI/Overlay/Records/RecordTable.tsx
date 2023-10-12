import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectMap } from 'state/reducers/map';
import { selectUserSettings } from 'state/reducers/userSettings';
import './RecordTable.css';
import { activityColumnsToDisplay, getUnnestedFieldsForActivity, getUnnestedFieldsForIAPP, iappColumnsToDisplay } from './RecordTableHelpers';
import { USER_CLICKED_RECORD, USER_HOVERED_RECORD, USER_TOUCHED_RECORD } from 'state/actions';

export const RecordTableHeader = (props) => {};

export const RecordTable = (props) => {
  const unmappedRows = useSelector((state: any) => state.Map?.recordTables?.[props.setID]?.rows);

  const tableType = useSelector((state: any) => state.UserSettings?.recordSets?.[props.setID]?.recordSetType);
  //  const tableType = userSettingsState?.recordSets?.[props.setID]?.recordSetType;
  const dispatch = useDispatch();
  const quickPanToRecord = useSelector((state: any) => state.Map?.quickPanToRecord);

  // maybe useful for when there's no headers during dev for adding new types:
  /*
  const unmappedColumns = mapAndRecordsState?.recordTables?.[props.setID]?.rows[0]
    ? Object.keys(mapAndRecordsState?.recordTables?.[props.setID]?.rows[0])
    : [];
   */

  const mappedRows = unmappedRows?.map((row) => {
    let unnestedRow = tableType === 'Activity' ? getUnnestedFieldsForActivity(row) : getUnnestedFieldsForIAPP(row);
    let mappedRow = {};
    Object.keys(unnestedRow).forEach((key) => {
      mappedRow[key] = unnestedRow[key];
    });
    return mappedRow;
  });

  return (
    <div className="record_table_container">
      <table className="record_table">
        <tr className="record_table_header">
          {tableType === 'Activity'
            ? activityColumnsToDisplay.map((col: any, i) => {
                return (
                  <th className="record_table_header_column" key={i}>
                    {col.name}
                  </th>
                );
              })
            : iappColumnsToDisplay.map((col: any, i) => {
                return (
                  <th className="record_table_header_column" key={i}>
                    {col.name}
                  </th>
                );
              })}
        </tr>
        {mappedRows?.map((row, i) => {
          return (
            <tr
              onClick={() => {
                dispatch({
                  type: USER_CLICKED_RECORD,
                  payload: {
                    recordType: tableType,
                    id: tableType === 'Activity' ? row.activity_id : row.site_id,
                    row: row
                  }
                });
              }}
              onMouseOver={() => {
                if (quickPanToRecord)
                  dispatch({
                    type: USER_HOVERED_RECORD,
                    payload: {
                      recordType: tableType,
                      id: tableType === 'Activity' ? row.activity_id : row.site_id,
                      row: row
                    }
                  });
              }}
              onTouchStart={()=> {
                dispatch({
                  type: USER_TOUCHED_RECORD,
                  payload: {
                    recordType: tableType,
                    id: tableType === 'Activity'? row.activity_id : row.site_id,
                    row: row
                  }
                });
              }}
              className="record_table_row"
              key={i}>
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
      </table>
    </div>
  );
};
