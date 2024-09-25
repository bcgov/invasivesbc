import { Pause, PlayArrow } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import { useSelector } from 'utils/use_selector';

const PauseGeoTrackingButton = () => {
  const { drawingShape } = useSelector((state) => state.Map.track_me_draw_geo);
  const [show, setShow] = useState<boolean>(false);
  const divRef = useRef();
  const dispatch = useDispatch();

  const handleClick = () => {
    if (drawingShape) {
      dispatch(GeoTracking.pause());
    } else {
      dispatch(GeoTracking.resume());
    }
  };
  return (
    <div ref={divRef} className={drawingShape ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title={drawingShape ? 'Pause Drawing Shape' : 'Resume Drawing Shape'}
        placement="top-end"
      >
        <span>
          <IconButton className="button" onClick={handleClick}>
            {drawingShape ? <Pause /> : <PlayArrow />}
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
export default PauseGeoTrackingButton;
