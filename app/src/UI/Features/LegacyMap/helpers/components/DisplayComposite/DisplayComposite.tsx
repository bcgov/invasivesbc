import AccuracyDisplay from 'UI/Features/LegacyMap/helpers/components/AccuracyDisplay/AccuracyDisplay';
import AddressLookup from 'UI/Features/LegacyMap/helpers/components/AddressLookup/AddressLookup';
import Coordinates from 'UI/Features/LegacyMap/helpers/components/Coordinates/Coordinates';
import 'UI/Features/LegacyMap/helpers/components/DisplayComposite/DisplayComposite.css';

/**
 * @desc Lets the info components auto-position instead of relying on absolute positioning.
 */
const DisplayComposite = () => {
  return (
    <div id="map-display-composite">
      <div className="composite-box">
        <AddressLookup />
        <Coordinates />
        <AccuracyDisplay />
      </div>
    </div>
  );
};
export default DisplayComposite;
