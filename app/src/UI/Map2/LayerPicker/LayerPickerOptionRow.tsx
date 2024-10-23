import { Visibility, VisibilityOff } from '@mui/icons-material';

type Layer = {
  id: string;
  title: string;
  toggle: boolean;
};
type PropTypes = {
  onClick: (val: Layer) => void;
  layer: Layer;
};
const LayerPickerItem = ({ onClick, layer }: PropTypes) => {
  return (
    <li className="lp-layers-item">
      <button onClick={() => onClick(layer)}>{layer?.toggle ? <Visibility /> : <VisibilityOff />}</button>
      <p>{layer.title}</p>
    </li>
  );
};
export default LayerPickerItem;
