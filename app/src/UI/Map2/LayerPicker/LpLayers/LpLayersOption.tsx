import { Visibility, VisibilityOff } from '@mui/icons-material';

type Layer = {
  id: string;
  title: string;
  toggle: boolean;
};
type PropTypes = {
  onClick: (val: Layer) => void;
  layer: Layer;
  lastChild: boolean;
};
const LpLayersOption = ({ onClick, layer, lastChild }: PropTypes) => {
  return (
    <>
      <li className="lp-layers-item">
        <button onClick={() => onClick(layer)}>{layer?.toggle ? <Visibility /> : <VisibilityOff />}</button>
        <p>{layer.title ?? 'Layer name is null'}</p>
      </li>
      {!lastChild && (
        <li>
          <hr />
        </li>
      )}
    </>
  );
};
export default LpLayersOption;
