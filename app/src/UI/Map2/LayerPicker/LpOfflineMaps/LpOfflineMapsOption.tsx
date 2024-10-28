import { Visibility, VisibilityOff } from '@mui/icons-material';

type PropTypes = {
  id: string;
  lastChild: boolean;
  layerVisible: boolean;
  onClick: (arg: string) => void;
};

const LpOfflineMapsOptions = ({ id, lastChild, layerVisible, onClick }: PropTypes) => {
  return (
    <>
      <li className="lp-offline-map-option">
        <button onClick={onClick.bind(this, id)}>{layerVisible ? <Visibility /> : <VisibilityOff />}</button>
        <p>{id}</p>
      </li>
      {!lastChild && (
        <li>
          <hr />
        </li>
      )}
    </>
  );
};
export default LpOfflineMapsOptions;
