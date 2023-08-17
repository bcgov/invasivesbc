import React from 'react';
import { useSelector } from 'react-redux';
import { selectMap } from 'state/reducers/map';
import { selectUserSettings } from 'state/reducers/userSettings';
import './RecordTable.css';
import { activityColumnsToDisplay, getUnnestedFieldsForActivity, getUnnestedFieldsForIAPP, iappColumnsToDisplay } from './RecordTableHelpers';


export const RecordTableHeader = (props) => {
    
}

export const RecordTable = (props) => {
  const userSettingsState = useSelector(selectUserSettings);
  const mapAndRecordsState = useSelector(selectMap);
  const tableType = userSettingsState?.recordSets?.[props.setId]?.recordSetType;

  // maybe useful for when there's no headers during dev for adding new types:
  /*
  const unmappedColumns = mapAndRecordsState?.recordTables?.[props.setId]?.rows[0]
    ? Object.keys(mapAndRecordsState?.recordTables?.[props.setId]?.rows[0])
    : [];
   */

  const unmappedRows = mapAndRecordsState?.recordTables?.[props.setId]?.rows;

  const mappedRows = unmappedRows?.map((row) => {
    let unnestedRow = tableType === "Activity" ? getUnnestedFieldsForActivity(row) : getUnnestedFieldsForIAPP(row); 
    let mappedRow = {};
    Object.keys(unnestedRow).forEach((key) => {
        mappedRow[key] = unnestedRow[key];
      }
    )
    return mappedRow;
  });

  return (
    <div className="record_table_container">
      <table className="record_table">
        <tr className="record_table_header">
          {
            tableType === "Activity" ?
              activityColumnsToDisplay.map((col: any, i) => {
                return (
                  <th
                    className="record_table_header_column"
                    key={i}>
                    {col.name}
                  </th>
                );
              })
            :
              iappColumnsToDisplay.map((col: any, i) => {
                return (
                  <th
                    className="record_table_header_column"
                    key={i}>
                    {col.name}
                  </th>
                );
              })
          }
        </tr>
        {mappedRows?.map((row, i) => {
          return (
            <tr className="record_table_row" key={i}>
              {
                tableType === "Activity" ?
                  activityColumnsToDisplay.map((col, j) => {
                    return (
                      <td className="record_table_row_column" key={j}>
                        {JSON.stringify(row[col.key])}
                      </td>
                    );
                  })
                :
                  iappColumnsToDisplay.map((col, j) => {
                    return (
                      <td className="record_table_row_column" key={j}>
                        {JSON.stringify(row[col.key])}
                      </td>
                    );
                  })
              }
            </tr>
          );
        })}
      </table>
    </div>
  );
};
