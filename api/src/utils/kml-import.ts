import { JSDOM } from 'jsdom';
import GeoJSON from '@mapbox/togeojson';
import { getLogger } from './logger';
import AdmZip from 'adm-zip';
import { FeatureCollection } from 'geojson';

function KMZToKML(data: Buffer): Buffer {
  const log = getLogger('KML');

  const zipFile = new AdmZip(data);

  log.info({ message: 'parsing zip data' });

  try {
    if (!zipFile.test()) {
      log.info({ message: 'Bad compressed data' });
    }
  } catch (err) {
    log.error(err);
  }

  const mainDocumentFile = zipFile.getEntries().find((e) => {
    log.info(e.name);
    return e.name.match(/doc\.kml/i);
  });

  if (mainDocumentFile) {
    log.info({ message: 'found doc.kml in the KMZ' });
    return Buffer.from(zipFile.readAsText(mainDocumentFile));
  }

  log.error({ message: 'no doc.kml in this KMZ!' });

  throw new Error('No doc.xml in this KMZ file');
}

function GeoJSONFromKML(data: Buffer) {
  const log = getLogger('KML');

  log.info({ message: `parsing: ${data.length} bytes` });

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

  // filter out non-polygon features (V1)
  const newFeatures = data.features.map((feature) => {
    if (
      feature.geometry.type === 'Polygon' ||
      feature.geometry.type === 'LineString' ||
      feature.geometry.type === 'Point'
    ) {
      return {
        type: feature.type,
        geometry: feature.geometry,
        properties: {}
      };
    }
  });

  const filteredData: FeatureCollection = { type: 'FeatureCollection', features: newFeatures };

  //if empty
  if (filteredData.features.length < 1) {
    throw new Error(`Invalid geometry types, sanitized collection is empty`);
  }

  return filteredData;
}

export { GeoJSONFromKML, KMZToKML, sanitizeGeoJSON };
