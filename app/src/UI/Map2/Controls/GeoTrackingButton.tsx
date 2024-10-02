import { IconButton, Tooltip } from '@mui/material';
import PolylineIcon from '@mui/icons-material/Polyline';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import GeoShapes from 'constants/geoShapes';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import GeoTracking from 'state/actions/geotracking/Geotracking';
import Prompt from 'state/actions/prompts/Prompt';

/**
 * TrackMeButton
 * @description Component to handle the functionality of the find me button
 * @returns {void}
 */
export const GeoTrackingButton = (props) => {
  const { isTracking } = useSelector((state) => state.Map.track_me_draw_geo);
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const divRef = useRef();

  const promptHandler = (input: string | number) => {
    dispatch(GeoTracking.start(input as GeoShapes));
  };
  const clickHandler = () => {
    setShow(false);
    if (isTracking) {
      dispatch(GeoTracking.stop());
    } else {
      dispatch(
        Prompt.radio({
          callback: promptHandler,
          options: [GeoShapes.LineString, GeoShapes.Polygon],
          prompt: [
            'You are about to enable GeoTracking, a tool that uses GPS coordinates to draw a shape on the map.',
            'To complete the shape, select the GeoTracking button again.'
          ],
          title: 'Are you sure you want to track your path?',
          confirmText: 'Start Tracking'
        })
      );
    }
  };
  // this is to stop user from clicking it again while things are happening
  return (
    <div ref={divRef} className={isTracking ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title="Track My Path"
        placement="top-end"
      >
        <span>
          <IconButton className="button" onClick={clickHandler}>
            <PolylineIcon /> <DirectionsWalkIcon />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};

export default GeoTrackingButton;
