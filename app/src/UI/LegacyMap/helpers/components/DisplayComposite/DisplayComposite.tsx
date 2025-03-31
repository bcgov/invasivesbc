import AccuracyDisplay from '../AccuracyDisplay/AccuracyDisplay';
import Coordinates from '../Coordinates/Coordinates';
import './DisplayComposite.css';

const DisplayComposite = () => {
  return (
    <div id="map-display-composite">
      <Coordinates />
      <AccuracyDisplay />
    </div>
  );
};
export default DisplayComposite;
