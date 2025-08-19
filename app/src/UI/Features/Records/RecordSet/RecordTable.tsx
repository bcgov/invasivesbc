import { useDispatch } from 'react-redux';
import 'UI/Features/Records/RecordSet/RecordTable.css';
import {
  getUnnestedFieldsForActivity,
  getUnnestedFieldsForIAPP
} from 'UI/Features/Records/RecordSet/RecordTableHelpers';
import { validActivitySortColumns, validIAPPSortColumns } from 'sharedAPI/src/misc/sortColumns';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { useSelector } from 'utils/use_selector';
import { createSelector } from '@reduxjs/toolkit';
import UserRecord from 'interfaces/UserRecord';
import RecordTableColumnSelect from 'UI/Features/Records/RecordSet/RecordTableColumnSelect/RecordTableColumnSelect';
import { MouseEvent, TouchEvent, useState } from 'react';
import RecordTablePopoverContent from 'UI/Features/Records/RecordSet/RecordTablePopoverContent/RecordTablePopoverContent';
import IappRecord from 'interfaces/IappRecord';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import UserSettings from 'state/actions/userSettings/UserSettings';
import IActivityTableRow from 'interfaces/TableRows/IActivityTableRow';
import IIappTableRow from 'interfaces/TableRows/IIappTableRow';
import { Point, Polygon } from 'geojson';

type PropTypes = {
  setID: string;
};

export const RecordTable = ({ setID }: PropTypes) => {
  const onUserHoveredRecord = (row: IActivityTableRow | IIappTableRow) => {
    const { id, geom, identifier } = (() => {
      if ('activity_id' in row) {
        return {
          id: row.activity_id,
          geom: row?.geometry?.[0],
          identifier: row.short_id
        };
      } else if ('site_id' in row) {
        return {
          id: row.site_id,
          geom: row?.geometry,
          identifier: row.site_id.toString()
        };
      }
      return { id: '', geom: undefined };
    })();
    dispatch(
      UserSettings.Map.setHoveredRecordset({
        recordType: recordSetType,
        id: id,
        geom: geom,
        readableIdentifier: identifier
      })
    );
  };
  /**
   * @desc Set anchor point and display information for opening the Popover
   */
  const handlePopoverOpen = (evt: MouseEvent<any> | TouchEvent<any>, row: UserRecord | IappRecord) => {
    setGeom(row?.geometry?.[0] ?? row?.geometry);
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
  const [geom, setGeom] = useState<Polygon | Point>();

  const mappedRows = unmappedRows?.map((row) =>
    recordSetType === RecordSetType.Activity ? getUnnestedFieldsForActivity(row) : getUnnestedFieldsForIAPP(row)
  );
  const sortColumns = (() => {
    switch (recordSetType) {
      case RecordSetType.IAPP:
        return validIAPPSortColumns;
      case RecordSetType.Activity:
        return validActivitySortColumns;
      default:
        return [];
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
          geom={geom}
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
                      dispatch(UserSettings.RecordSet.setSort({ setID: setID, sortColumn: col.key }));
                    }
                  }}
                >
                  {col.name}{' '}
                  {sortColumn === col.key &&
                    sortColumns.includes(sortColumn ?? '') &&
                    (sortOrder === 'ASC' ? '▲' : '▼')}
                </th>
              ))}
            </tr>
            {mappedRows?.map((row) => {
              return (
                <tr
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onMouseOver={() => onUserHoveredRecord(row)}
                  onFocus={() => onUserHoveredRecord(row)}
                  className="record_table_row"
                  key={'activity_id' in row ? row?.activity_id : row?.site_id}
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
