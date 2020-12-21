import { Feature } from 'geojson';
import * as turf from '@turf/turf';

/**
 * Calculate the net area for the total geometry
 *
 * @param {Feature[]} geoJSON The geometry in GeoJSON format
 */
export function calculateGeometryArea(geometry: Feature[]) {
  let totalArea = 0;

  if (!geometry || !geometry.length || geometry[0].geometry.type === 'LineString') {
    return parseFloat(totalArea.toFixed(0));
  }

  const geo = geometry[0];
  if (geo.geometry.type === 'Point' && geo.properties.hasOwnProperty('radius')) {
    totalArea = Math.PI * Math.pow(geo.properties.radius, 2);
  } else if (geo.geometry.type === 'Polygon') {
    totalArea = turf.area(turf.polygon(geo.geometry['coordinates']));
  }

  return parseFloat(totalArea.toFixed(0));
}

/**
 * Calculate the anchor point lat/lng for the geometry
 *
 * @param {Feature[]} geoJSON The geometry in GeoJSON format
 */
export function calculateLatLng(geom: Feature[]) {
  if (!geom[0] || !geom[0].geometry) return;

  const geo = geom[0].geometry;
  const firstCoord = geo['coordinates'][0];

  let latitude = null;
  let longitude = null;

  if (geo.type === 'Point') {
    latitude = geo.coordinates[1];
    longitude = firstCoord;
  } else if (geo.type === 'LineString') {
    latitude = firstCoord[1];
    longitude = firstCoord[0];
  } else if (!geom[0].properties.isRectangle) {
    latitude = firstCoord[0][1];
    longitude = firstCoord[0][0];
  } else {
    const centerPoint = turf.center(turf.polygon(geo['coordinates'])).geometry;
    latitude = centerPoint.coordinates[1];
    longitude = centerPoint.coordinates[0];
  }

  const latlng = {
    latitude: parseFloat(latitude.toFixed(6)),
    longitude: parseFloat(longitude.toFixed(6))
  };

  return latlng;
}
