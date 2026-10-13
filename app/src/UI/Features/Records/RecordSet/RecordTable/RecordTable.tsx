import { Fragment } from 'react/jsx-runtime';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import RecordTablePopoverContent from '../RecordTablePopoverContent/RecordTablePopoverContent';
import { MouseEvent, TouchEvent, useState } from 'react';
import { GeoJSON } from 'geojson';
import { RecordSetType } from 'interfaces/UserRecordSet';
import IActivityTableRow from 'interfaces/TableRows/IActivityTableRow';
import { activityColumnsToDisplay, iappColumnsToDisplay } from '../RecordTableHelpers';
import { useDispatch } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import IIappTableRow from 'interfaces/TableRows/IIappTableRow';

type IappTypes = {
  type: RecordSetType.IAPP | `${RecordSetType.IAPP}`;
  data: Array<IIappTableRow>;
};

type ActivityTypes = {
  type: RecordSetType.Activity | `${RecordSetType.Activity}`;
  data: Array<IActivityTableRow>;
};

type PropTypes = IappTypes | ActivityTypes;

const COLUMN_MAP: Record<PropTypes['type'], any[]> = {
  Activity: activityColumnsToDisplay,
  IAPP: iappColumnsToDisplay
};

const RecordTable = ({ type, data }: PropTypes) => {
  const getKeyDetails = (row: PropTypes['data'][number]) => {
    if ('activity_id' in row) {
      return {
        id: row.activity_id,
        geom: row?.geom,
        identifier: row.short_id
      };
    }
    const id = row.site_id.toString();
    return {
      id,
      geom: row?.geometry,
      identifier: id
    };
  };
  const onUserHoveredRow = (row: PropTypes['data'][number]) => {
    const { id, geom, identifier } = getKeyDetails(row);
    dispatch(
      UserSettings.Map.setHoveredRecordset({
        recordType: type,
        id: id,
        geom: geom,
        readableIdentifier: identifier
      })
    );
  };

  const handleClick = (evt: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>, row: PropTypes['data'][number]) => {
    const { id, geom, identifier } = getKeyDetails(row);
    setRecordId(id);
    setDisplayId(identifier);
    setGeom(geom);
    setAnchorEl(evt.currentTarget);
  };

  const dispatch = useDispatch();

  const [geom, setGeom] = useState<GeoJSON>();
  const [recordId, setRecordId] = useState<string>('');
  const [displayId, setDisplayId] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const headers = COLUMN_MAP[type];

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
              <th key={c.key}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((a) => (
            <tr
              key={a?.activity_id as string}
              onMouseOver={() => onUserHoveredRow(a)}
              onFocus={() => onUserHoveredRow(a)}
            >
              {headers.map((c) => (
                <td onClick={(evt) => handleClick(evt, a)} key={c.key}>
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
