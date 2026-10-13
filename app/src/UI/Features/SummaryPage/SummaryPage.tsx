import { MouseEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { useSelector } from 'utils/use_selector';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import { activityColumnsToDisplay } from '../Records/RecordSet/RecordTableHelpers';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import RecordTablePopoverContent from '../Records/RecordSet/RecordTablePopoverContent/RecordTablePopoverContent';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { GeoJSON, Point, Polygon } from 'geojson';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import IActivityTableRow from 'interfaces/TableRows/IActivityTableRow';
import { useDispatch } from 'react-redux';
import UserSettings from 'state/actions/userSettings/UserSettings';

const SummaryPage = () => {
  const handleClick = (evt: MouseEvent<any>, a: Record<PropertyKey, unknown>) => {
    setRecordId((a?.activity_id as string) ?? '');
    setDisplayId((a?.short_id as string) ?? '');
    setGeom(a?.geom as Point | Polygon);
    setAnchorEl(evt.currentTarget);
  };
  const onUserHoveredRow = (row: IActivityTableRow) => {
    dispatch(
      UserSettings.Map.setHoveredRecordset({
        recordType: RecordSetType.Activity,
        id: row.activity_id,
        geom: row.geom,
        readableIdentifier: row.short_id
      })
    );
  };
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [geom, setGeom] = useState<GeoJSON>();
  const [recordId, setRecordId] = useState<string>('');
  const [displayId, setDisplayId] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const zones = searchParams.get('zone')?.split(',');

  useEffect(() => {
    setLoading(true);
    (async () => {
      const qs = '?' + searchParams.toString();
      await fetch(`${API_BASE}/ninja/summary${qs}`, {
        headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
      })
        .then(async (res) => {
          if (res?.ok) {
            setData(await res.json());
          }
        })
        .catch((e) => console.log('[SummaryPage]:', e))
        .finally(() => setLoading(false));
    })();
  }, [searchParams]);

  if (loading) {
    <div id="summary-page">
      <div className="content">
        <Spinner />
      </div>
    </div>;
  }
  return (
    <div id="summary-page">
      <div className="content">
        <hgroup>
          <h2>Zone(s) Summary</h2>
          <p>{zones?.join(', ')}</p>
        </hgroup>
        <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
          <RecordTablePopoverContent
            recordDisplayId={displayId}
            recordLookupId={recordId}
            recordType={RecordSetType.Activity}
            geom={geom}
          />
        </CustomPopover>
        <h2>Observations</h2>
        <StyledTable>
          <thead>
            <tr>
              {activityColumnsToDisplay.map((c) => (
                <th key={c.key}>{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.observations?.map((a) => (
              <tr
                key={a?.activity_id as string}
                onMouseOver={() => onUserHoveredRow(a)}
                onFocus={() => onUserHoveredRow(a)}
              >
                {activityColumnsToDisplay.map((c) => (
                  <td onClick={(evt) => handleClick(evt, a)} key={c.key}>
                    {(a?.[c.key] as string | number) || <span className="null-value" aria-hidden={true} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
        <h2>Treatments</h2>
        <StyledTable>
          <thead>
            <tr>
              {activityColumnsToDisplay.map((c) => (
                <th key={c.key}>{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.treatments?.map((a) => (
              <tr
                key={a?.activity_id as string}
                onMouseOver={() => onUserHoveredRow(a)}
                onFocus={() => onUserHoveredRow(a)}
              >
                {activityColumnsToDisplay.map((c) => (
                  <td onClick={(evt) => handleClick(evt, a)} key={c.key}>
                    {(a?.[c.key] as string | number) || <span className="null-value" aria-hidden={true} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
        <h2>Monitoring</h2>
        <StyledTable>
          <thead>
            <tr>
              {activityColumnsToDisplay.map((c) => (
                <th key={c.key}>{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.monitoring?.map((a) => (
              <tr
                key={a?.activity_id as string}
                onMouseOver={() => onUserHoveredRow(a)}
                onFocus={() => onUserHoveredRow(a)}
              >
                {activityColumnsToDisplay.map((c) => (
                  <td onClick={(evt) => handleClick(evt, a)} key={c.key}>
                    {(a?.[c.key] as string | number) || <span className="null-value" aria-hidden={true} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
        <h2>Biocontrol</h2>
        <StyledTable>
          <thead>
            <tr>
              {activityColumnsToDisplay.map((c) => (
                <th key={c.key}>{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.biocontrol?.map((a) => (
              <tr
                key={a?.activity_id as string}
                onMouseOver={() => onUserHoveredRow(a)}
                onFocus={() => onUserHoveredRow(a)}
              >
                {activityColumnsToDisplay.map((c) => (
                  <td onClick={(evt) => handleClick(evt, a)} key={c.key}>
                    {(a?.[c.key] as string | number) || <span className="null-value" aria-hidden={true} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </div>
    </div>
  );
};

export default SummaryPage;
