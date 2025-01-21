import { Feature } from '@turf/helpers';

/**
 * @desc Cleaned up Well data
 */
interface WellData {
  id: number;
  geometry: Feature;
  [key: PropertyKey]: any;
}

export default WellData;
