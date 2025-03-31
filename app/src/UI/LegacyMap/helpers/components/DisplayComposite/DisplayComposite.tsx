import AccuracyDisplay from '../AccuracyDisplay/AccuracyDisplay';
import Coordinates from '../Coordinates/Coordinates';
import './DisplayComposite.css';

/**
 * @desc Lets the info components auto-position instead of relying on absolute positioning.
 */
const DisplayComposite = () => {
  return (
    <div id="map-display-composite">
      <Coordinates />
      <AccuracyDisplay />
    </div>
  );
};
export default DisplayComposite;
