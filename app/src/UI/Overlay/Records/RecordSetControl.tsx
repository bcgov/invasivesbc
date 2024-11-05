import { MobileOnly } from 'UI/Predicates/MobileOnly';
import { RecordSetCacheButtons } from './RecordSetCacheButtons';
import { IconButton, Tooltip } from '@mui/material';
import { UserRecordSet } from 'interfaces/UserRecordSet';
import { ColorLens, Delete, Label, LabelOff, Layers, LayersClear } from '@mui/icons-material';
import { MouseEvent } from 'react';

type PropTypes = {
  isDefaultRecordset: boolean;
  recordset: UserRecordSet;
  recordsetKey: string;
  onClickToggleLabel: (set: string, e: MouseEvent<HTMLButtonElement>) => void;
  onClickToggleLayer: (set: string, e: MouseEvent<HTMLButtonElement>) => void;
  onClickCycleColour: (set: string, e: MouseEvent<HTMLButtonElement>) => void;
  onClickDeleteRecordSet: (set: string, e: MouseEvent<HTMLButtonElement>) => void;
};
const RecordSetControl = ({
  isDefaultRecordset,
  recordset,
  recordsetKey,
  onClickToggleLabel,
  onClickToggleLayer,
  onClickCycleColour,
  onClickDeleteRecordSet
}: PropTypes) => {
  const LABEL_TOGGLE_TIP =
    'Toggle viewing the labels on the map for this layer.  If more than 200 are in the extent, you may need to zoom in to see what you are looking for.  For people on slow computers - it recalculates on drag and zoom so fewer small drags will decrease loading time.';
  const LAYER_TOGGLE_TIP =
    'Toggle viewing the layer on the map, and including these records in the Whats Here search results.';
  const COLOUR_CYCLE_TIP = 'Change the colour of this layer.';
  const DELETE_TIP =
    'Delete this layer/list of records.  Does NOT delete the actual records, just the set of filters / layer configuration.';

  return (
    <div className="record-set-control">
      <MobileOnly>
        <RecordSetCacheButtons recordSet={recordset} setId={recordsetKey} />
      </MobileOnly>

      <Tooltip classes={{ tooltip: 'toolTip' }} title={LABEL_TOGGLE_TIP}>
        <IconButton onClick={(e) => onClickToggleLabel(recordsetKey, e)} color="primary">
          {recordset?.labelToggle ? <Label /> : <LabelOff />}
        </IconButton>
      </Tooltip>

      <Tooltip classes={{ tooltip: 'toolTip' }} title={LAYER_TOGGLE_TIP}>
        <IconButton onClick={(e) => onClickToggleLayer(recordsetKey, e)} color="primary">
          {recordset?.mapToggle ? <Layers /> : <LayersClear />}
        </IconButton>
      </Tooltip>

      {!isDefaultRecordset && (
        <>
          <Tooltip placement="bottom-start" classes={{ tooltip: 'toolTip' }} title={COLOUR_CYCLE_TIP}>
            <IconButton onClick={(e) => onClickCycleColour(recordsetKey, e)} color="primary">
              <ColorLens />
            </IconButton>
          </Tooltip>
          <Tooltip classes={{ tooltip: 'toolTip' }} title={DELETE_TIP}>
            <IconButton onClick={(e) => onClickDeleteRecordSet(recordsetKey, e)} color="primary">
              <Delete />
            </IconButton>
          </Tooltip>
        </>
      )}
    </div>
  );
};
export default RecordSetControl;
