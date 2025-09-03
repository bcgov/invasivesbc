import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { RecordSetCacheButtons } from 'UI/Features/Records/RecordSetCacheButtons';
import { IconButton, Tooltip } from '@mui/material';
import { UserRecordSet } from 'interfaces/UserRecordSet';
import { ColorLens, Delete, Label, LabelOff, Layers, LayersClear } from '@mui/icons-material';
import { useState } from 'react';
import { useSelector } from 'utils/use_selector';
import { useRecordSetControls } from 'utils/useRecordSetControls';
import './recordsetControl.css';

type PropTypes = {
  isDefaultRecordset: boolean;
  recordset: UserRecordSet;
  hideCache?: boolean;
  hideColour?: boolean;
  hideDelete?: boolean;
  hideLabel?: boolean;
  hideLayer?: boolean;
};
const RecordSetControl = ({
  isDefaultRecordset,
  recordset,
  hideCache = false,
  hideColour = false,
  hideDelete = false,
  hideLabel = false,
  hideLayer = false
}: PropTypes) => {
  const LABEL_TOGGLE_TIP =
    'Toggle viewing the labels on the map for this layer.  If more than 200 are in the extent, you may need to zoom in to see what you are looking for.  For people on slow computers - it recalculates on drag and zoom so fewer small drags will decrease loading time.';
  const LAYER_TOGGLE_TIP =
    'Toggle viewing the layer on the map, and including these records in the Whats Here search results.';
  const COLOUR_CYCLE_TIP = 'Change the colour of this layer.';
  const DELETE_TIP =
    'Delete this layer/list of records.  Does NOT delete the actual records, just the set of filters / layer configuration.';

  const RECORD_ID = recordset.id;
  const { cycleRecordsetColour, toggleRecordsetLabel, toggleRecordsetLayer, deleteRecordSet } =
    useRecordSetControls(RECORD_ID);
  const hasLayerIndex = useSelector(
    (state) => !!state.Map.layers.find((layer) => layer?.recordSetID === RECORD_ID)?.layerState
  );
  const [isProgressBar, setIsProgressBar] = useState(false);

  const handleProgressStateChange = (state: boolean) => {
    setIsProgressBar(state);
  };

  return (
    <div className={isProgressBar ? 'record-set-control record-set-progressbar' : 'record-set-control '}>
      {!isDefaultRecordset && !hideCache && (
        <MobileOnly>
          <div>
            <RecordSetCacheButtons
              recordSet={recordset}
              setId={RECORD_ID}
              onCacheStateChange={handleProgressStateChange}
            />
          </div>
        </MobileOnly>
      )}
      <div className="record-set-buttons">
        {!hideLabel && (
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

        {!hideLayer && (
          <Tooltip classes={{ tooltip: 'toolTip' }} title={LAYER_TOGGLE_TIP}>
            <span>
              <IconButton
                data-testid="layer-toggle"
                onClick={toggleRecordsetLayer}
                color="primary"
                disabled={!hasLayerIndex}
              >
                {recordset?.mapToggle ? <Layers /> : <LayersClear />}
              </IconButton>
            </span>
          </Tooltip>
        )}

        {!isDefaultRecordset && (
          <>
            {!hideColour && !isDefaultRecordset && (
              <Tooltip placement="bottom-start" classes={{ tooltip: 'toolTip' }} title={COLOUR_CYCLE_TIP}>
                <span>
                  <IconButton
                    data-testid="cycle-color"
                    onClick={cycleRecordsetColour}
                    color="primary"
                    disabled={!hasLayerIndex}
                  >
                    <ColorLens />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {!hideDelete && (
              <Tooltip classes={{ tooltip: 'toolTip' }} title={DELETE_TIP}>
                <span>
                  <IconButton data-testid="delete-recordset" onClick={deleteRecordSet} color="primary">
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default RecordSetControl;
