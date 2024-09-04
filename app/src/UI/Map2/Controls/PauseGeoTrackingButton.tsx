import { Pause, PlayArrow } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE, MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME } from 'state/actions';
import { useSelector } from 'utils/use_selector';

const PauseGeoTrackingButton = () => {
  const { drawingShape } = useSelector((state) => state.Map.track_me_draw_geo);
  const [show, setShow] = useState<boolean>(false);
  const divRef = useRef();
  const dispatch = useDispatch();

  const handleClick = () => {
    if (drawingShape) {
      dispatch({ type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE });
    } else {
      dispatch({ type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME });
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
