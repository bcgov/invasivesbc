import { useMemo } from 'react';
import { useSelector } from 'utils/use_selector';
import 'UI/Features/LegacyMap/helpers/components/AccuracyDisplay/AccuracyDisplay.css';

const AccuracyDisplay = () => {
  const accuracyToggle = useSelector((state) => state.Map.accuracyToggle);
  const positionTracking = useSelector((state) => state.Map.positionTracking);
  const userCoords = useSelector((state) => state.Map?.userCoords);

  const shouldHide = useMemo(() => {
    return !userCoords?.accuracy || !positionTracking || !accuracyToggle;
  }, [accuracyToggle, positionTracking, userCoords]);

  if (shouldHide) return null;
  return <div id="accuracy-display">GPS Accuracy: {Math.floor(userCoords?.accuracy)}m</div>;
};

export default AccuracyDisplay;
