import { Visibility, VisibilityOff } from '@mui/icons-material';

type PropTypes = {
  id: string;
  layerVisible: boolean;
  description: string;
  onClick: (arg: string) => void;
};

const LpOfflineMapsOptions = ({ description, id, layerVisible, onClick }: PropTypes) => {
  return (
    <>
      <li className="lp-offline-map-option">
        <button onClick={onClick.bind(this, id)}>{layerVisible ? <Visibility /> : <VisibilityOff />}</button>
        <p>{description || id}</p>
      </li>
    </>
  );
};
export default LpOfflineMapsOptions;
