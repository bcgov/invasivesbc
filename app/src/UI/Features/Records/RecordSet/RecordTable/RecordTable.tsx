import { Fragment } from 'react/jsx-runtime';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import RecordTablePopoverContent from '../RecordTablePopoverContent/RecordTablePopoverContent';
import { MouseEvent, TouchEvent, useState } from 'react';
import { GeoJSON } from 'geojson';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { useDispatch, useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import IIappTableRow from 'interfaces/TableRows/IIappTableRow';
import { ActivityPlantRowOut, Point } from 'api/api-schema';

interface BaseProps {
  setId?: string;
  type?: RecordSetType | `${RecordSetType}`;
  data: Array<IIappTableRow> | Array<ActivityPlantRowOut>;
}
interface IappTypes extends BaseProps {
  type: RecordSetType.IAPP | `${RecordSetType.IAPP}`;
  data: Array<IIappTableRow>;
}

interface ActivityTypes extends BaseProps {
  type: RecordSetType.Activity | `${RecordSetType.Activity}`;
  data: Array<ActivityPlantRowOut>;
}

type PropTypes = IappTypes | ActivityTypes;

/**
 * Table for Displaying IBC and IAPP Records, Includes functionalities for panning to the Map, and opening Records.
 * Displays sortable functionality if a recordset is attached
 */
const RecordTable = ({ type, data, setId }: PropTypes) => {
  /** @desc Helper for displaying ordering Icon. */
  const orderDirection = (key: string) => {
    if (!setId) return null;
    if (sortColumn !== key) return '↕';
    return sortOrder === 'ASC' ? '▲' : '▼';
  };

  /** Get details needed to populate a popover. */
  const getKeyRecordDetails = (row: PropTypes['data'][number]) => {
    if ('activity_id' in row) return { id: row.activity_id, geom: row?.geom, readableIdentifier: row.short_id };
    const id = row.site_id.toString();
    return { id, geom: row?.geometry, readableIdentifier: id };
  };

  const onUserHoveredRow = (row: PropTypes['data'][number]) => {
    const { id, geom, readableIdentifier } = getKeyRecordDetails(row);
    dispatch(UserSettings.Map.setHoveredRecordset({ recordType: type, id, geom: geom as GeoJSON, readableIdentifier }));
  };

  const handleHeaderClick = (key: string) => {
    if (setId) dispatch(UserSettings.RecordSet.setSort({ setID: setId, sortColumn: key }));
  };

  const handleRowClick = (evt: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>, row: PropTypes['data'][number]) => {
    const { id, geom, readableIdentifier } = getKeyRecordDetails(row);
    setRecordId(id);
    setDisplayId(readableIdentifier);
    setGeom(geom as GeoJSON);
    setAnchorEl(evt.currentTarget);
  };

  const dispatch = useDispatch();

  const headers = useSelector((state) => state.UserSettings.tableColumns[type] ?? []);
  const sortColumn = useSelector((state) => (setId ? state.UserSettings?.recordSets?.[setId]?.sortColumn : null));
  const sortOrder = useSelector((state) => (setId ? state.UserSettings?.recordSets?.[setId]?.sortOrder : null));

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [displayId, setDisplayId] = useState<string>('');
  const [geom, setGeom] = useState<GeoJSON>();
  const [recordId, setRecordId] = useState<string>('');

  return (
    <Fragment>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <RecordTablePopoverContent
          recordDisplayId={displayId}
          recordLookupId={recordId}
          recordType={type}
          geom={geom}
        />
      </CustomPopover>
      <StyledTable>
        <thead>
          <tr>
            {headers.map((c) => (
              <th key={c.key} onClick={setId ? () => handleHeaderClick(c.key) : undefined}>
                {c.name}&nbsp;{orderDirection(c.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((a: PropTypes['data'][number]) => (
            <tr
              key={getKeyRecordDetails(a).id}
              onMouseOver={() => onUserHoveredRow(a)}
              onFocus={() => onUserHoveredRow(a)}
            >
              {headers.map((c) => (
                <td onClick={(evt) => handleRowClick(evt, a)} key={c.key}>
                  {(a?.[c.key] as string | number) || <span className="null-value" aria-hidden={true} />}
                </td>
              ))}
            </tr>
          ))}
          {data?.length === 0 && (
            <tr>
              <td colSpan={headers.length}>No records to display</td>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </Fragment>
  );
};

export default RecordTable;
