import AccuracyDisplay from 'UI/Features/LegacyMap/helpers/components/AccuracyDisplay/AccuracyDisplay';
import Coordinates from 'UI/Features/LegacyMap/helpers/components/Coordinates/Coordinates';
import 'UI/Features/LegacyMap/helpers/components/DisplayComposite/DisplayComposite.css';

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
