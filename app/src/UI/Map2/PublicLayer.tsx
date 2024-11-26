import React, { useContext } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { PMTiles, Protocol } from 'pmtiles';
import { MOBILE } from 'state/build-time-config';
import { TileCacheService } from 'utils/tile-cache';
import { Context } from 'utils/tile-cache/context';

export const PublicLayer = () => {
  const tileCache = useContext(Context);
  const pmtilesProtocol = new Protocol();
  maplibregl.addProtocol('pmtiles', (request) => {
    return new Promise((resolve, reject) => {
      const callback = (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({ data });
        }
      };
      pmtilesProtocol.tile(request, callback);
    });
  });

  const PMTILES_URL = `https://nrs.objectstore.gov.bc.ca/rzivsz/invasives-prod.pmtiles/{z}/{x}/{y}`;

  const p = new PMTiles(PMTILES_URL);

  // this is so we share one instance across the JS code and the map renderer
  pmtilesProtocol.add(p);

  if (MOBILE) {
    if (!tileCache) {
      throw new Error('tile cache unexpectedly not available');
    }
    maplibregl.addProtocol('baked', async (request) => {
      try {
        const [repository, z, x, y] = request.url.replace('baked://', '').split('/');

        return await tileCache.getTile(repository, Number(z), Number(x), Number(y));
      } catch (e) {
        // this is a blank 256x256 image
        return TileCacheService.generateFallbackTile();
      }
    });
  }

  return (
    <>
      <Source id="pmtiles-public-layer-source" type="vector" tiles={[`pmtiles://${PMTILES_URL}`]} maxzoom={15}>
        <Layer
          id="invasives-layer"
          type="circle"
          source="pmtiles-public-layer-source"
          source-layer="invasives"
          paint={{ 'circle-color': 'lightskyblue', 'circle-opacity': 1.0 }}
          minzoom={0}
          maxzoom={24}
        />
        <Layer
          id="invasives-label"
          type="symbol"
          source="pmtiles-public-layer-source"
          source-layer="invasives"
          paint={{
            'text-color': 'black',
            'text-halo-color': 'white',
            'text-halo-width': 1,
            'text-halo-blur': 1
          }}
          layout={{
            'text-field': [
              'format',
              ['upcase', ['get', 'id']],
              { 'font-scale': 0.9 },
              '\n',
              {},
              ['get', 'map_symbol'],
              { 'font-scale': 0.9 }
            ],
            'text-font': ['literal', ['Open Sans Bold']],
            'text-offset': [0, 0.6],
            'text-anchor': 'top'
          }}
          minzoom={0}
          maxzoom={24}
        />
        <Layer
          id="iapp-layer"
          type="circle"
          source="pmtiles-public-layer-source"
          source-layer="iapp"
          paint={{ 'circle-color': 'limegreen', 'circle-opacity': 1.0 }}
          minzoom={0}
          maxzoom={24}
        />
        <Layer
          id="iapp-label"
          type="symbol"
          source="pmtiles-public-layer-source"
          source-layer="iapp"
          paint={{
            'text-color': 'black',
            'text-halo-color': 'white',
            'text-halo-width': 1,
            'text-halo-blur': 1
          }}
          layout={{
            'text-field': [
              'format',
              ['concat', 'IAPP Site: ', ['get', 'site_id']],
              { 'font-scale': 0.9 },
              '\n',
              {},
              ['get', 'map_symbol'],
              { 'font-scale': 0.9 }
            ],
            // the actual font names that work are here https://github.com/openmaptiles/fonts/blob/gh-pages/fontstacks.json
            'text-font': ['literal', ['Open Sans Bold']],
            'text-offset': [0, 0.6],
            'text-anchor': 'top'
          }}
          minzoom={0}
          maxzoom={24}
        />
      </Source>
    </>
  );
};
