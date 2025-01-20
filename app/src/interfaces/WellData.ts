import { Feature } from '@turf/helpers';

/**
 * @desc Cleaned up Well data
 */
interface WellData {
  id: number;
  geometry: Feature;
  properties: {
    WELL_TAG_NUMBER: number;
  };
  [key: PropertyKey]: any;
}

export default WellData;
