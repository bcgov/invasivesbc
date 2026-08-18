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
import { MouseEvent, TouchEvent, useMemo, useState } from 'react';
import RecordTablePopoverContent from 'UI/Features/Records/RecordSet/RecordTablePopoverContent/RecordTablePopoverContent';
import IappRecord from 'interfaces/IappRecord';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import UserSettings from 'state/actions/userSettings/UserSettings';
import IActivityTableRow from 'interfaces/TableRows/IActivityTableRow';
import IIappTableRow from 'interfaces/TableRows/IIappTableRow';
import { Point, Polygon } from 'geojson';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import { Md5 } from 'ts-md5';

type PropTypes = {
  setID: string;
};

export const RecordTable = ({ setID }: PropTypes) => {
  const onUserHoveredRecord = (row: IActivityTableRow | IIappTableRow) => {
    const { id, geom, identifier } = (() => {
      if ('activity_id' in row) {
        return {
          id: row.activity_id,
          geom: row?.geom,
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
    setGeom(row?.geom);
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

  const mappedRows = useMemo(() => {
    if (!unmappedRows) return [];
    else if (recordSetType === RecordSetType.Activity) {
      return unmappedRows.map(getUnnestedFieldsForActivity);
    } else if (recordSetType === RecordSetType.IAPP) {
      return unmappedRows.map(getUnnestedFieldsForIAPP);
    }
    return [];
  }, [recordSetType, unmappedRows]);

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
  const hash = Md5.hashStr(JSON.stringify(mappedRows));
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
      <StyledTable key={hash}>
        <thead>
          <tr>
            {tableColumns.map((col) => (
              <th
                key={col.key}
                onClick={() => {
                  if (sortColumns.includes(col.key)) {
                    dispatch(UserSettings.RecordSet.setSort({ setID: setID, sortColumn: col.key }));
                  }
                }}
              >
                {col.name}{' '}
                {sortColumn === col.key && sortColumns.includes(sortColumn ?? '') && (sortOrder === 'ASC' ? '▲' : '▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mappedRows?.map((row) => (
            <tr
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseOver={() => onUserHoveredRecord(row)}
              onFocus={() => onUserHoveredRecord(row)}
              key={'activity_id' in row ? row?.activity_id : row?.site_id}
            >
              {tableColumns.map((col) => (
                <td key={col.key + col.name} onClick={(evt) => handlePopoverOpen(evt, row)}>
                  <div className="cell">{row[col.key] ?? <span className="null-value" aria-hidden={true} />}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
      {!mappedRows ||
        (mappedRows?.length === 0 && (
          <div className="no-records">
            <p>There are no records matching your current filters.</p>
          </div>
        ))}
    </div>
  );
};
