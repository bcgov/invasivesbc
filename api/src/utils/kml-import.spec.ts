import * as fs from 'fs';
import { beforeAll, test } from 'vitest';
import { expect } from 'chai';
import { GeoJSONFromKML, KMZToKML, sanitizeGeoJSON } from './kml-import.js';

describe('KML Utilities', function() {
  let KML_DATA_VALID: Buffer;
  let KML_DATA_ILLEGAL_GEOMETRIES: Buffer;
  let KMZ_DATA_VALID: Buffer;

  beforeAll(function() {
    KML_DATA_VALID = fs.readFileSync('test/kml/valid.kml');
    KML_DATA_ILLEGAL_GEOMETRIES = fs.readFileSync('test/kml/invalid.kml');
    KMZ_DATA_VALID = fs.readFileSync('test/kml/test.kmz');
  });

  test('Valid KML Import', function() {
    const geoJSON = GeoJSONFromKML(KML_DATA_VALID);
    const filtered = sanitizeGeoJSON(geoJSON);
    expect(filtered.features.length).to.equal(2);
  });

  test('Invalid KML Import (Unacceptable geometries)', function() {
    const geoJSON = GeoJSONFromKML(KML_DATA_ILLEGAL_GEOMETRIES);
    const filtered = sanitizeGeoJSON(geoJSON);
    expect(filtered.features.length).to.equal(0);
  });

  test('Valid KMZ Import', function() {
    const kmlData = KMZToKML(KMZ_DATA_VALID);
    const geoJSON = GeoJSONFromKML(kmlData);
    const filtered = sanitizeGeoJSON(geoJSON);
    expect(filtered.features.length).to.equal(2);
  });
});
