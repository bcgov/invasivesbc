import { useSelector } from 'utils/use_selector';
import GeoTrackingButton from 'UI/Features/LegacyMap/Controls/GeoTrackingButton';
import PauseGeoTrackingButton from 'UI/Features/LegacyMap/Controls/PauseGeoTrackingButton';
import { isTracking } from 'utils/geoTrackingHelpers';

const TrackingButtonsContainer = () => {
  const { status } = useSelector((state) => state.Map.track_me_draw_geo);
  const tracking = isTracking(status);
  const url = useSelector((state) => state.AppMode.url);
  const isInActivity = url?.includes('Activity');

  return (
    <>
      {isInActivity && (
        <>
          <GeoTrackingButton />
          {tracking && <PauseGeoTrackingButton />}
        </>
      )}
    </>
  );
};

export default TrackingButtonsContainer;
