import { Pause, PlayArrow } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useDispatch } from 'react-redux';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';
import { isDrawing, isPaused, isEditing } from 'utils/geoTrackingHelpers';
import { useSelector } from 'utils/use_selector';

const PauseGeoTrackingButton = () => {
  const { status, isEditingShape } = useSelector((state) => state.Map.track_me_draw_geo);
  const isEditingDrawing = isEditing(status, isEditingShape);
  const dispatch = useDispatch();

  const handleClick = () => {
    if (isDrawing(status)) {
      dispatch(GeoTracking.pause());
    } else {
      dispatch(GeoTracking.resume());
    }
  };

  return (
    <div className={isDrawing(status) ? 'map-btn-selected' : 'map-btn'}>
      <HoverTooltip
        tooltipText={
          isEditingDrawing
            ? 'Finish editing to resume drawing'
            : isPaused(status)
              ? 'Resume Drawing Shape'
              : 'Pause Drawing Shape'
        }
      >
        <IconButton className="button" onClick={handleClick} disabled={isEditingDrawing}>
          {isPaused(status) ? <PlayArrow /> : <Pause />}
        </IconButton>
      </HoverTooltip>
    </div>
  );
};
export default PauseGeoTrackingButton;
