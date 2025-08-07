import { StrictMode, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import './Records.css';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetId, RecordSetType } from 'interfaces/UserRecordSet';
import RecordSetDetails from './RecordSetDetails';
import RecordSetControl from './RecordSetControl';
import filterRecordsetsByNetworkState from 'utils/filterRecordsetsByNetworkState';
import UploadSiteList from '../SiteLists/UploadSiteList/UploadSiteList';
import debounce from 'lodash.debounce';

export const Records = () => {
  const { MOBILE } = useSelector((state) => state.Configuration.current.build);
  const dispatch = useDispatch();

  const handleNameChange = (val: string, setKey: string) =>
    dispatch(UserSettings.RecordSet.set({ recordSetName: val }, setKey));

  const [highlightedSet, setHighlightedSet] = useState<string | null>();
  const highlightSet = debounce((set: string) => setHighlightedSet(set), 100, { leading: true });
  const unHighlightSet = debounce(() => setHighlightedSet(null), 100, { leading: true });

  const history = useHistory();

  const recordSets = useSelector((state) => state.UserSettings.recordSets);
  const connected = useSelector((state) => state.Network.connected);

  const [userIsMobileAndOffline, setUserIsMobileAndOffline] = useState(false);

  const defaultRecordSetIds = Object.values(RecordSetId);
  const defaultRecordSetTypes = defaultRecordSetIds
    .map((key) => recordSets[parseInt(key)]?.recordSetName)
    .filter((value) => value !== undefined);

  useEffect(() => {
    // make sure the displayed status accurately reflects the contents of the cache
    dispatch(UserSettings.RecordSet.syncCacheStatusWithCacheService());
  }, []);

  useEffect(() => {
    if (MOBILE && !connected) {
      setUserIsMobileAndOffline(true);
    } else {
      setUserIsMobileAndOffline(false);
    }
  }, [connected]);

  const [filteredRecordSets, setFilteredRecordSets] = useState<string[]>([]);

  useEffect(() => {
    setFilteredRecordSets(filterRecordsetsByNetworkState(recordSets, userIsMobileAndOffline));
  }, [recordSets, userIsMobileAndOffline]);

  return (
    <StrictMode>
      <div id="records-container">
        <ul>
          {filteredRecordSets.map((set) => {
            return (
              recordSets?.[set] && (
                <li
                  key={set}
                  onClick={() => history.push('/Records/List/Local:' + set)}
                  onMouseOver={() => {
                    highlightSet(set);
                  }}
                  onFocus={() => {
                    highlightSet(set);
                  }}
                  onMouseOut={unHighlightSet}
                  onBlur={unHighlightSet}
                  className="record-set-option"
                  data-testid="record-set"
                  style={{ backgroundColor: `${recordSets[set]?.color}${highlightedSet === set ? 65 : 20}` }}
                >
                  <RecordSetDetails
                    name={recordSets[set]?.recordSetName}
                    isDefaultRecordset={defaultRecordSetTypes.includes(recordSets[set]?.recordSetName)}
                    handleNameChange={handleNameChange}
                    recordSetType={recordSets[set].recordSetType}
                    recordsetKey={set}
                  />

                  <RecordSetControl
                    isDefaultRecordset={defaultRecordSetTypes.includes(recordSets[set]?.recordSetName)}
                    recordset={recordSets[set]}
                  />
                </li>
              )
            );
          })}
        </ul>
        {userIsMobileAndOffline ? (
          <p>Any recordsets that haven't been saved for offline use will not be accessible when you're offline.</p>
        ) : (
          <div className="records-control">
            <Button
              onClick={dispatch.bind(this, UserSettings.RecordSet.add(RecordSetType.Activity))}
              className={'new-recordset-button'}
              data-testid="add-activity-layer"
            >
              Add Layer of Records
            </Button>
            <Button
              onClick={dispatch.bind(this, UserSettings.RecordSet.add(RecordSetType.IAPP))}
              className={'new-recordset-button'}
              data-testid="add-iapp-layer"
            >
              Add IAPP Layer of Records
            </Button>
            <UploadSiteList />
          </div>
        )}
      </div>
    </StrictMode>
  );
};
