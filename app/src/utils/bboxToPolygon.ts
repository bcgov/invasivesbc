import { Feature, Polygon } from '@turf/helpers';
import { RepositoryBoundingBoxSpec } from './tile-cache';

/**
 * @desc Takes bounding from recordset metadata and convert into a Geojson Polygon
 * @param bbox Cached bounding box
 * @returns {Feature<Polygon>} Geojson Bounding box
 */
function bboxToPolygon(bbox: Record<PropertyKey, number> | RepositoryBoundingBoxSpec): Feature<Polygon> {
  const { minLatitude, minLongitude, maxLatitude, maxLongitude } = bbox;
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [minLongitude, minLatitude],
          [minLongitude, maxLatitude],
          [maxLongitude, maxLatitude],
          [maxLongitude, minLatitude],
          [minLongitude, minLatitude]
        ]
      ]
    },
    properties: {}
  };
}

export default bboxToPolygon;
