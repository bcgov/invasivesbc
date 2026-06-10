import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useInvasivesMapLayers } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import './offlineMapControls.css';

type PropTypes = {
  id: string;
  name: string;
  hideLayerToggle?: boolean;
  hideDelete?: boolean;
};

const OfflineMapControls = ({ id, name, hideLayerToggle = false }: PropTypes) => {
  const { setOverlayState, layers } = useInvasivesMapLayers();

  const isEnabled = layers.some((layer) => `pmtiles-${name}` === layer.source);

  return (
    <div className="offline-map-controls">
      {!hideLayerToggle && (
        <IconButton
          onClick={() => {
            setOverlayState(name);
          }}
        >
          {isEnabled ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      )}
    </div>
  );
};

export default OfflineMapControls;
