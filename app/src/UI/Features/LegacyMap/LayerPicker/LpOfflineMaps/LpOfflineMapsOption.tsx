import LayerIcon from '../LayerIcon';

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
        <button onClick={onClick.bind(this, id)}>{<LayerIcon active={layerVisible} />}</button>
        <p>{description || id}</p>
      </li>
    </>
  );
};
export default LpOfflineMapsOptions;
