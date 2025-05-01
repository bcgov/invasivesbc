import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import './map.css';

import { useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import {
  LAYER_Z_BACKGROUND,
  LAYER_Z_FOREGROUND,
  LAYER_Z_MID,
  MAP_DEFINITIONS
} from 'UI/LegacyMap/helpers/functional/layer-definitions';
import { Context } from 'utils/tile-cache/context';
import {
  rebuildLayersOnTableHashUpdate,
  refreshColoursOnColourUpdate,
  refreshOfflineActivitiesLayer,
  refreshVisibilityOnToggleUpdate,
  removeRecordsetLayersOnForcedRedraw,
  removeOfflineActivitiesLayer,
  toggleOfflineActivityLabels
} from 'UI/LegacyMap/helpers/functional/recordset-layers';
import {
  addWMSLayersIfNotExist,
  refreshWMSOnToggle,
  removeWMSLayers
} from 'UI/LegacyMap/helpers/functional/wms-layers';
import {
  addServerBoundariesIfNotExists,
  refreshServerBoundariesOnToggle
} from 'UI/LegacyMap/helpers/functional/server-boundaries';
import {
  addClientBoundariesIfNotExists,
  refreshClientBoundariesOnToggle,
  removeClientBoundaries
} from 'UI/LegacyMap/helpers/functional/client-boundaries';
import { DEFAULT_LOCAL_LAYERS } from 'state/reducers/map';
import { MapContext } from 'UI/LegacyMap/helpers/components/MapContext';
import { InvasivesMap } from 'UI/LegacyMap/InvasivesMap';
import { PositionMarkers } from 'UI/LegacyMap/helpers/components/PositionMarkers';
import maplibregl from 'maplibre-gl';
import { MEMORY_CONSTRAINED_DEVICE, MOBILE } from 'state/build-time-config';
import { PMTiles, Protocol } from 'pmtiles';
import { TileCacheService } from 'utils/tile-cache';
import { ReactiveLayers } from 'UI/LegacyMap/helpers/components/ReactiveLayers';
import { CurrentActivityLayer } from 'UI/LegacyMap/helpers/components/CurrentActivityLayer';
import { DrawControls } from 'UI/LegacyMap/helpers/components/DrawControls';
import { toggleLayerOnBool } from 'UI/LegacyMap/helpers/functional/utility-functions';
import { OfflineActivityRecord, OfflineActivitySyncState } from 'state/reducers/offlineActivity';
import DisplayComposite from './helpers/components/DisplayComposite/DisplayComposite';
import { sha1 } from 'utils/sha1';
/*

  MW: For every state obj, property, or array that the map cares about, there is a hook that listens for changes and handler functions to deal with them.
  I've tried to make it so the handlers can safely run more than once, and no destructing and recreating when not necessary.

 */
export const Map = ({ children }) => {
  const tileCache = useContext(Context);

  const mapContainer: React.MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

  // Auth + Network
  const authenticated = useSelector((state) => state.Auth.authenticated);
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);
  const rolesInitialized = useSelector((state) => state.Auth.rolesInitialized);
  const connectedToNetwork = useSelector((state) => state.Network.connected);
  const { API_BASE, PUBLIC_MAP_URL } = useSelector((state) => state.Configuration.current);

  // RecordSet Layers
  const storeLayers = useSelector((state) => state.Map.layers);

  // Offline Activities layer
  const { serializedActivities, mapToggle, labelToggle } = useSelector((state) => state.OfflineActivity);

  // WMS Layers
  const simplePickerLayers2 = useSelector((state) => state.Map.simplePickerLayers2);

  //KML
  const serverBoundaries = useSelector((state) => state.Map.serverBoundaries);

  //Drawn boundaries:
  const clientBoundaries = useSelector((state) => state.Map.clientBoundaries);

  // Map position jump
  const map_center = useSelector((state) => state.Map.map_center);
  const map_zoom = useSelector((state) => state.Map.map_zoom);
  const baseMapLayer = useSelector((state) => state.Map.baseMapLayer);

  const [cacheStatusHash, setCacheStatusHash] = useState<string>('init');
  const [currentAuthHeader, setCurrentAuthHeader] = useState<string>('');
  const [map, setMap] = useState<InvasivesMap>();
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainer.current) {
      console.error('Mapinit invoked with invalid reference');
      throw new Error('Mapinit invoked with invalid reference');
    }

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

    const tileCacheSettings = (() => {
      if (MEMORY_CONSTRAINED_DEVICE) {
        // disable maplibre's builtin tile cache
        return { maxTileCacheSize: 0, minTileCacheSize: 0 };
      }
      return {};
    })();

    setMap(
      new InvasivesMap({
        container: mapContainer.current,
        maxZoom: 24,
        ...tileCacheSettings,
        zoom: 3,
        minZoom: 0,
        transformRequest: (url) => {
          if (url.includes(API_BASE)) {
            return {
              url,
              headers: {
                Authorization: (() => {
                  if (authHeaderRef.current === undefined) {
                    console.error('requested access before header received');
                    return '';
                  }
                  return authHeaderRef.current;
                })()
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
      })
    );
  }, []);

  useEffect(() => {
    if (!map || mapReady) return;

    map.once('idle', function () {
      if (map !== null) {
        map.resize();
      }
    });

    if (map.isStyleLoaded()) {
      setMapReady(true);
    }
  }, [map?.isStyleLoaded()]);

  const authHeaderRef = useRef<string>();
  authHeaderRef.current = currentAuthHeader;

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    // get it once with no delay
    getCurrentJWT().then((header) => {
      setCurrentAuthHeader(header);
    });

    // and then regularly thereafter
    const id = setInterval(() => {
      getCurrentJWT().then((header) => {
        setCurrentAuthHeader(header);
      });
    }, 10000);

    return () => {
      clearInterval(id);
    };
  }, [authenticated]);

  useEffect(() => {
    // update cacheStatusHash when any recordset is added/removed or has a cache status change. this will force a redraw.
    if (!MOBILE) {
      return;
    }
    let cacheStatusTuples = '';
    for (const layer of storeLayers) {
      cacheStatusTuples += `${layer.recordSetID}-${layer.layerState.cacheMetadataStatus}`;
    }
    sha1(cacheStatusTuples).then((hash) => {
      setCacheStatusHash(hash);
    });
  }, [storeLayers]);

  useEffect(() => {
    if (!mapReady) return;
    if (!map) return;
    removeRecordsetLayersOnForcedRedraw(map);
  }, [connectedToNetwork, cacheStatusHash]);

  // RecordSet Layers:
  useEffect(() => {
    if (!mapReady) return;
    if (!map) return;
    (async () => {
      await rebuildLayersOnTableHashUpdate(storeLayers, map, API_BASE, connectedToNetwork);
      refreshColoursOnColourUpdate(storeLayers, map);
      refreshVisibilityOnToggleUpdate(storeLayers, map);
    })();
  }, [storeLayers, map, mapReady, connectedToNetwork, loggedInOrWorkingOffline, cacheStatusHash]);

  // Offline Activities Layer:
  useEffect(() => {
    if (!map || !mapReady || !MOBILE) return;

    if (!mapToggle || !loggedInOrWorkingOffline) {
      removeOfflineActivitiesLayer(map);
    } else {
      const unsyncedOfflineActivities = Object.fromEntries(
        Object.entries(serializedActivities).filter(
          ([, value]) => (value as OfflineActivityRecord).sync_state !== OfflineActivitySyncState.SYNCHRONIZED
        )
      );
      refreshOfflineActivitiesLayer(
        map,
        mapToggle,
        labelToggle,
        unsyncedOfflineActivities as Record<string, OfflineActivityRecord>
      );
    }
  }, [serializedActivities, map, mapReady, loggedInOrWorkingOffline, mapToggle]);

  // Offline Activities Label:
  useEffect(() => {
    if (!map || !mapReady || !MOBILE) return;
    (async () => {
      await toggleOfflineActivityLabels(map, labelToggle);
    })();
  }, [serializedActivities, map, mapReady, loggedInOrWorkingOffline, labelToggle]);

  // Layer picker:
  useEffect(() => {
    if (!mapReady) return;
    if (!map) return;
    const layers = connectedToNetwork ? simplePickerLayers2 : DEFAULT_LOCAL_LAYERS;
    if (!loggedInOrWorkingOffline) {
      removeWMSLayers(layers, map);
      return;
    }

    addWMSLayersIfNotExist(layers, map, API_BASE);
    refreshWMSOnToggle(layers, map);
  }, [simplePickerLayers2, map, mapReady, baseMapLayer, connectedToNetwork, authenticated, rolesInitialized]);

  useEffect(() => {
    if (!mapReady) return;
    if (authenticated) {
      addServerBoundariesIfNotExists(serverBoundaries, map);
      refreshServerBoundariesOnToggle(serverBoundaries, map);
    }
  }, [serverBoundaries, authenticated, map, mapReady]);

  // Custom Layers:
  useEffect(() => {
    if (!mapReady || !map) return;

    if (!loggedInOrWorkingOffline) {
      removeClientBoundaries(clientBoundaries, map);
      return;
    }

    addClientBoundariesIfNotExists(clientBoundaries, map);
    refreshClientBoundariesOnToggle(clientBoundaries, map);
  }, [clientBoundaries, map, mapReady, loggedInOrWorkingOffline]);

  // Jump Nav
  useEffect(() => {
    if (!mapReady) return;
    if (!map) return;

    try {
      if (map_center && map_zoom) {
        map.jumpTo({ center: map_center, zoom: map_zoom });
      }
    } catch (e) {
      console.error(e);
    }
  }, [map_center, map_zoom]);

  useEffect(() => {
    setInterval(() => {
      if (map) {
        setMapLoaded(map.areTilesLoaded());
      }
    }, 1000);
  }, [map]);

  // toggle public map pmtile layer
  useEffect(() => {
    if (!mapReady) return;
    if (!map) return;
    if (loggedInOrWorkingOffline) {
      toggleLayerOnBool(map, 'invasivesbc-pmtile-vector', false);
      toggleLayerOnBool(map, 'iapp-pmtile-vector', false);
      toggleLayerOnBool(map, 'invasivesbc-pmtile-vector-label', false);
      toggleLayerOnBool(map, 'iapp-pmtile-vector-label', false);
    }
  }, [loggedInOrWorkingOffline, map, mapReady]);

  return (
    <div className="map-containing-block">
      <div className="MapWrapper">
        <div ref={mapContainer} className="Map" />
        <div id="LoadingMap" className={!mapLoaded ? 'loadingMap' : 'loadedMap'}>
          Loading tiles...
        </div>

        <MapContext.Provider value={map}>
          <DisplayComposite />
          <DrawControls />
          <ReactiveLayers mapReady={mapReady} />
          <PositionMarkers mapReady={mapReady} />
          <CurrentActivityLayer mapReady={mapReady} />
        </MapContext.Provider>

        {children}
      </div>
    </div>
  );
};
