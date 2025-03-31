import { useEffect, useState } from 'react';
import { useSelector } from 'utils/use_selector';
import { selectMap } from 'state/reducers/map';
import './AccuracyDisplay.css';

const AccuracyDisplay = () => {
  const { accuracyToggle, positionTracking, userCoords } = useSelector(selectMap);
  const [showAccuracy, setShowAccuracy] = useState<boolean>(accuracyToggle && positionTracking);

  useEffect(() => {
    setShowAccuracy(accuracyToggle && positionTracking);
  }, [accuracyToggle, positionTracking]);

  if (!showAccuracy || !userCoords?.accuracy == undefined) {
    return;
  }
  return <div id="accuracy-display">GPS Accuracy: {Math.floor(userCoords?.accuracy)}m</div>;
};

export default AccuracyDisplay;
