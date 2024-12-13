import { ArrowForwardIos, ManageSearch, Map, Save } from '@mui/icons-material';
import LpModules from 'constants/LpModules';

type PropTypes = {
  clickHandler: (val: LpModules) => void;
  pathVal: LpModules;
};
const LayerPickerPathOption = ({ clickHandler, pathVal }: PropTypes) => {
  const icon = (() => {
    switch (pathVal) {
      case LpModules.DataBcLayers:
        return <Map />;
      case LpModules.Recordsets:
        return <ManageSearch />;
      case LpModules.MapTiles:
        return <Save />;
    }
  })();
  return (
    <li className="path-option">
      <button onClick={() => clickHandler(pathVal)}>
        <div>
          {icon} {pathVal}
        </div>
        <ArrowForwardIos color="disabled" />
      </button>
    </li>
  );
};

export default LayerPickerPathOption;
