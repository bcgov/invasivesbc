import { Label, LabelOff, Layers, LayersClear, Palette } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { UserRecordSet } from 'interfaces/UserRecordSet';

type PropTypes = {
  recordSet: UserRecordSet;
  lastChild: boolean;
  canColour: boolean;
  toggleVisibility: (val: string) => void;
  toggleLabelVisibility: (val: string) => void;
  cycleColour: (val: string) => void;
};

const LpRecordSetOption = ({
  recordSet,
  lastChild,
  canColour,
  cycleColour,
  toggleVisibility,
  toggleLabelVisibility
}: PropTypes) => {
  const getBgColor = () => (recordSet?.color ? `${recordSet.color}25` : 'white');
  return (
    <>
      <li data-testid="record-set" className="lp-record-set-option" style={{ backgroundColor: getBgColor() }}>
        <div>
          <Tooltip
            classes={{ tooltip: 'toolTip' }}
            title="Toggle viewing the labels on the map for this layer.  If more than 200 are in the extent, you may need to zoom in to see what you are looking for.  For people on slow computers - it recalculates on drag and zoom so fewer small drags will decrease loading time."
          >
            <IconButton
              data-testid="label-toggle"
              disabled={!recordSet.mapToggle}
              onClick={() => toggleLabelVisibility(recordSet.id)}
            >
              {recordSet.labelToggle ? <Label /> : <LabelOff />}
            </IconButton>
          </Tooltip>
          <Tooltip
            classes={{ tooltip: 'toolTip' }}
            title="Toggle viewing the layer on the map, and including these records in the Whats Here search results."
          >
            <IconButton data-testid="layer-toggle" onClick={() => toggleVisibility(recordSet.id)}>
              {recordSet?.mapToggle ? <Layers /> : <LayersClear />}
            </IconButton>
          </Tooltip>
          {canColour && (
            <Tooltip classes={{ tooltip: 'toolTip' }} title="Change the colour of this layer.">
              <IconButton data-testid="cycle-color" onClick={() => cycleColour(recordSet.id)}>
                <Palette />
              </IconButton>
            </Tooltip>
          )}
        </div>
        <p>{recordSet?.recordSetName || `New Recordset - ${recordSet.recordSetType}`}</p>
      </li>
      {!lastChild && (
        <li>
          <hr />
        </li>
      )}
    </>
  );
};

export default LpRecordSetOption;
