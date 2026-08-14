import { IconButton } from '@mui/material';
import PolylineIcon from '@mui/icons-material/Polyline';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import GeoShapes from 'constants/geoShapes';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import Prompt from 'state/actions/prompts/Prompt';
import { isTracking } from 'utils/geoTrackingHelpers';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';

const GeoTrackingButton = () => {
  const promptHandler = (input: string | number) => {
    dispatch(GeoTracking.start(input as GeoShapes));
  };

  const clickHandler = () => {
    if (tracking) {
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

  const dispatch = useDispatch();
  const status = useSelector((state) => state.Map.track_me_draw_geo.status);
  const tracking = isTracking(status);
  const activityGeo = useSelector((state) => state.ActivityPage.geometry_details?.shape);

  useEffect(() => {
    if (activityGeo && activityGeo?.properties?.error == 'true') {
      dispatch(GeoTracking.pause());
    }
  }, [activityGeo?.properties]);

  return (
    <div className={tracking ? 'map-btn-selected' : 'map-btn'}>
      <HoverTooltip tooltipText="Track My Path">
        <IconButton className="button" onClick={clickHandler}>
          <PolylineIcon /> <DirectionsWalkIcon />
        </IconButton>
      </HoverTooltip>
    </div>
  );
};

export default GeoTrackingButton;
