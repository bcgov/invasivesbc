import SLDParser from 'geostyler-sld-parser';
import proj4 from 'proj4';
import reproject from 'reproject';
import encode from 'urlencode';
import { getSimplifiedGeoJSON } from 'hooks/useInvasivesApi';
import { stringify } from 'wkt';

const getHTTP = async (url) => {
  try {
    return await fetch(url);
  } catch (e) {
    console.log('failed http:');
    console.log(JSON.stringify(e));
    return null;
  }
};

proj4.defs(
  'EPSG:3005',
  '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
);

const wktConvert = (input: any) => {
  return stringify(input);
};

export const buildURLForDataBC = (
  layerName: string,
  geoJSON: Object,
  dataBCAcceptsGeometry: boolean,
  pageSize?: number,
  startIndex?: number
) => {
  const baseURL =
    'https://openmaps.gov.bc.ca/geo/pub/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&outputFormat=json&typeName=pub:';
  const paging = '&startindex=' + startIndex + '&count=' + pageSize;
  const projection = '&SRSNAME=EPSG:3005';
  const reprojected = reproject.reproject(geoJSON, proj4.WGS84, proj4('EPSG:3005'));
  const reprojectedAsWKT = wktConvert(reprojected);
  const customCQL = '&CQL_FILTER=WITHIN(GEOMETRY,' + reprojectedAsWKT + ')';
  const encodedCQL = dataBCAcceptsGeometry ? encodeURI(customCQL) : '';
  return baseURL + layerName + paging + projection + encodedCQL;
};

const buildStylesURLForDataBC = (layerName: string) => {
  const baseURL = 'https://openmaps.gov.bc.ca/geo/pub/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetStyles&layers=';
  return baseURL + layerName;
};

const albersToGeog = (featureCollection: Object[]) => {
  try {
    const reprojected = reproject.reproject(featureCollection, proj4('EPSG:3005'), proj4.WGS84);
    return reprojected;
  } catch (e) {
    console.log('error converting back to geog from albers:');
    console.log(JSON.stringify(e));
    console.log(e);
  }
};

export const getStylesDataFromBC: any = async (layerName: string) => {
  /*if (Object.values(IndependentLayers).includes(layerName as any)) {
    return {};
  }*/
  const stylesURL = buildStylesURLForDataBC(layerName);
  const resp = await getHTTP(stylesURL);
  if (resp !== null) {
    const sldString = await resp.text();
    const sldParser = new SLDParser();
    return await sldParser.readStyle(sldString);
  }
  return null;
};

export const getDataFromDataBC: any = async (
  layerName: string,
  geoJSON: Object,
  getSimplifiedJSON: any,
  dataBCAcceptsGeometry: boolean,
  pageSize?: number,
  startIndex?: number
) => {
  const totalInBox = 0;

  /*if (Object.values(IndependentLayers).includes(layerName as any)) {
    return [];
  }*/

  let URL = buildURLForDataBC(layerName, geoJSON, dataBCAcceptsGeometry);

  let resp = await getSimplifiedJSON(encode(URL), '0.02');

  const returnVal = resp;
  // console.log('***features converted: ' + returnVal.length);
  if (!pageSize && !startIndex) {
    return returnVal;
  } else {
    const subsequentFetches = async (beginningIndex: number) => {
      URL = buildURLForDataBC(layerName, geoJSON, dataBCAcceptsGeometry, pageSize, beginningIndex);
      resp = await getHTTP(URL);
      // code redundancy const reprojected = albersToGeog(resp.data).features;
      return albersToGeog(resp);
    };

    try {
      while (returnVal.length < totalInBox) {
        const moreRecords = await subsequentFetches(startIndex);
        returnVal.push(...moreRecords);
      }
      return returnVal;
    } catch (e) {
      console.log('error fetching data from databc');
      console.log(e);
    }
    return [];
  }
};

export function* getDataFromDataBCv2(
  layerName: string,
  geoJSON: Object,
  dataBCAcceptsGeometry: boolean,
  pageSize?: number,
  startIndex?: number
) {
  const totalInBox = 0;

  let URL = buildURLForDataBC(layerName, geoJSON, dataBCAcceptsGeometry);

  let resp = yield getSimplifiedGeoJSON(encode(URL), '0.02');

  const returnVal = resp;
  // console.log('***features converted: ' + returnVal.length);
  if (!pageSize && !startIndex) {
    return returnVal;
  } else {
    const subsequentFetches = async (beginningIndex: number) => {
      URL = buildURLForDataBC(layerName, geoJSON, dataBCAcceptsGeometry, pageSize, beginningIndex);
      resp = await getHTTP(URL);
      // code redundancy const reprojected = albersToGeog(resp.data).features;
      return albersToGeog(resp);
    };

    try {
      while (returnVal.length < totalInBox) {
        const moreRecords = yield subsequentFetches(startIndex);
        returnVal.push(...moreRecords);
      }
      return returnVal;
    } catch (e) {
      console.log('error fetching data from databc');
      console.log(e);
    }
    return [];
  }
}
