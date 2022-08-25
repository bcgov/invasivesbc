import '@capacitor-community/http';
import { Http } from '@capacitor-community/http';
import SLDParser from 'geostyler-sld-parser';
import proj4 from 'proj4';
import reproject from 'reproject';
import { IndependentLayers } from './LayerLoaderHelpers/IndependentRenderLayers';
import encode from 'urlencode';
import { getSimplifiedGeoJSON } from 'hooks/useInvasivesApi';
const { stringify } = require('wkt');

const getHTTP = async (url) => {
  // Example of a GET request
  // Destructure as close to usage as possible for web plugin to work correctly
  // when running in the browser
  let ret;
  try {
    ret = await Http.request({
      method: 'GET',
      url: url,
      headers: {}
    });
  } catch (e) {
    console.log('failed http:');
    console.log(JSON.stringify(e));
  }

  return ret;
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
  let baseURL =
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
  let baseURL = 'https://openmaps.gov.bc.ca/geo/pub/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetStyles&layers=';
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
  if (Object.values(IndependentLayers).includes(layerName as any)) {
    return {};
  }
  let stylesURL = buildStylesURLForDataBC(layerName);
  let resp = await getHTTP(stylesURL);
  const sldParser = new SLDParser();
  let sldString = resp.data;
  let styles = await sldParser.readStyle(sldString);
  return styles;
};

export const getDataFromDataBC: any = async (
  layerName: string,
  geoJSON: Object,
  getSimplifiedJSON: any,
  dataBCAcceptsGeometry: boolean,
  pageSize?: number,
  startIndex?: number
) => {
  let totalInBox = 0;

  if (Object.values(IndependentLayers).includes(layerName as any)) {
    return [];
  }

  let URL = buildURLForDataBC(layerName, geoJSON, dataBCAcceptsGeometry);

  let resp = await getSimplifiedJSON(encode(URL), '0.02');

  let returnVal = resp;
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
  /*
  export const onlineConsumer: any = async (layerName, geoJsonFeature) => {
    //this is copied from useInvaisivesApi:
    const pageSize = 500;
    let totalInBox = 0;
    let startIndex = 0;
    let returnVal = [];

    const getURL = (layerName, startIndex, pageSize) => {
      return (
        'https://openmaps.gov.bc.ca/geo/ows?service=WFS&version=2.0&request=GetFeature&typeName=pub:' +
        layerName +
        '&startindex=' +
        startIndex +
        '&count=' +
        pageSize +
        //'&bbox=' + boundingBox[0].toString() + ',' + boundingBox[1].toString() + ',' + boundingBox[2].toString() + ',' + boundingBox[3].toString() +
        //'&sortBy=SEQUENCE_ID&outputFormat=application/json&srsname=EPSG:4326'
        '&outputFormat=application/json&srsname=EPSG:4326'
      );
    }*/

  /*
  //original layer name WHSE_BASEMAPPING.BC_MAJOR_CITIES_POINTS_500M
  //original polygon: 'GEOMETRY%2C%20POLYGON%20%28%28830772.7%20367537.4%2C%201202463%20367537.4%2C%201202463%20651616.7%2C%20830772.7%20651616.7%2C%20830772.7%20367537.4%29%29'
  const getURL2 = (layerName, startIndex, pageSize, geojson) => {
    try {
    console.log((geojson.gemoetry != null))
    console.log('common from geo')
    let geo = stringify(geojson)
    console.log('encoded from common')
    let encodedGeoFilter = encodeURI('&CQL_FILTER=WITHIN(GEOMETRY,' + geo + ')')
    let url = 'https://openmaps.gov.bc.ca/geo/pub/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&outputFormat=json&typeName=' + layerName +
      '&startindex=' +
      startIndex +
      '&count=' +
      pageSize + '&SRSNAME=EPSG%3A3857' + ((geojson)? encodedGeoFilter : '')
      //'&sortBy=SEQUENCE_ID&outputFormat=application/json&srsname=EPSG:4326'
      console.log('url: ' + url)
      return url;

    }
    catch(e)
    {
      console.log('failed to make url')
      console.log(e)
      console.log(JSON.stringify(e))
    }
    return ''

  };
  let URL = getURL2(layerName, startIndex, pageSize, geoJsonFeature);
  console.log('URL:')
  console.log(URL)
  let resp;
  try {
    resp = await doGet(URL);

    totalInBox = resp.data.numberMatched;
    returnVal.push(...resp.data.features);
    startIndex = 500;
  } catch (e) {
    console.log(e);
    return 0;
  }
  */
};

export function* getDataFromDataBCv2(
  layerName: string,
  geoJSON: Object,
  dataBCAcceptsGeometry: boolean,
  pageSize?: number,
  startIndex?: number
) {
  let totalInBox = 0;

  if (Object.values(IndependentLayers).includes(layerName as any)) {
    return [];
  }

  let URL = buildURLForDataBC(layerName, geoJSON, dataBCAcceptsGeometry);

  let resp = yield getSimplifiedGeoJSON(encode(URL), '0.02');

  let returnVal = resp;
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
  /*
  export const onlineConsumer: any = async (layerName, geoJsonFeature) => {
    //this is copied from useInvaisivesApi:
    const pageSize = 500;
    let totalInBox = 0;
    let startIndex = 0;
    let returnVal = [];

    const getURL = (layerName, startIndex, pageSize) => {
      return (
        'https://openmaps.gov.bc.ca/geo/ows?service=WFS&version=2.0&request=GetFeature&typeName=pub:' +
        layerName +
        '&startindex=' +
        startIndex +
        '&count=' +
        pageSize +
        //'&bbox=' + boundingBox[0].toString() + ',' + boundingBox[1].toString() + ',' + boundingBox[2].toString() + ',' + boundingBox[3].toString() +
        //'&sortBy=SEQUENCE_ID&outputFormat=application/json&srsname=EPSG:4326'
        '&outputFormat=application/json&srsname=EPSG:4326'
      );
    }*/

  /*
  //original layer name WHSE_BASEMAPPING.BC_MAJOR_CITIES_POINTS_500M
  //original polygon: 'GEOMETRY%2C%20POLYGON%20%28%28830772.7%20367537.4%2C%201202463%20367537.4%2C%201202463%20651616.7%2C%20830772.7%20651616.7%2C%20830772.7%20367537.4%29%29'
  const getURL2 = (layerName, startIndex, pageSize, geojson) => {
    try {
    console.log((geojson.gemoetry != null))
    console.log('common from geo')
    let geo = stringify(geojson)
    console.log('encoded from common')
    let encodedGeoFilter = encodeURI('&CQL_FILTER=WITHIN(GEOMETRY,' + geo + ')')
    let url = 'https://openmaps.gov.bc.ca/geo/pub/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&outputFormat=json&typeName=' + layerName +
      '&startindex=' +
      startIndex +
      '&count=' +
      pageSize + '&SRSNAME=EPSG%3A3857' + ((geojson)? encodedGeoFilter : '')
      //'&sortBy=SEQUENCE_ID&outputFormat=application/json&srsname=EPSG:4326'
      console.log('url: ' + url)
      return url;

    }
    catch(e)
    {
      console.log('failed to make url')
      console.log(e)
      console.log(JSON.stringify(e))
    }
    return ''

  };
  let URL = getURL2(layerName, startIndex, pageSize, geoJsonFeature);
  console.log('URL:')
  console.log(URL)
  let resp;
  try {
    resp = await doGet(URL);

    totalInBox = resp.data.numberMatched;
    returnVal.push(...resp.data.features);
    startIndex = 500;
  } catch (e) {
    console.log(e);
    return 0;
  }
  */
}
