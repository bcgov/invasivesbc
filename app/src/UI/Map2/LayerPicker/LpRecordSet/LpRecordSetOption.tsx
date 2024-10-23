import { Palette, Visibility, VisibilityOff } from '@mui/icons-material';

type PropTypes = {
  recordSet: Record<string, any>;
  lastChild: boolean;
  canColour: boolean;
};
const LpRecordSetOption = ({ recordSet, lastChild, canColour }: PropTypes) => {
  console.log(lastChild);
  return (
    <>
      <li className="lp-record-set-option">
        <div>
          <button>{recordSet?.toggle ? <Visibility /> : <VisibilityOff />}</button>
          {canColour && (
            <button>
              <Palette />
            </button>
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
