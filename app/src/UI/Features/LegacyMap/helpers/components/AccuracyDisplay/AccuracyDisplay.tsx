import { useEffect, useState } from 'react';
import { useSelector } from 'utils/use_selector';
import { selectMap } from 'state/reducers/map';
import 'UI/Features/LegacyMap/helpers/components/AccuracyDisplay/AccuracyDisplay.css';

const AccuracyDisplay = () => {
  const { positionTracking, userCoords } = useSelector(selectMap);
  const [showAccuracy, setShowAccuracy] = useState<boolean>(positionTracking);

  useEffect(() => {
    setShowAccuracy(positionTracking);
  }, [positionTracking]);

  if (!showAccuracy || !userCoords?.accuracy) {
    return;
  }
  return <div id="accuracy-display">GPS Accuracy: {Math.floor(userCoords?.accuracy)}m</div>;
};

export default AccuracyDisplay;
