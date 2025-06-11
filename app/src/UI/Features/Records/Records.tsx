import { MouseEvent, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import './Records.css';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetId, RecordSetType } from 'interfaces/UserRecordSet';
import Prompt from 'state/actions/prompts/Prompt';
import RecordSetDetails from './RecordSetDetails';
import RecordSetControl from './RecordSetControl';
import filterRecordsetsByNetworkState from 'utils/filterRecordsetsByNetworkState';
import Activity from 'state/actions/activity/Activity';
import UploadSiteList from '../SiteLists/UploadSiteList/UploadSiteList';

export const Records = () => {
  //Record set handlers:
  const handleToggleLabel = (set: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (set === RecordSetId.OfflineActivities) {
      dispatch(Activity.Offline.setLabelVisibility());
    }
    dispatch(UserSettings.RecordSet.toggleLabelVisibility(set));
  };

  const handleToggleLayer = (set: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // offline activities
    if (set === RecordSetId.OfflineActivities) {
      dispatch(Activity.Offline.setAllShapeVisibility());
    }
    dispatch(UserSettings.RecordSet.toggleVisibility(set));
  };

  const handleCycleColour = (set: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(UserSettings.RecordSet.cycleColourById(set));
  };

  const handleDeleteRecordSet = (set: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const callback = (userConfirmation: boolean) => {
      if (userConfirmation) {
        dispatch(UserSettings.RecordSet.requestRemoval({ setId: set }));
      }
    };
    dispatch(
      Prompt.confirmation({
        title: 'Deleting Record Set',
        prompt: [
          'Are you sure you want to remove this record set?',
          'The data will persist but you will no longer have this set of filters or the map layer.'
        ],
        callback
      })
    );
  };

  const handleNameChange = (val: string, setKey: string) =>
    dispatch(UserSettings.RecordSet.set({ recordSetName: val }, setKey));

  const highlightSet = (set: string) => setHighlightedSet(set);
  const unHighlightSet = () => setHighlightedSet(null);

  const history = useHistory();
  const dispatch = useDispatch();

  const recordSets = useSelector((state) => state.UserSettings.recordSets);
  const connected = useSelector((state) => state.Network.connected);

  const [highlightedSet, setHighlightedSet] = useState<string | null>();
  const [userIsMobileAndOffline, setUserIsMobileAndOffline] = useState(false);

  const { MOBILE } = useSelector((state) => state.Configuration.current.build);

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

  return (
    <div id="records-container">
      <ul>
        {filterRecordsetsByNetworkState(recordSets, userIsMobileAndOffline).map((set) => (
          <li
            key={set}
            onClick={() => history.push('/Records/List/Local:' + set)}
            onMouseOver={highlightSet.bind(this, set)}
            onFocus={highlightSet.bind(this, set)}
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
              recordsetKey={set}
              onClickToggleLabel={handleToggleLabel}
              onClickToggleLayer={handleToggleLayer}
              onClickCycleColour={handleCycleColour}
              onClickDeleteRecordSet={handleDeleteRecordSet}
            />
          </li>
        ))}
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
  );
};
