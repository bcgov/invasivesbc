#!/usr/bin/env node
//
import fs from 'node:fs';

const ROUGH_BOUNDS = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        coordinates: [
          [
            [-140.87086731197937, 60.46419819501159],
            [-136.11374392764537, 56.06149589051509],
            [-134.52724286732928, 53.4252518810076],
            [-126.1661662445477, 47.78428928683118],
            [-113.4821490602468, 47.96018838451704],
            [-113.49051111739226, 49.40658530287624],
            [-117.35801931123098, 54.87282309755955],
            [-119.01832603365955, 60.27485007776747],
            [-140.87086731197937, 60.46419819501159]
          ]
        ],
        type: 'Polygon'
      }
    }
  ]
};

// must match layer definition
const MAX_ZOOM = 6;

function long2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

function tileURL(z, x, y) {
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`;
}

const WRITE_FILES = false;
const WRITE_BIG_JSON_STRUCTURE = true;

async function computeRequiredTiles() {
  var estimated_size = 0;

  const minLat = Math.min(...ROUGH_BOUNDS.features[0].geometry.coordinates[0].map((c) => c[1]));
  const maxLat = Math.max(...ROUGH_BOUNDS.features[0].geometry.coordinates[0].map((c) => c[1]));
  const minLng = Math.min(...ROUGH_BOUNDS.features[0].geometry.coordinates[0].map((c) => c[0]));
  const maxLng = Math.max(...ROUGH_BOUNDS.features[0].geometry.coordinates[0].map((c) => c[0]));

  console.log(`${minLat} to ${maxLat} by ${minLng} to ${maxLng}`);

  const blob = [];

  for (var z = 0; z <= MAX_ZOOM; z++) {
    var startTileLat = lat2tile(minLat, z);
    var startTileLng = long2tile(minLng, z);

    var endTileLat = lat2tile(maxLat, z);
    var endTileLng = long2tile(maxLng, z);

    console.log(`Z:${z} -- ${startTileLat}:${startTileLng} to ${endTileLat}:${endTileLng}`);

    for (var x = Math.min(startTileLng, endTileLng); x <= Math.max(startTileLng, endTileLng); x++) {
      for (var y = Math.min(startTileLat, endTileLat); y <= Math.max(startTileLat, endTileLat); y++) {
        const url = tileURL(z, x, y);
        const response = await fetch(url);
        const data = Buffer.from(await response.arrayBuffer());
        if (WRITE_FILES) {
          fs.mkdirSync(`./offline/${z}/${x}`, { recursive: true });
          fs.writeFileSync(`./offline/${z}/${x}/${y}`, data);
        }
        if (WRITE_BIG_JSON_STRUCTURE) {
          blob.push({
            z,
            x,
            y,
            data: data.toString('base64')
          });
        }
      }
    }
  }
  // you might need a lot of RAM if you use a high zoom level -- this is really just for local testing
  if (WRITE_BIG_JSON_STRUCTURE) {
    fs.writeFileSync(`./src/constants/map_blobs.json`, JSON.stringify(blob, null, 2));
  }
}

await computeRequiredTiles();
