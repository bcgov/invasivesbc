import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { RecordSetCacheButtons } from 'UI/Features/Records/RecordSetCacheButtons';
import { IconButton, Tooltip } from '@mui/material';
import { RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import { ColorLens, Delete, Label, LabelOff, Layers, LayersClear } from '@mui/icons-material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'utils/use_selector';
import Activity from 'state/actions/activity/Activity';
import IappActions from 'state/actions/activity/Iapp';
import { useRecordSetControls } from 'utils/useRecordSetControls';

type PropTypes = {
  isDefaultRecordset: boolean;
  recordset: UserRecordSet;
  omit?: {
    cache?: boolean;
    colour?: boolean;
    delete?: boolean;
    label?: boolean;
    layer?: boolean;
  };
};
const RecordSetControl = ({ isDefaultRecordset, recordset, omit }: PropTypes) => {
  const LABEL_TOGGLE_TIP =
    'Toggle viewing the labels on the map for this layer.  If more than 200 are in the extent, you may need to zoom in to see what you are looking for.  For people on slow computers - it recalculates on drag and zoom so fewer small drags will decrease loading time.';
  const LAYER_TOGGLE_TIP =
    'Toggle viewing the layer on the map, and including these records in the Whats Here search results.';
  const COLOUR_CYCLE_TIP = 'Change the colour of this layer.';
  const DELETE_TIP =
    'Delete this layer/list of records.  Does NOT delete the actual records, just the set of filters / layer configuration.';

  const RECORD_ID = recordset.id;
  const dispatch = useDispatch();
  const { cycleRecordsetColour, toggleRecordsetLabel, toggleRecordsetLayer, deleteRecordSet } =
    useRecordSetControls(RECORD_ID);
  const hasLayerIndex = useSelector(
    (state) => !!state.Map.layers.find((layer) => layer?.recordSetID === RECORD_ID)?.layerState
  );

  if (!hasLayerIndex) {
    const payload = {
      recordSetID: RECORD_ID,
      tableFiltersHash: recordset?.tableFiltersHash ?? ''
    };
    if (recordset.recordSetType === RecordSetType.IAPP) {
      dispatch(IappActions.getIdsForRecordset(payload));
    } else if (recordset.recordSetType === RecordSetType.Activity) {
      dispatch(Activity.getIdsForRecordset(payload));
    }
  }
  const [isProgressBar, setIsProgressBar] = useState(false);

  const handleProgressStateChange = (state: boolean) => {
    setIsProgressBar(state);
  };

  return (
    <div className={isProgressBar ? 'record-set-control record-set-progressbar' : 'record-set-control '}>
      <div>
        {!isDefaultRecordset && !omit?.cache && (
          <MobileOnly>
            <RecordSetCacheButtons
              recordSet={recordset}
              setId={RECORD_ID}
              onCacheStateChange={handleProgressStateChange}
            />
          </MobileOnly>
        )}
      </div>

      <div>
        {!omit?.label && (
          <Tooltip classes={{ tooltip: 'toolTip' }} title={LABEL_TOGGLE_TIP}>
            <span>
              <IconButton
                disabled={!recordset?.mapToggle || !hasLayerIndex}
                onClick={toggleRecordsetLabel}
                color="primary"
                data-testid="label-toggle"
              >
                {recordset?.labelToggle && recordset?.mapToggle ? <Label /> : <LabelOff />}
              </IconButton>
            </span>
          </Tooltip>
        )}

        {!omit?.layer && (
          <Tooltip classes={{ tooltip: 'toolTip' }} title={LAYER_TOGGLE_TIP}>
            <IconButton
              data-testid="layer-toggle"
              onClick={toggleRecordsetLayer}
              color="primary"
              disabled={!hasLayerIndex}
            >
              {recordset?.mapToggle ? <Layers /> : <LayersClear />}
            </IconButton>
          </Tooltip>
        )}

        {!isDefaultRecordset && (
          <>
            {!omit?.colour && (
              <Tooltip placement="bottom-start" classes={{ tooltip: 'toolTip' }} title={COLOUR_CYCLE_TIP}>
                <IconButton
                  data-testid="cycle-color"
                  onClick={cycleRecordsetColour}
                  color="primary"
                  disabled={!hasLayerIndex}
                >
                  <ColorLens />
                </IconButton>
              </Tooltip>
            )}
            {!omit?.delete && (
              <Tooltip classes={{ tooltip: 'toolTip' }} title={DELETE_TIP}>
                <IconButton data-testid="delete-recordset" onClick={deleteRecordSet} color="primary">
                  <Delete />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default RecordSetControl;
