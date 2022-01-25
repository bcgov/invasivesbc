import { JSDOM } from 'jsdom';
import * as GeoJSON from '@mapbox/togeojson';
import { getLogger } from './logger';
import AdmZip from 'adm-zip';
import { FeatureCollection } from 'geojson';

function KMZToKML(data: Buffer): Buffer {
  const log = getLogger('KML');

  const zipFile = new AdmZip(data);

  log.info('parsing zip data');

  try {
    if (!zipFile.test()) {
      log.info('Bad compressed data');
    }
  } catch (err) {
    log.error(err);
  }

  const mainDocumentFile = zipFile.getEntries().find((e) => {
    log.info(e.name);
    return e.name.match(/doc\.kml/i);
  });

  if (mainDocumentFile) {
    log.info('found doc.kml in the KMZ');
    return Buffer.from(zipFile.readAsText(mainDocumentFile));
  }

  log.error('no doc.kml in this KMZ!');

  throw new Error('No doc.xml in this KMZ file');
}

function GeoJSONFromKML(data: Buffer) {
  const log = getLogger('KML');

  log.info(`parsing: ${data.length} bytes`);

  let kmlDoc: any;

  try {
    kmlDoc = new JSDOM(data).window.document;
  } catch (err) {
    log.error(err);
    throw new Error('failed to parse KML into valid XML DOM tree');
  }

  return GeoJSON.kml(kmlDoc);
}

function sanitizeGeoJSON(data: FeatureCollection): FeatureCollection {

  if (!data || !data.type) {
    throw new Error(`Unrecognized input data format`);
  }
  if (data.type !== 'FeatureCollection') {
    throw new Error(`Invalid GeoJSON Type: ${data.type}`);
  }

  const filteredData: FeatureCollection = { type: 'FeatureCollection', features: [] };

  // filter out non-polygon features
  for (const f of data.features) {
    if (f.geometry.type === 'Polygon') {
      filteredData.features.push(f);
    }
  }

  return filteredData;
}

export { GeoJSONFromKML, KMZToKML, sanitizeGeoJSON };
