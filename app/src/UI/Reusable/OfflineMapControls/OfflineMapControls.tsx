import { Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useInvasivesMapLayers } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import './offlineMapControls.css';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import { useDispatch } from 'utils/use_selector';

type PropTypes = {
  id: string;
  omit?: {
    show?: boolean;
    delete?: boolean;
  };
};

const OfflineMapControls = ({ id, omit }: PropTypes) => {
  const dispatch = useDispatch();
  const { setOverlayState, layers } = useInvasivesMapLayers();
  const removeSubCache = () => {
    dispatch(PlanMyTrip.removeSubCache({ id, cache: 'mapTiles' }));
  };
  const isEnabled = layers.some((layer) => id === layer.source && layer?.layout?.visibility === 'visible');
  return (
    <div className="offline-map-controls">
      {!omit?.show && (
        <IconButton onClick={() => setOverlayState(id)}>{isEnabled ? <Visibility /> : <VisibilityOff />}</IconButton>
      )}
      {!omit?.delete && (
        <IconButton onClick={removeSubCache}>
          <Delete />
        </IconButton>
      )}
    </div>
  );
};

export default OfflineMapControls;
