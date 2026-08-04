import { Button } from '@mui/material';
import './RecordTablePopoverContent.css';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { useDispatch } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { GeoJSON } from 'geojson';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { useNavigate } from 'react-router';
import { Debug } from 'UI/Reusable/Predicates/Debug';
import { BugReport } from '@mui/icons-material';

/**
 * @property { string } recordDisplayId Short ID / Site ID for a Record, displayed in the Popover
 * @property { string } recordLookupId Long ID for a Record, used to lookup the record data from API/Cache
 * @property { RecordSetType } recordType Type of Record in context
 */
type PropTypes = {
  recordDisplayId: string;
  recordLookupId: string;
  recordType: RecordSetType;
  geom?: GeoJSON;
};
const RecordTablePopoverContent = ({ recordDisplayId: id, recordLookupId, recordType, geom }: PropTypes) => {
  const handleOpenRecordInRHF = () => {
    const url =
      recordType === RecordSetType.Activity
        ? '/Records/Activity/' + recordLookupId + '/form'
        : '/Records/IAPP/' + recordLookupId + '/summary';
    navigate(url);
  };
  const handleOpenRecordInRJSF = () => {
    const url =
      recordType === RecordSetType.Activity
        ? '/Records/LegacyForm/' + recordLookupId + '/form'
        : '/Records/IAPP/' + recordLookupId + '/summary';
    navigate(url);
  };

  const handleMarkGeometryOnMap = (quickPan: boolean) => {
    dispatch(
      UserSettings.Map.setHoveredRecordset({
        recordType: recordType,
        id: recordLookupId,
        geom: geom,
        quickPan: !!quickPan,
        readableIdentifier: id
      })
    );
  };
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const label = (() => {
    switch (recordType) {
      case RecordSetType.Activity:
        return 'Record ID';
      case RecordSetType.IAPP:
        return 'IAPP Site ID';
    }
  })();

  return (
    <div id="record-table-popover-content">
      <p>
        {label}: {id}
      </p>
      <Button onClick={handleOpenRecordInRHF} variant="contained">
        Open
      </Button>
      {/* // TODO: Remove RJSF Option */}
      <Debug>
        <Button onClick={handleOpenRecordInRJSF} variant="contained">
          <BugReport /> Open <Debug>- RJSF Form</Debug>
        </Button>
      </Debug>
      {!!geom && (
        <Button onClick={handleMarkGeometryOnMap.bind(this, true)} variant="contained">
          Pan to record
        </Button>
      )}
      <MobileOnly>
        {geom && (
          <Button onClick={handleMarkGeometryOnMap.bind(this, false)} variant="contained">
            Mark site on map
          </Button>
        )}
      </MobileOnly>
    </div>
  );
};

export default RecordTablePopoverContent;
