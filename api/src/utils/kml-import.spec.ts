import * as assert from 'assert';
import * as fs from 'fs';

import { GeoJSONFromKML, KMZToKML, sanitizeGeoJSON } from './kml-import';

describe('KML Utilities', function () {
  let KML_DATA_VALID: Buffer;
  let KML_DATA_ILLEGAL_GEOMETRIES: Buffer;
  let KMZ_DATA_VALID: Buffer;

  before(function () {
    KML_DATA_VALID = fs.readFileSync('test/kml/valid.kml');
    KML_DATA_ILLEGAL_GEOMETRIES = fs.readFileSync('test/kml/invalid.kml');
    KMZ_DATA_VALID = fs.readFileSync('test/kml/test.kmz');
  });

  it('Valid KML Import', function () {
    const geoJSON = GeoJSONFromKML(KML_DATA_VALID);
    const filtered = sanitizeGeoJSON(geoJSON);
    assert.equal(filtered.features.length, 2);
  });

  it('Invalid KML Import (Unacceptable geometries)', function () {
    const geoJSON = GeoJSONFromKML(KML_DATA_ILLEGAL_GEOMETRIES);
    const filtered = sanitizeGeoJSON(geoJSON);
    assert.equal(filtered.features.length, 0);
  });

  it('Valid KMZ Import', function () {
    const kmlData = KMZToKML(KMZ_DATA_VALID);
    const geoJSON = GeoJSONFromKML(kmlData);
    const filtered = sanitizeGeoJSON(geoJSON);
    assert.equal(filtered.features.length, 2);
  });
});
