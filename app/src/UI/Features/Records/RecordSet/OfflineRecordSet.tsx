import 'UI/Features/Records/RecordSet/RecordSet.css';
import RecordSetFooter from 'UI/Features/Records/RecordSet/RecordSetFooter';
import { useDispatch, useSelector } from 'utils/use_selector';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { offlineActivityColumnsToDisplay } from 'UI/Features/Records/RecordSet/RecordTableHelpers';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import RecordTablePopoverContent from 'UI/Features/Records/RecordSet/RecordTablePopoverContent/RecordTablePopoverContent';
import { MouseEvent, TouchEvent, useEffect, useState } from 'react';
import UserSettings from 'state/actions/userSettings/UserSettings';
import IOfflineActivityRow from 'interfaces/TableRows/IOfflineActivityRow';
import { GeoJSON } from 'geojson';
import { useNavigate } from 'react-router';
import Activity from 'state/actions/activity/Activity';
import useOfflineRecordsetEntries from '../Activity/forms/plant/hooks/useOfflineRecordsetEntries';
import CheckboxUI from '../Activity/forms/common/CheckboxUI/CheckboxUI';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import { ArrowBackIos } from '@mui/icons-material';
import Button from 'UI/Reusable/Button/Button';
import RecordSetControl from '../RecordSetControl';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';

type PropTypes = { setID: string };

export const OfflineRecordSet = ({ setID }: PropTypes) => {
  const [changedOnly, setChangedOnly] = useState<boolean>(true);
  const onUserHoveredRecord = (row: IOfflineActivityRow) => {
    dispatch(
      UserSettings.Map.setHoveredRecordset({
        id: row.activity_id,
        geom: row.geom,
        recordType: RecordSetType.Activity,
        readableIdentifier: row.short_id
      })
    );
  };
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [recordDisplayId, setRecordDisplayId] = useState<string>('');
  const [recordLookupId, setRecordLookupId] = useState<string>('');
  const [geom, setGeom] = useState<GeoJSON>();

  const handlePopoverOpen = (evt: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>, row: IOfflineActivityRow) => {
    setGeom(row.geom);
    setRecordDisplayId((row.short_id as string) ?? '');
    setRecordLookupId((row.activity_id as string) ?? '');
    setAnchorEl(evt.currentTarget);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onClickBackButton = () => {
    navigate('/Records');
  };

  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);
  const recordSet = useSelector((state) => state.UserSettings?.recordSets?.[setID]);
  const recordTable = useSelector((state) => state.Map.recordTables?.[setID]);
  const startIndex = recordTable?.page * recordTable?.limit;
  const endIndex = startIndex + recordTable?.limit;

  const { offlineRows } = useOfflineRecordsetEntries({ startIndex, endIndex, filterUnsynced: changedOnly });

  useEffect(() => {
    dispatch(Activity.switchRecordSet({ type: RecordSetType.Activity, setId: setID }));
  }, [setID]);

  return (
    <>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <RecordTablePopoverContent
          recordDisplayId={recordDisplayId}
          recordLookupId={recordLookupId}
          recordType={RecordSetType.Activity}
          geom={geom}
        />
      </CustomPopover>
      <div className="stickyHeader">
        <div className="recordSet_header" style={{ backgroundColor: recordSet?.color + `50` }}>
          <div>
            <Button onClick={onClickBackButton} variant="contained">
              <ArrowBackIos /> Back
            </Button>
          </div>
          <div className="recordSet_header_name">{recordSet?.recordSetName}</div>
          {!isCellPhoneWidth && (
            <MobileOnly>
              <div className="recordset-control">
                <RecordSetControl isDefaultRecordset={true} recordset={recordSet} hideCache hideColour />
              </div>
            </MobileOnly>
          )}
        </div>
      </div>
      <div className="recordSet_container">
        <div>
          <CheckboxUI
            state={changedOnly}
            required
            onChange={() => setChangedOnly((prev) => !prev)}
            label={'Show unsynced only'}
          />
        </div>
        <StyledTable>
          <thead>
            <tr>
              {offlineActivityColumnsToDisplay.map((col) => (
                <th key={col.key}>{col.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {offlineRows?.map((r: IOfflineActivityRow) => (
              <tr key={r.activity_id} onMouseEnter={() => onUserHoveredRecord(r)}>
                {offlineActivityColumnsToDisplay.map((col) => (
                  <td key={col.key} onClick={(evt) => handlePopoverOpen(evt, r)}>
                    {r[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </div>
      <RecordSetFooter recordSet={recordSet} />
    </>
  );
};
