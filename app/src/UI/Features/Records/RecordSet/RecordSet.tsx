import { useDispatch } from 'react-redux';
import './RecordSet.css';
import Button from '@mui/material/Button';
import { RecordTable } from './RecordTable';
import ExcelExporter from '../ExcelExporter';
import RecordSetFooter from './RecordSetFooter';
import { useSelector } from 'utils/use_selector';
import { useEffect } from 'react';
import { RecordSetId } from 'interfaces/UserRecordSet';
import { RecordSetCacheButtons } from '../RecordSetCacheButtons';
import { useNavigate } from 'react-router';
import Activity from 'state/actions/activity/Activity';
import Filters from './Filters/Filters';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';

type PropTypes = { setID: string };

export const RecordSet = ({ setID }: PropTypes) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onClickBackButton = () => navigate('/Records');

  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);
  const CACHE_RECORDSETS = useSelector((state) => state.Configuration.current.features.CACHE_RECORDSETS.enabled);
  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);
  const recordSet = useSelector((state) => state.UserSettings?.recordSets?.[setID]);

  const canCacheRecordset = MOBILE && CACHE_RECORDSETS && !Object.values(RecordSetId).includes(setID as RecordSetId);

  useEffect(() => {
    dispatch(Activity.switchRecordSet({ type: 'Activity', setId: setID }));
  }, [setID]);

  if (!recordSet) {
    return;
  }
  return (
    <>
      <div className="stickyHeader">
        <div className="recordSet_header" style={{ backgroundColor: recordSet?.color + `50` }}>
          <div className="recordSet_back_button">
            <Button onClick={onClickBackButton} variant="contained">
              {'< Back'}
            </Button>
          </div>
          <div className="recordSet_header_name">
            {recordSet?.recordSetName || `New Recordset - ${recordSet?.recordSetType}`}
          </div>
          <MobileOnly>
            <FeatureGated requires="CACHE_RECORDSETS">
              {canCacheRecordset && !isCellPhoneWidth && (
                <div className="recordset-cache-control">
                  <RecordSetCacheButtons recordSet={recordSet} setId={setID} onCacheStateChange={() => {}} />
                </div>
              )}
            </FeatureGated>
          </MobileOnly>
        </div>
      </div>
      <div className="recordSet_container">
        <Filters recordsetId={setID} />
        <ExcelExporter setName={setID} />
        <RecordTable setID={setID} />
      </div>
      <RecordSetFooter recordSet={recordSet} />
    </>
  );
};
