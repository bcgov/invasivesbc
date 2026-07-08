import area from '@turf/area';
import pointOnFeature from '@turf/point-on-feature';
import * as turf from '@turf/helpers';
import { Feature, Position } from 'geojson';
import GeoShapes from 'constants/geoShapes';

/**
 * Calculate the net area for the total geometry
 *
 * @param {Feature[]} geometry The geometry in GeoJSON format
 */
export function calculateGeometryArea(geometry: Feature[]) {
  //zero if linestring:
  if (geometry?.[geometry?.length - 1]?.geometry?.type === GeoShapes.LineString) {
    return 0;
  }
  let totalArea = 0;

  if (!geometry || !geometry.length || geometry[geometry.length - 1].geometry.type === GeoShapes.LineString) {
    return totalArea;
  }

  /*
    Use the last index because sometimes we allow multiple geos on map
  */
  const geo = geometry[geometry.length - 1];

  /*
    If the geometry is a point, then the area is nominally 1 square metre

    Since circles are represented as points, if the geo has the radius property
    we use it to calculate the area of the circle

    Otherwise, calculate the area of the polygon using turf
  */
  if (
    geo.geometry.type === GeoShapes.Point &&
    geo.properties &&
    !Object.prototype.hasOwnProperty.call(geo.properties, 'radius')
  ) {
    totalArea = 1;
  } else if (
    geo.geometry.type === GeoShapes.Point &&
    geo.properties &&
    Object.prototype.hasOwnProperty.call(geo.properties, 'radius')
  ) {
    totalArea = Math.round(Math.PI * Math.pow(geo.properties.radius, 2));
  } else if (geo.geometry.type === GeoShapes.Polygon) {
    totalArea = area(turf.polygon(geo.geometry['coordinates']));
  }

  return Math.round(totalArea);
}

/**
 * Calculate the anchor point lat/lng for the geometry
 *
 * @param {Feature[]} geom The geometry in GeoJSON format
 */
export function calculateLatLng(geom: Feature[] | Feature) {
  if (!geom) return;

  if (Array.isArray(geom)) {
    if (geom.length === 0) return;
    geom = geom[0];
  }
  const pointFromGeom = pointOnFeature(geom);
  return {
    longitude: parseFloat(pointFromGeom.geometry.coordinates[0].toFixed(6)),
    latitude: parseFloat(pointFromGeom.geometry.coordinates[1].toFixed(6))
  };
}

export function normalizeToPolygonCoordinates(
  coords: Position | Position[] | Position[][] | Position[][][]
): Position[][] {
  let normalized: Position[][];

  if (!Array.isArray(coords[0][0])) {
    normalized = [coords as Position[]];
  } else {
    normalized = coords as Position[][];
  }

  const ring = normalized[0];
  const first = ring[0];
  const last = ring[ring.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push(first);
  }

  return normalized;
}
