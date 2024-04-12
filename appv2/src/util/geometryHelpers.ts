import area from '@turf/area';
import center from '@turf/center';
import * as turf from '@turf/helpers';
import { Feature } from 'geojson';

/**
 * Calculate the net area for the total geometry
 *
 * @param {Feature[]} geoJSON The geometry in GeoJSON format
 */
export function calculateGeometryArea(geometry: Feature[]) {
  let totalArea = 0;

  if (!geometry || !geometry.length || geometry[geometry.length - 1].geometry.type === 'LineString') {
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
  if (geo.geometry.type === 'Point' && !geo.properties.hasOwnProperty('radius')) {
    totalArea = 1;
  } else if (geo.geometry.type === 'Point' && geo.properties.hasOwnProperty('radius')) {
    totalArea = Math.PI * Math.pow(geo.properties.radius, 2);
  } else if (geo.geometry.type === 'Polygon') {
    totalArea = area(turf.polygon(geo.geometry['coordinates']));
  }

  return parseFloat(totalArea.toFixed(0));
}

/**
 * Calculate the anchor point lat/lng for the geometry
 *
 * @param {Feature[]} geoJSON The geometry in GeoJSON format
 */
export function calculateLatLng(geom: Feature[]) {
  if (!geom || !geom[geom.length - 1] || !geom[geom.length - 1].geometry) return;

  const geo = geom[geom.length - 1].geometry;
  const firstCoord = geo['coordinates'][0];

  let latitude = null;
  let longitude = null;

  /*
    Calculations based on business rules as to how anchor points need to be calculated
    for different geometry types
  */
  if (geo.type === 'Point') {
    latitude = geo.coordinates[1];
    longitude = firstCoord;
  } else if (geo.type === 'LineString') {
    latitude = firstCoord[1];
    longitude = firstCoord[0];
  } else if (!geom[0]?.properties?.isRectangle) {
    latitude = firstCoord[0][1];
    longitude = firstCoord[0][0];
  } else {
    const centerPoint = center(turf.polygon(geo['coordinates'])).geometry;
    latitude = centerPoint.coordinates[1];
    longitude = centerPoint.coordinates[0];
  }

  const latlng = {
    latitude: parseFloat(latitude.toFixed(6)),
    longitude: parseFloat(longitude.toFixed(6))
  };

  return latlng;
}
