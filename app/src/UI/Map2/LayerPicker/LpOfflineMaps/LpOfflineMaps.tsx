import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useSelector } from 'utils/use_selector';
import './LpOfflineMaps.css';
import LpOfflineMapsOptions from './LpOfflineMapsOption';
import TooltipWithIcon from 'UI/TooltipWithIcon/TooltipWithIcon';
import MapActions from 'state/actions/map';

type PropTypes = {
  closePicker: () => void;
};
const LpOfflineMaps = ({ closePicker }: PropTypes) => {
  const cachedToolTipText =
    'Use this option to show or hide the map tiles you’ve previously downloaded to your device.';
  const onCacheClick = (id: string) => {
    dispatch(MapActions.toggleOverlay(id));
  };
  const visibleLayers = useSelector((state) => state.Map.enabledOverlayLayers) ?? [];
  const repositories = useSelector((state) => state.TileCache?.repositories) ?? [];
  const dispatch = useDispatch();
  return (
    <div id="lp-offline-maps">
      <h3>
        Cached Map Tiles <TooltipWithIcon tooltipText={cachedToolTipText} />
      </h3>
      <p className="lp-subheader"></p>
      {repositories.length === 0 ? (
        <div className="lp-offline-maps-empty-collection">
          <p>You don't have any map areas cached</p>
        </div>
      ) : (
        <ul>
          {repositories
            .filter((item) => item.status === 'READY')
            .map((item, index) => (
              <LpOfflineMapsOptions
                id={item?.id ?? 'No Id provided'}
                description={item.description}
                key={item.id}
                lastChild={index === repositories.length - 1}
                layerVisible={visibleLayers.includes(item?.id)}
                onClick={onCacheClick}
              />
            ))}
        </ul>
      )}
      <div className="guide">
        <p>
          You can modify or create new Map Caches from the <b>Tile Cache Status</b> page.
        </p>
        <Link to="/OfflineTiles" onClick={closePicker}>
          Go to Tile Cache Status page
        </Link>
      </div>
    </div>
  );
};

export default LpOfflineMaps;
