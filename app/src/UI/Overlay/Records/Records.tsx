import { MouseEvent, useEffect, useState } from 'react';

import { Button } from '@mui/material';
import './Records.css';
import { OverlayHeader } from '../OverlayHeader';
import Spinner from 'UI/Spinner/Spinner';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import Prompt from 'state/actions/prompts/Prompt';
import RecordSetDetails from './RecordSetDetails';
import RecordSetControl from './RecordSetControl';
import { MOBILE } from 'state/build-time-config';
import filterRecordsetsByNetworkState from 'utils/filterRecordsetsByNetworkState';

export const Records = () => {
  const DEFAULT_RECORD_TYPES = ['All InvasivesBC Activities', 'All IAPP Records', 'My Drafts'];
  const activitiesGeoJSONState = useSelector((state) => state.Map?.activitiesGeoJSONDict);
  const isIAPPGeoJSONLoaded = useSelector((state) => state.Map?.IAPPGeoJSONDict !== undefined);
  const mapLayers = useSelector((state) => state.Map.layers);
  const MapMode = useSelector((state) => state.Map.MapMode);
  const recordSets = useSelector((state) => state.UserSettings?.recordSets);
  const connected = useSelector((state) => state.Network.connected);
  const [highlightedSet, setHighlightedSet] = useState<string | null>();
  const [isActivitiesGeoJSONLoaded, setIsActivitiesGeoJSONLoaded] = useState(false);
  const [loadMap, setLoadMap] = useState({});

  const history = useHistory();
  const dispatch = useDispatch();

  const handleNameChange = (val: string, setKey: string) =>
    dispatch(UserSettings.RecordSet.set({ recordSetName: val }, setKey));

  useEffect(() => {
    // make sure the displayed status accurately reflects the contents of the cache
    dispatch(UserSettings.RecordSet.syncCacheStatusWithCacheService());
  }, []);

  useEffect(() => {
    setIsActivitiesGeoJSONLoaded(activitiesGeoJSONState.hasOwnProperty('s3'));
  }, [activitiesGeoJSONState]);

  useEffect(() => {
    const rv = {};
    mapLayers.forEach((layer) => {
      const geojson = layer?.type === RecordSetType.Activity ? isActivitiesGeoJSONLoaded : isIAPPGeoJSONLoaded;
      if (MapMode !== 'VECTOR_ENDPOINT') {
        rv[layer?.recordSetID] = !layer?.loading && geojson;
      } else {
        rv[layer?.recordSetID] = !layer?.loading;
      }
    });
    setLoadMap(rv);
  }, [JSON.stringify(mapLayers), isActivitiesGeoJSONLoaded, isIAPPGeoJSONLoaded, MapMode]);

  //Record set handlers:
  const handleToggleLabel = (set: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(UserSettings.RecordSet.toggleLabelVisibility(set));
  };

  const handleToggleLayer = (set: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
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
        dispatch(UserSettings.RecordSet.remove(set));
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

  const highlightSet = (set: string) => setHighlightedSet(set);
  const unHighlightSet = () => setHighlightedSet(null);
  const userIsMobileAndOffline = MOBILE && !connected;
  if (!recordSets) {
    return;
  }
  return (
    <>
      <OverlayHeader />
      <div id="records-container">
        <ul>
          {filterRecordsetsByNetworkState(recordSets, userIsMobileAndOffline).map((set) => (
            <li key={set}>
              <button
                onClick={() => history.push('/Records/List/Local:' + set)}
                onMouseOver={highlightSet.bind(this, set)}
                onFocus={highlightSet.bind(this, set)}
                onMouseOut={unHighlightSet}
                onBlur={unHighlightSet}
                className="record-set-option"
                style={{ backgroundColor: `${recordSets[set]?.color}${highlightedSet === set ? 65 : 20}` }}
                disabled={MOBILE && !connected && recordSets[set].cacheMetadata.status !== UserRecordCacheStatus.CACHED}
              >
                <RecordSetDetails
                  name={recordSets[set]?.recordSetName}
                  isDefaultRecordset={DEFAULT_RECORD_TYPES.includes(recordSets[set]?.recordSetName)}
                  handleNameChange={handleNameChange}
                  recordsetKey={set}
                >
                  {!loadMap?.[set] && (
                    <div>
                      <Spinner />
                    </div>
                  )}
                </RecordSetDetails>

                <RecordSetControl
                  isDefaultRecordset={DEFAULT_RECORD_TYPES.includes(recordSets[set]?.recordSetName)}
                  recordset={recordSets[set]}
                  recordsetKey={set}
                  onClickToggleLabel={handleToggleLabel}
                  onClickToggleLayer={handleToggleLayer}
                  onClickCycleColour={handleCycleColour}
                  onClickDeleteRecordSet={handleDeleteRecordSet}
                />
              </button>
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
            >
              Add Layer of Records
            </Button>
            <Button
              onClick={dispatch.bind(this, UserSettings.RecordSet.add(RecordSetType.IAPP))}
              className={'new-recordset-button'}
            >
              Add IAPP Layer of Records
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
