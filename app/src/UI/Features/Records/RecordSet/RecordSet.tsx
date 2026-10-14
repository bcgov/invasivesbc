import RecordTable from './RecordTable/RecordTable';
import ExcelExporter from '../ExcelExporter';
import RecordSetFooter from './RecordSetFooter';
import { useDispatch, useSelector } from 'utils/use_selector';
import { useEffect, useMemo } from 'react';
import { RecordSetId } from 'interfaces/UserRecordSet';
import Activity from 'state/actions/activity/Activity';
import Filters from './Filters/Filters';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import GlobalFilterWarning from './GlobalFilterWarning/GlobalFilterWarning';
import RecordSetControl from '../RecordSetControl';
import BackButton from 'UI/Reusable/BackButton/BackButton';
import IIappTableRow from 'interfaces/TableRows/IIappTableRow';
import './RecordSet.css';
import { ActivityPlantRowOut } from 'api/api-schema';

type RecordTableData = { type: 'IAPP'; data: IIappTableRow[] } | { type: 'Activity'; data: ActivityPlantRowOut[] };

type PropTypes = { setID: string };
export const RecordSet = ({ setID }: PropTypes) => {
  const dispatch = useDispatch();

  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);
  const CACHE_RECORDSETS = useSelector((state) => state.Configuration.current.features.CACHE_RECORDSETS.enabled);
  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);
  const unmappedRows = useSelector((state) => state.Map?.recordTables?.[setID]?.rows);
  const recordSet = useSelector((state) => state.UserSettings?.recordSets?.[setID]);
  const canCacheRecordset = MOBILE && CACHE_RECORDSETS && !Object.values(RecordSetId).includes(setID as RecordSetId);

  /** Typeguard for Recordsets as rows are not coupled to records  */
  const userRecordProps = useMemo(() => {
    if (!unmappedRows || !recordSet.recordSetType) return null;
    return {
      type: recordSet.recordSetType,
      data: unmappedRows
    } as RecordTableData;
  }, [unmappedRows, recordSet?.recordSetType]);
  const isDraftRecordset = setID === RecordSetId.Drafts;

  useEffect(() => {
    dispatch(Activity.switchRecordSet({ type: 'Activity', setId: setID }));
  }, [setID]);

  if (!recordSet) return;

  return (
    <>
      <div className="stickyHeader">
        <div className="recordSet_header" style={{ backgroundColor: recordSet?.color + `50` }}>
          <div>
            <BackButton destination={'/Records'} />
          </div>
          <div className="recordSet_header_name">
            {recordSet?.recordSetName || `New Recordset - ${recordSet?.recordSetType}`}
          </div>

          <GlobalFilterWarning />
          {!isCellPhoneWidth && (
            <MobileOnly>
              <div className="recordset-control">
                <RecordSetControl
                  hideCache={!canCacheRecordset}
                  isDefaultRecordset={!canCacheRecordset}
                  recordset={recordSet}
                />
              </div>
            </MobileOnly>
          )}
        </div>
      </div>
      <div className="recordSet_container">
        <Filters recordsetId={setID} />
        {!isDraftRecordset && <ExcelExporter setName={setID} />}
        {userRecordProps && <RecordTable setId={setID} {...userRecordProps} />}
      </div>
      <RecordSetFooter recordSet={recordSet} />
    </>
  );
};
