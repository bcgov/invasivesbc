import { Visibility, VisibilityOff } from '@mui/icons-material';

type Layer = {
  id: string;
  title: string;
  toggle: boolean;
};
type PropTypes = {
  onClick: (val: Layer) => void;
  layer: Layer;
  lastEntry: boolean;
};
const LayerPickerItem = ({ onClick, layer, lastEntry }: PropTypes) => {
  return (
    <>
      <li className="lp-layers-item">
        <button onClick={() => onClick(layer)}>{layer?.toggle ? <Visibility /> : <VisibilityOff />}</button>
        <p>{layer.title ?? 'Layer name is null'}</p>
      </li>
      {!lastEntry && (
        <li>
          <hr />
        </li>
      )}
    </>
  );
};
export default LayerPickerItem;
