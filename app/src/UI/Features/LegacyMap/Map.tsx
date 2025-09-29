import 'maplibre-gl/dist/maplibre-gl.css';
import React, { Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react';
import './map.css';

import { useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { InvasivesMap } from 'UI/Features/LegacyMap/InvasivesMap';
import { PositionMarkers } from 'UI/Features/LegacyMap/helpers/components/PositionMarkers';
import maplibregl from 'maplibre-gl';
import { PMTiles, Protocol } from 'pmtiles';
import { TileCacheService } from 'utils/tile-cache';
import { CurrentActivityLayer } from 'UI/Features/LegacyMap/helpers/components/CurrentActivityLayer';
import { DrawControls } from 'UI/Features/LegacyMap/helpers/components/DrawControls';
import DisplayComposite from './helpers/components/DisplayComposite/DisplayComposite';
import { StartupContext } from 'UI/StartupCoordinator/StartupCoordinator';
import {
  addClientBoundariesIfNotExists,
  addServerBoundariesIfNotExists,
  refreshClientBoundariesOnToggle,
  refreshServerBoundariesOnToggle,
  removeClientBoundaries,
  removeOrphanClientBoundaries
} from './helpers/functional/handleBoundaries';
import { ButtonContainer } from 'UI/Features/LegacyMap/Controls/ButtonContainer';
import { LayerPicker } from 'UI/Features/LegacyMap/LayerPicker/LayerPicker';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import CachedMapLayer from './helpers/components/CachedMapLayer';
import { SourceComponent } from 'UI/Features/LegacyMap/helpers/components/SourceComponent';
import { LayerComponent } from 'UI/Features/LegacyMap/helpers/components/LayerComponent';
import { SourceCleanupComponent } from 'UI/Features/LegacyMap/helpers/components/SourceCleanupComponent';
import { POSITIONING_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/positioning-layers';
import { useInvasivesMapLayers } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import { OfflineMapsPluginPMTilesSource } from 'utils/offline-protomaps/capacitor';
import { DEMO_DOWNLOADED_FILENAME } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/demo-offline-vector';
import LayerDataMarker from './helpers/components/LayerDataMarker/LayerDataMarker';
import { useRecordSetControls } from 'utils/useRecordSetControls';
import OfflineRecordsetLayer from './helpers/components/OfflineRecordsetLayer';

const OfflineProtoMapsDebugModal = React.lazy(
  () => import('UI/Features/LegacyMap/helpers/components/OfflineProtomaps/Debug')
);

export const Map: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { tileService: tileCache } = useContext(StartupContext);

  const mapContainer: React.MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

  // Auth + Network
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);
  const configuration = useSelector((state) => state.Configuration.current);

  //KML
  const serverBoundaries = useSelector((state) => state.Map.serverBoundaries);

  //Drawn boundaries:
  const clientBoundaries = useSelector((state) => state.Map.clientBoundaries);

  // Map position jump
  const map_center = useSelector((state) => state.Map.map_center);
  const map_zoom = useSelector((state) => state.Map.map_zoom);

  const [map, setMap] = useState<InvasivesMap>();
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);

  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_BASE);

  const { sources, layers, availableLayerDefinitions, setActiveBaseMap, setOverlayState } = useInvasivesMapLayers();
  const { recordsetLayers, recordsetSources } = useRecordSetControls();
  useEffect(() => {
    if (!mapContainer.current) {
      console.error('Mapinit invoked with invalid reference');
      throw new Error('Mapinit invoked with invalid reference');
    }

    maplibregl.addProtocol('api', async (request) => {
      const fetchRequest = new Request(request.url.replace('api://', API_BASE));
      fetchRequest.headers.set('Authorization', await getCurrentJWT());
      const result = await fetch(fetchRequest);
      if (result.ok) {
        if (result.bytes) {
          return {
            data: await result.bytes()
          };
        } else if (result.arrayBuffer) {
          return {
            data: await result.arrayBuffer()
          };
        } else {
          console.error('Unable to load response. Response object unreadable.');
          return { data: undefined };
        }
      }
      return {
        data: undefined
      };
    });

    maplibregl.addProtocol('databc', async (request) => {
      let rewrittenURL: string;

      if (configuration.features.MAP_PROXY_DATABC_LAYERS.enabled) {
        //proxy via API server
        rewrittenURL = `${API_BASE}/api/proxy/openmaps?url=${encodeURIComponent(request.url.replace('databc://', 'https://'))}`;

        const fetchRequest = new Request(rewrittenURL);
        fetchRequest.headers.set('Authorization', await getCurrentJWT());

        const result = await fetch(fetchRequest);
        if (result.ok) {
          if (result.bytes) {
            return {
              data: await result.bytes()
            };
          } else if (result.arrayBuffer) {
            return {
              data: await result.arrayBuffer()
            };
          } else {
            console.error('Unable to load response. Response object unreadable.');
            return { data: undefined };
          }
        }
        return {
          data: undefined
        };
      } else {
        //rewrite as direct request
        rewrittenURL = request.url.replace('databc://', 'https://');
        const fetchRequest = new Request(rewrittenURL);

        const result = await fetch(fetchRequest);
        if (result.ok) {
          if (result.bytes) {
            return {
              data: await result.bytes()
            };
          } else if (result.arrayBuffer) {
            return {
              data: await result.arrayBuffer()
            };
          } else {
            console.error('Unable to load response. Response object unreadable.');
            return { data: undefined };
          }
        }
        return {
          data: undefined
        };
      }
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

    const PMTILES_URL =
      configuration.runtime.PUBLIC_MAP_URL || `https://nrs.objectstore.gov.bc.ca/uphjps/invasives-local.pmtiles`;
    const p = new PMTiles(PMTILES_URL);

    // this is so we share one instance across the JS code and the map renderer
    pmtilesProtocol.add(p);

    // eg:
    pmtilesProtocol.add(new PMTiles(new OfflineMapsPluginPMTilesSource(DEMO_DOWNLOADED_FILENAME)));

    if (configuration.features.CACHE_TILES.enabled) {
      if (!tileCache) {
        console.error('tile cache unexpectedly not available');
        maplibregl.addProtocol('baked', async () => {
          // this is a blank 256x256 image
          return TileCacheService.generateFallbackTile();
        });
      } else {
        maplibregl.addProtocol('baked', async (request) => {
          try {
            const [repository, z, x, y] = request.url.replace('baked://', '').split('/');

            return await tileCache.getTile(repository, Number(z), Number(x), Number(y));
          } catch {
            // this is a blank 256x256 image
            return TileCacheService.generateFallbackTile();
          }
        });
      }
    }

    const tileCacheSettings = (() => {
      if (configuration.features.MAP_RESTRICT_TILE_CACHE_SIZE.enabled) {
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
        center: [map_center[0], map_center[1]],
        style: {
          glyphs: configuration.build.MOBILE
            ? '/assets/basemaps/fonts/{fontstack}/{range}.pbf'
            : 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
          version: 8,
          sources: {},
          layers: POSITIONING_LAYERS
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

  useEffect(() => {
    if (!mapReady || !map) return;
    if (loggedInOrWorkingOffline) {
      addServerBoundariesIfNotExists(serverBoundaries, map);
      refreshServerBoundariesOnToggle(serverBoundaries, map);
    }
  }, [serverBoundaries, loggedInOrWorkingOffline, map, mapReady]);

  // Custom Layers:
  useEffect(() => {
    if (!mapReady || !map) return;

    if (!loggedInOrWorkingOffline) {
      removeClientBoundaries(clientBoundaries, map);
      return;
    }

    addClientBoundariesIfNotExists(clientBoundaries, map);
    refreshClientBoundariesOnToggle(clientBoundaries, map);
    removeOrphanClientBoundaries(clientBoundaries, map);
  }, [clientBoundaries, map, mapReady, loggedInOrWorkingOffline]);

  // Jump Nav
  useEffect(() => {
    if (!mapReady) return;
    if (!map) return;

    try {
      if (map_center && map_zoom) {
        map.easeTo({
          center: map_center,
          zoom: map_zoom,
          offset: [0, map.getContainer().clientHeight * -0.2]
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [map, mapReady, map_center, map_zoom]);

  useEffect(() => {
    setInterval(() => {
      if (map) {
        setMapLoaded(map.areTilesLoaded());
      }
    }, 1000);
  }, [map]);

  const buttonContainerLayerSelect = useCallback(
    (name: string) => {
      switch (availableLayerDefinitions.find((l) => l.name === name)?.mode) {
        case 'basemap':
          setActiveBaseMap(name);
          break;
        case 'overlay':
          setOverlayState(name);
          break;
      }
    },
    [availableLayerDefinitions]
  );

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

          <Suspense fallback={<Spinner />}>
            <OfflineProtoMapsDebugModal />
          </Suspense>

          <ButtonContainer selectLayer={buttonContainerLayerSelect} layers={availableLayerDefinitions} />

          {[...Object.entries(recordsetSources), ...Object.entries(sources)].map(([key, source]) => (
            <SourceComponent mapReady={mapReady} key={key} id={key} source={source} />
          ))}

          {[...layers, ...recordsetLayers].map((layer) => (
            <LayerComponent mapReady={mapReady} key={layer.id} id={layer.id} layer={layer} />
          ))}

          {[...Object.keys(sources), ...Object.keys(recordsetSources)].map((key) => (
            <SourceCleanupComponent mapReady={mapReady} key={key} id={key} />
          ))}

          <PositionMarkers mapReady={mapReady} />
          <LayerDataMarker />
          <CurrentActivityLayer mapReady={mapReady} />
          {loggedInOrWorkingOffline && (
            <LayerPicker layers={availableLayerDefinitions} setOverlayState={setOverlayState} />
          )}
          <MobileOnly>
            <CachedMapLayer mapReady={mapReady} />
            <OfflineRecordsetLayer mapReady={mapReady} />
          </MobileOnly>
        </MapContext.Provider>
        {children}
      </div>
    </div>
  );
};

type LegacyMapType = typeof Map;

export type { LegacyMapType };
