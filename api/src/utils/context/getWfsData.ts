import { FeatureCollection, Feature } from 'geojson';
/**
 * @desc Fetch Feature data from openMaps WFS Layer
 * @param layer WFS Layer name
 * @returns {Feature} WFS Entry in Area
 */
const getWfsData = async (latitude: number, longitude: number, layer: string): Promise<Feature> => {
  const bboxCoords = `${longitude},${latitude},${longitude},${latitude}`;
  const ROOT_URL = 'https://openmaps.gov.bc.ca/geo/pub/wfs';
  const queryParams = `?service=WFS&version=1.1.0&request=GetFeature&typeName=pub:${layer}&outputFormat=json&maxFeatures=1&srsName=epsg:4326&bbox=${bboxCoords},epsg:4326`;
  const data = await fetch(ROOT_URL + queryParams).then(async (r) => (await r.json()) as FeatureCollection);
  return data.features?.[0];
};

export default getWfsData;
