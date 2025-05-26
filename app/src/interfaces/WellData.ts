import { Feature } from 'geojson';

/**
 * @desc Cleaned up Well data
 */
interface WellData {
  id: number;
  geometry: Feature;

  [key: PropertyKey]: any;
}

export default WellData;
