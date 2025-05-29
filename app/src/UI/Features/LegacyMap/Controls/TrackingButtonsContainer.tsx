import { useSelector } from 'utils/use_selector';
import FollowMe from 'UI/Features/LegacyMap/Controls/FollowMe';
import GeoTrackingButton from 'UI/Features/LegacyMap/Controls/GeoTrackingButton';
import PauseGeoTrackingButton from 'UI/Features/LegacyMap/Controls/PauseGeoTrackingButton';

const TrackingButtonsContainer = () => {
  const { isTracking } = useSelector((state) => state.Map.track_me_draw_geo);
  const url = useSelector((state) => state.AppMode.url);
  const isInActivity = url?.includes('Activity:');
  return (
    <>
      <FollowMe />
      {isInActivity && (
        <>
          <GeoTrackingButton />
          {isTracking && <PauseGeoTrackingButton />}
        </>
      )}
    </>
  );
};

export default TrackingButtonsContainer;
