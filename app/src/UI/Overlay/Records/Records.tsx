import { MouseEvent, useEffect, useState } from 'react';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Delete from '@mui/icons-material/Delete';
import LabelIcon from '@mui/icons-material/Label';
import LabelClearIcon from '@mui/icons-material/LabelOff';
import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

import { Button, IconButton, Tooltip, Typography } from '@mui/material';
import './Records.css';
import { OverlayHeader } from '../OverlayHeader';
import Spinner from 'UI/Spinner/Spinner';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetType } from 'interfaces/UserRecordSet';
import Prompt from 'state/actions/prompts/Prompt';
import { MobileOnly } from 'UI/Predicates/MobileOnly';
import { RecordSetCacheButtons } from './RecordSetCacheButtons';

export const Records = () => {
  const DEFAULT_RECORD_TYPES = ['All InvasivesBC Activities', 'All IAPP Records', 'My Drafts'];
  const activitiesGeoJSONState = useSelector((state) => state.Map?.activitiesGeoJSONDict);
  const isIAPPGeoJSONLoaded = useSelector((state) => state.Map?.IAPPGeoJSONDict !== undefined);
  const mapLayers = useSelector((state) => state.Map.layers);
  const MapMode = useSelector((state) => state.Map.MapMode);
  const recordSets = useSelector((state) => state.UserSettings?.recordSets);

  const [highlightedSet, setHighlightedSet] = useState<string | null>();
  const [isActivitiesGeoJSONLoaded, setActivitiesGeoJSONLoaded] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [loadMap, setLoadMap] = useState({});

  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    // make sure the displayed status accurately reflects the contents of the cache
    dispatch(UserSettings.RecordSet.syncCacheStatusWithCacheService());
  }, []);

  useEffect(() => {
    setActivitiesGeoJSONLoaded(activitiesGeoJSONState.hasOwnProperty('s3'));
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

  //Record set on click handlers:
  const onClickToggleLabel = (set: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(UserSettings.RecordSet.toggleLabelVisibility(set));
  };

  const onClickToggleLayer = (set: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(UserSettings.RecordSet.toggleVisibility(set));
  };

  const onClickCycleColour = (set: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(UserSettings.RecordSet.cycleColourById(set));
  };

  const onClickDeleteRecordSet = (set: string, e: MouseEvent<HTMLButtonElement>) => {
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

  if (!recordSets) {
    return;
  }
  return (
    <div className="records__container">
      <OverlayHeader />
      {Object.keys(recordSets)?.map((set) => {
        return (
          <div
            key={set}
            onClick={() => {
              history.push('/Records/List/Local:' + set);
            }}
            onMouseOver={highlightSet.bind(this, set)}
            onFocus={highlightSet.bind(this, set)}
            onMouseOut={unHighlightSet}
            onBlur={unHighlightSet}
            className={'records_set'}
            // Adjust Opacity of the background-color when hovering
            style={{ backgroundColor: `${recordSets[set]?.color}${highlightedSet === set ? 65 : 20}` }}
          >
            {!loadMap?.[set] && (
              <div key={set + 'spinner'}>
                <Spinner />
              </div>
            )}
            <div className="records_set_left_hand_items">
              {isEditingName && !DEFAULT_RECORD_TYPES.includes(recordSets[set]?.recordSetName) ? (
                <>
                  <input
                    type="text"
                    value={recordSets[set]?.recordSetName}
                    onChange={(e) => dispatch(UserSettings.RecordSet.set({ recordSetName: e.target.value }, set))}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingName(false);
                    }}
                  >
                    <CheckIcon />
                  </Button>
                </>
              ) : (
                !DEFAULT_RECORD_TYPES.includes(recordSets[set]?.recordSetName) && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingName(true);
                    }}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                )
              )}
              <div className="records_set_name">
                {!(isEditingName && !DEFAULT_RECORD_TYPES.includes(recordSets[set]?.recordSetName)) && (
                  <Typography>{recordSets[set]?.recordSetName}</Typography>
                )}
              </div>
            </div>

            <div className="records_set_right_hand_items">
              <MobileOnly>
                <RecordSetCacheButtons recordSet={recordSets[set]} setId={set} />
              </MobileOnly>

              <Tooltip
                classes={{ tooltip: 'toolTip' }}
                title="Toggle viewing the labels on the map for this layer.  If more than 200 are in the extent, you may need to zoom in to see what you are looking for.  For people on slow computers - it recalculates on drag and zoom so fewer small drags will decrease loading time."
              >
                <IconButton
                  className="records__set__layer_toggle"
                  onClick={(e) => onClickToggleLabel(set, e)}
                  color="primary"
                >
                  {recordSets[set]?.labelToggle ? <LabelIcon /> : <LabelClearIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip
                classes={{ tooltip: 'toolTip' }}
                title="Toggle viewing the layer on the map, and including these records in the Whats Here search results."
              >
                <IconButton
                  className="records__set__layer_toggle"
                  onClick={(e) => onClickToggleLayer(set, e)}
                  color="primary"
                >
                  {recordSets[set]?.mapToggle ? <LayersIcon /> : <LayersClearIcon />}
                </IconButton>
              </Tooltip>

              {!DEFAULT_RECORD_TYPES.includes(recordSets[set]?.recordSetName) && (
                <Tooltip
                  placement="bottom-start"
                  classes={{ tooltip: 'toolTip' }}
                  title="Change the colour of this layer."
                >
                  <IconButton onClick={(e) => onClickCycleColour(set, e)} color="primary">
                    <ColorLensIcon />
                  </IconButton>
                </Tooltip>
              )}

              {!DEFAULT_RECORD_TYPES.includes(recordSets[set]?.recordSetName) && (
                <Tooltip
                  classes={{ tooltip: 'toolTip' }}
                  title="Delete this layer/list of records.  Does NOT delete the actual records, just the set of filters / layer configuration."
                >
                  <IconButton onClick={(e) => onClickDeleteRecordSet(set, e)} color="primary">
                    <Delete />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        );
      })}
      <Button
        onClick={dispatch.bind(this, UserSettings.RecordSet.add(RecordSetType.Activity))}
        className={'addRecordSet'}
      >
        Add Layer of Records
      </Button>
      <Button onClick={dispatch.bind(this, UserSettings.RecordSet.add(RecordSetType.IAPP))} className={'addRecordSet'}>
        Add IAPP Layer of Records
      </Button>
    </div>
  );
};
