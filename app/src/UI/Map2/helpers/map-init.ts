import React from 'react';
import maplibregl, { LngLatBoundsLike, NavigationControl, ScaleControl } from 'maplibre-gl';
import proj4 from 'proj4';
import { PMTiles, Protocol } from 'pmtiles';
import { AppDispatch } from 'utils/use_selector';
import { TileCacheService } from 'utils/tile-cache';
import { MOBILE } from 'state/build-time-config';
import {
  LAYER_Z_BACKGROUND,
  LAYER_Z_FOREGROUND,
  LAYER_Z_MID,
  MAP_DEFINITIONS
} from 'UI/Map2/helpers/layer-definitions';

interface MapInitOptions {
  map: React.MutableRefObject<maplibregl.Map | null>;
  mapContainer: React.MutableRefObject<HTMLDivElement | null>;
  dispatch: AppDispatch;
  api_base: string;
  getAuthHeaderCallback: () => string;
  PUBLIC_MAP_URL: string;
  map_center: [number, number];
  tileCache: TileCacheService | null;
}

export const mapInit = (options: MapInitOptions) => {
  const { mapContainer, map, tileCache, map_center, getAuthHeaderCallback, PUBLIC_MAP_URL, api_base } = options;

  if (!mapContainer.current) {
    console.error('Mapinit invoked with invalid reference');
    throw new Error('Mapinit invoked with invalid reference');
  }

  const coordinatesContainer = document.createElement('div');
  coordinatesContainer.style.position = 'absolute';
  coordinatesContainer.style.top = '10px';
  coordinatesContainer.style.left = '90px';
  coordinatesContainer.style.background = 'rgba(255, 255, 255, 0.8)';
  coordinatesContainer.style.padding = '5px';
  coordinatesContainer.style.borderRadius = '5px';
  coordinatesContainer.style.zIndex = '99';
  mapContainer.current.appendChild(coordinatesContainer);

  const updateCoordinatesContainer = (x: number, y: number) => {
    const proj4_setdef = (utmZone: number): string => {
      const zdef = `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`;
      return zdef;
    };
    if (!map.current || !x || !y) {
      return;
    }

    const { lng, lat } = map.current.unproject([x, y]);
    const utmZone = Math.floor((lng + 180) / 6) + 1;
    proj4.defs([
      ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
      ['EPSG:AUTO', proj4_setdef(utmZone)]
    ]);

    const utm: [number, number] = proj4('EPSG:4326', 'EPSG:AUTO', [lng, lat]);

    coordinatesContainer.innerHTML = `
      <div>${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
      <div>Zone ${utmZone}, E: ${utm[0].toFixed(0)}, N: ${utm[1].toFixed(0)}</div>
    `;
  };
  mapContainer.current.addEventListener('mousemove', (e: MouseEvent) => {
    const { clientX, clientY } = e;
    updateCoordinatesContainer(clientX, clientY);
  });
  mapContainer.current.addEventListener('touchstart', (e: TouchEvent) => {
    const { clientX, clientY } = e.targetTouches[0];
    updateCoordinatesContainer(clientX, clientY);
  });

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

  const PMTILES_URL = PUBLIC_MAP_URL || `https://nrs.objectstore.gov.bc.ca/uphjps/invasives-local.pmtiles`;

  const p = new PMTiles(PMTILES_URL);

  // this is so we share one instance across the JS code and the map renderer
  pmtilesProtocol.add(p);
  // pmtilesProtocol.add(new PMTiles(new Fetc()));

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

  /* map can have platform-specific options */
  const platformOptions = (() => {
    if (MOBILE) {
      return {
        maxBounds: [-141.7761, 46.41459, -114.049, 60.00678] as LngLatBoundsLike
      };
    }
    return {};
  })();

  //now get the most current auth token from auth provider
  map.current = new maplibregl.Map({
    ...platformOptions,
    container: mapContainer.current,
    maxZoom: 24,
    zoom: 3,
    minZoom: 0,
    transformRequest: (url) => {
      if (url.includes(api_base)) {
        return {
          url,
          headers: {
            Authorization: getAuthHeaderCallback()
          }
        };
      }
      return {
        url
      };
    },
    center: [map_center[1], map_center[0]],
    style: {
      ...(MOBILE && { sprite: '/assets/basemaps/sprite/sprite' }),
      glyphs: MOBILE
        ? '/assets/basemaps/fonts/{fontstack}/{range}.pbf'
        : 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
      version: 8,
      sources: {
        ...MAP_DEFINITIONS.reduce((result, item) => {
          result[item.name] = item.source;
          return result;
        }, {})
      },
      layers: [
        {
          id: LAYER_Z_BACKGROUND,
          type: 'background',
          layout: {
            visibility: 'none'
          }
        },
        {
          id: LAYER_Z_MID,
          type: 'background',
          layout: {
            visibility: 'none'
          }
        },
        {
          id: LAYER_Z_FOREGROUND,
          type: 'background',
          layout: {
            visibility: 'none'
          }
        }
      ]
    }
  });

  const scale = new ScaleControl({
    maxWidth: 80,
    unit: 'metric'
  });
  const nav = new NavigationControl();
  map.current.addControl(scale, 'top-left');
  map.current.addControl(nav, 'top-left');
};
