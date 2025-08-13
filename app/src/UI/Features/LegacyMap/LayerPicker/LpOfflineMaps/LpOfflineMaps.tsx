import { Link } from 'react-router-dom';
import 'UI/Features/LegacyMap/LayerPicker/LpOfflineMaps/LpOfflineMaps.css';
import LpOfflineMapsOptions from 'UI/Features/LegacyMap/LayerPicker/LpOfflineMaps/LpOfflineMapsOption';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import { InvasivesMapLayerDefinitionWithState } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';

type PropTypes = {
  closePicker: () => void;
  layers: InvasivesMapLayerDefinitionWithState[];
  setOverlayState: (layer: string) => void;
};

const LpOfflineMaps = ({ closePicker, setOverlayState, layers }: PropTypes) => {
  const cachedToolTipText =
    'Use this option to show or hide the map tiles you’ve previously downloaded to your device.';

  return (
    <div id="lp-offline-maps">
      <h3>
        Cached Map Tiles <TooltipWithIcon tooltipText={cachedToolTipText} />
      </h3>
      {layers.filter((l) => l.mode === 'overlay' && l.selectionMode === 'offline-layers').length === 0 ? (
        <div className="lp-offline-maps-empty-collection">
          <p>You don't have any map areas cached</p>
        </div>
      ) : (
        <ul>
          {layers
            .filter((l) => l.mode === 'overlay' && l.selectionMode === 'offline-layers')
            .map((item) => (
              <LpOfflineMapsOptions
                id={item?.name ?? 'No Id provided'}
                description={item.displayName}
                key={item.name}
                layerVisible={layers.some((layer) => layer.name === item.name && layer.active)}
                onClick={() => setOverlayState(item.name)}
              />
            ))}
        </ul>
      )}
      <div className="guide">
        <p>
          You can modify or create new Map Caches from the <b>Offline Maps</b> page.
        </p>
        <Link to="/OfflineMaps" onClick={closePicker}>
          Go to offline maps page
        </Link>
      </div>
    </div>
  );
};

export default LpOfflineMaps;
