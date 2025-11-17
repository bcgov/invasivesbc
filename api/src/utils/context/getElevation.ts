import { Point } from 'geojson';

interface ResObject {
  altitude: number;
  vertex: boolean;
  geometry: Point;
}

/**
 * @desc Fetch Altitude data from the Geogratis service
 * @param lat Longitude Coordinate
 * @param lng Latitude Coordinate
 * @returns Altitude
 */
const getElevation = async (lat: number, lng: number): Promise<number> => {
  const url = `https://geogratis.gc.ca/services/elevation/cdem/altitude?lat=${lat}&lon=${lng}`;
  const { altitude } = await fetch(url).then(async (r) => (await r.json()) as ResObject);
  return altitude;
};

export default getElevation;
