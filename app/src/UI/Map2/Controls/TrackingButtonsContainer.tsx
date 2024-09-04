import { useSelector } from 'utils/use_selector';
import FollowMe from './FollowMe';
import GeoTrackingButton from './GeoTrackingButton';
import PauseGeoTrackingButton from './PauseGeoTrackingButton';

const TrackingButtonsContainer = () => {
  const { isTracking } = useSelector((state) => state.Map.track_me_draw_geo);
  return (
    <>
      <FollowMe />
      <GeoTrackingButton />
      {isTracking && <PauseGeoTrackingButton />}
    </>
  );
};

export default TrackingButtonsContainer;
