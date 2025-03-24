import { useDispatch } from 'react-redux';
import './RecordTable.css';
import { getUnnestedFieldsForActivity, getUnnestedFieldsForIAPP } from './RecordTableHelpers';
import { RECORDSET_SET_SORT, USER_HOVERED_RECORD } from 'state/actions';
import { validActivitySortColumns, validIAPPSortColumns } from 'sharedAPI/src/misc/sortColumns';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { useSelector } from 'utils/use_selector';
import { createSelector } from '@reduxjs/toolkit';
import UserRecord from 'interfaces/UserRecord';
import RecordTableColumnSelect from './RecordTableColumnSelect/RecordTableColumnSelect';
import { MouseEvent, TouchEvent, useState } from 'react';
import RecordTablePopoverContent from './RecordTablePopoverContent/RecordTablePopoverContent';
import IappRecord from 'interfaces/IappRecord';
import CustomPopover from 'UI/CustomPopover/CustomPopover';

type PropTypes = {
  setID: string;
  userOfflineMobile: boolean;
};

export const RecordTable = ({ setID, userOfflineMobile }: PropTypes) => {
  const onUserHoveredRecord = (row: UserRecord) => {
    dispatch({
      type: USER_HOVERED_RECORD,
      payload: {
        recordType: recordSetType,
        id: recordSetType === RecordSetType.Activity ? row.activity_id : row.site_id,
        row: row
      }
    });
  };
  /**
   * @desc Set anchor point and display information for opening the Popover
   */
  const handlePopoverOpen = (evt: MouseEvent<any> | TouchEvent<any>, row: UserRecord | IappRecord) => {
    setRecordDisplayId(row.short_id ?? row.site_id ?? '');
    setRecordLookupId(row.activity_id ?? row.site_id ?? '');
    setAnchorEl(evt.currentTarget);
  };

  const recordSetType = useSelector((state) => state.UserSettings?.recordSets?.[setID].recordSetType);
  // memoize the selector to return the same array reference unless the input values change, preventing unnecessary re-renders
  const selectFilteredColumns = createSelector(
    [(state) => state.UserSettings?.tableColumns, (_, type) => type],
    (tableColumns, type) => tableColumns?.[type]?.filter((col) => !col.hide) || []
  );
  const tableColumns = useSelector((state) => selectFilteredColumns(state, recordSetType));

  const unmappedRows = useSelector((state) => state.Map?.recordTables?.[setID]?.rows);
  const sortColumn = useSelector((state) => state.UserSettings?.recordSets?.[setID]?.sortColumn);
  const sortOrder = useSelector((state) => state.UserSettings?.recordSets?.[setID]?.sortOrder);
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [recordDisplayId, setRecordDisplayId] = useState<string>('');
  const [recordLookupId, setRecordLookupId] = useState<string>('');

  const mappedRows = unmappedRows?.map((row) => {
    const unnestedRow =
      recordSetType === RecordSetType.Activity ? getUnnestedFieldsForActivity(row) : getUnnestedFieldsForIAPP(row);
    const mappedRow = {};
    Object.keys(unnestedRow).forEach((key) => {
      mappedRow[key] = unnestedRow[key];
    });
    return mappedRow;
  });
  const sortColumns = (() => {
    if (userOfflineMobile) return [];
    switch (recordSetType) {
      case RecordSetType.IAPP:
        return validIAPPSortColumns;
      case RecordSetType.Activity:
        return validActivitySortColumns;
    }
  })();

  if (!mappedRows || mappedRows?.length === 0) {
    return (
      <div className="no-records">
        <p>There are no records matching your current filters.</p>
      </div>
    );
  }
  return (
    <div>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <RecordTablePopoverContent
          recordDisplayId={recordDisplayId}
          recordLookupId={recordLookupId}
          recordType={recordSetType}
        />
      </CustomPopover>
      <RecordTableColumnSelect recordSetType={recordSetType} />
      <div className="record_table_container">
        <table className="record_table">
          <tbody>
            <tr className="record_table_header">
              {tableColumns.map((col) => (
                <th
                  className="record_table_header_column"
                  key={col.key}
                  onClick={() => {
                    if (sortColumns.includes(col.key)) {
                      dispatch({ type: RECORDSET_SET_SORT, payload: { setID: setID, sortColumn: col.key } });
                    }
                  }}
                >
                  {col.name}{' '}
                  {sortColumn === col.key && sortColumns.includes(sortColumn!) && (sortOrder === 'ASC' ? '▲' : '▼')}
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
                  onMouseOver={() => onUserHoveredRecord(row)}
                  onFocus={() => onUserHoveredRecord(row)}
                  className="record_table_row"
                  key={row?.activity_id ?? row?.site_id}
                >
                  {tableColumns.map((col) => (
                    <td
                      className="record_table_row_column"
                      key={col.key + col.name}
                      onClick={(evt) => handlePopoverOpen(evt, row)}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
