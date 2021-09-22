// taken from https://gist.github.com/neilkennedy/9227665
/// <summary>
/// Takes an L.latLngBounds object and returns an 8 point L.polygon.
/// L.rectangle takes an L.latLngBounds object in its constructor but this only creates a polygon with 4 points.
/// This becomes an issue when you try and do spatial queries in SQL Server or another database because when the 4 point polygon is applied
/// to the curvature of the earth it loses it's "rectangular-ness".
/// The 8 point polygon returned from this method will keep it's shape a lot more.
/// </summary>
/// <param name="map">L.map object</param>
/// <returns type="">L.Polygon with 8 points starting in the bottom left and finishing in the center left</returns>
import * as L from 'leaflet';
function createPolygonFromBounds(latLngBounds, map) {
  var center = latLngBounds.getCenter();
  let latlngs = [];

  latlngs.push(latLngBounds.getSouthWest()); //bottom left
  latlngs.push({ lat: latLngBounds.getSouth(), lng: center.lng }); //bottom center
  latlngs.push(latLngBounds.getSouthEast()); //bottom right
  latlngs.push({ lat: center.lat, lng: latLngBounds.getEast() }); // center right
  latlngs.push(latLngBounds.getNorthEast()); //top right
  latlngs.push({ lat: latLngBounds.getNorth(), lng: map.getCenter().lng }); //top center
  latlngs.push(latLngBounds.getNorthWest()); //top left
  latlngs.push({ lat: map.getCenter().lat, lng: latLngBounds.getWest() }); //center left

  return L.polygon(latlngs);
}
export { createPolygonFromBounds };
