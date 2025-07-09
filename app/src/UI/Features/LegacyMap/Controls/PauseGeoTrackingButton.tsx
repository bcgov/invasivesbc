import { Pause, PlayArrow } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import { isDrawing, isPaused, isEditing } from 'utils/geoTrackingHelpers';
import { useSelector } from 'utils/use_selector';

const PauseGeoTrackingButton = () => {
  const { status, isEditingShape } = useSelector((state) => state.Map.track_me_draw_geo);
  const isEditingDrawing = isEditing(status, isEditingShape);
  const [show, setShow] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();

  const handleClick = () => {
    if (isDrawing(status)) {
      dispatch(GeoTracking.pause());
    } else {
      dispatch(GeoTracking.resume());
    }
  };

  return (
    <div
      ref={divRef}
      className={isEditingDrawing ? 'map-btn-disabled' : isDrawing(status) ? 'map-btn-selected' : 'map-btn'}
    >
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title={
          isEditingDrawing
            ? 'Finish editing to resume drawing'
            : isPaused(status)
              ? 'Resume Drawing Shape'
              : 'Pause Drawing Shape'
        }
        placement="top-end"
      >
        <span>
          <IconButton className="button" onClick={handleClick} disabled={isEditingDrawing}>
            {isPaused(status) ? <PlayArrow /> : <Pause />}
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
export default PauseGeoTrackingButton;
