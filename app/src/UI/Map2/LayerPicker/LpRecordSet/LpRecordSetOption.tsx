import { Label, LabelOff, Palette, Visibility, VisibilityOff } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
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
      <li className="lp-record-set-option" style={{ backgroundColor: getBgColor() }}>
        <div>
          <Tooltip
            classes={{ tooltip: 'toolTip' }}
            title="Toggle viewing the labels on the map for this layer.  If more than 200 are in the extent, you may need to zoom in to see what you are looking for.  For people on slow computers - it recalculates on drag and zoom so fewer small drags will decrease loading time."
          >
            <button onClick={() => toggleLabelVisibility(recordSet.id!)}>
              {recordSet.labelToggle ? <Label /> : <LabelOff />}
            </button>
          </Tooltip>
          <Tooltip
            classes={{ tooltip: 'toolTip' }}
            title="Toggle viewing the layer on the map, and including these records in the Whats Here search results."
          >
            <button onClick={() => toggleVisibility(recordSet.id!)}>
              {recordSet?.mapToggle ? <Visibility /> : <VisibilityOff />}
            </button>
          </Tooltip>
          {canColour && (
            <Tooltip classes={{ tooltip: 'toolTip' }} title="Change the colour of this layer.">
              <button onClick={() => cycleColour(recordSet.id!)}>
                <Palette />
              </button>
            </Tooltip>
          )}
        </div>
        <p>{recordSet?.recordSetName ?? 'Recordset name is null'}</p>
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
