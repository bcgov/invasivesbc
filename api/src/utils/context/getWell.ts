import distance from '@turf/distance';
import { point } from '@turf/helpers';
import nearestPoint from '@turf/nearest-point';
import { FeatureCollection, Point } from 'geojson';
import proj4 from 'proj4';

const getWell = async (latitude: number, longitude: number) => {
  const ALBERS =
    '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs';
  const alb = proj4(ALBERS, [longitude, latitude]);
  const coords = `${alb[0]}+${alb[1]}`;

  const BASE_URL = 'https://openmaps.gov.bc.ca/geo/pub/wfs';
  const DATASET = 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW';
  const CQL = `CQL_FILTER=DWITHIN(GEOMETRY,POINT(${coords}),500,meters)`;
  const url = `${BASE_URL}?service=WFS&version=2.0.0&request=GetFeature&typeName=${DATASET}&outputFormat=json&maxFeatures=1000&srsName=epsg:4326&${CQL}`;

  const data = await fetch(url).then(async (r) => (await r.json()) as FeatureCollection<Point>);

  if (data?.features?.length === 0) return { distance: null, well: null };
  const loc = point([longitude, latitude]);
  const closestWell = nearestPoint(loc, data);
  const dist = Math.round(distance(loc, closestWell) * 1000);
  return {
    distance: dist,
    well: closestWell
  };
};

export default getWell;
