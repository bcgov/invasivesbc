import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './map.css';

import { useDispatch, useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { InvasivesMap } from 'UI/Features/LegacyMap/InvasivesMap';
import * as maplibregl from 'maplibre-gl/dist/maplibre-gl-dev';
import { PMTiles, Protocol } from 'pmtiles';
import { CurrentActivityLayer } from 'UI/Features/LegacyMap/helpers/components/CurrentActivityLayer';
import DisplayComposite from './helpers/components/DisplayComposite/DisplayComposite';
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
import { SourceComponent } from 'UI/Features/LegacyMap/helpers/components/SourceComponent';
import { LayerComponent } from 'UI/Features/LegacyMap/helpers/components/LayerComponent';
import { SourceCleanupComponent } from 'UI/Features/LegacyMap/helpers/components/SourceCleanupComponent';
import { POSITIONING_LAYERS } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/positioning-layers';
import { useInvasivesMapLayers } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import LayerDataMarker from './helpers/components/LayerDataMarker/LayerDataMarker';
import { useRecordSetControls } from 'utils/useRecordSetControls';
import OfflineRecordsetLayer from './helpers/components/OfflineRecordsetLayer';
import { useOfflineRecordSetLayers } from 'utils/useOfflineRecordSetLayers';
import { OfflineMapsPluginPMTilesSource } from 'utils/offline-protomaps/capacitor';
import OfflineProtomaps from 'state/actions/cache/OfflineProtomaps';
import { DrawControls } from 'UI/Features/LegacyMap/helpers/components/DrawControls';
import { PositionMarkers } from 'UI/Features/LegacyMap/helpers/components/PositionMarkers';

export const Map: React.FC<React.PropsWithChildren> = ({ children }) => {
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
  const { recordsetLayers: offlineLayers, recordsetSources: offlineSources } = useOfflineRecordSetLayers();

  const map = useRef<InvasivesMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);

  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_BASE);

  const { sources, layers, availableLayerDefinitions, setActiveBaseMap, setOverlayState } = useInvasivesMapLayers();
  const { recordsetLayers, recordsetSources } = useRecordSetControls();

  const pmtilesProtocol = useRef<Protocol>(new Protocol());

  const [alreadyAddedProtomapsSources, setAlreadyAddedProtomapsSources] = useState<string[]>([]);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(OfflineProtomaps.refreshList());
  }, []);

  useEffect(() => {
    const addedSources: string[] = [];
    Object.entries(sources).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Object.hasOwn(value, 'url') && !addedSources.includes(key) && !alreadyAddedProtomapsSources.includes(key)) {
        addedSources.push(key);
        if (value.url.startsWith('pmtiles://')) {
          pmtilesProtocol.current.add(
            new PMTiles(new OfflineMapsPluginPMTilesSource(value.url.replace('pmtiles://', '')))
          );
        }
      }
    });
    if (addedSources.length > 0) {
      setAlreadyAddedProtomapsSources([...alreadyAddedProtomapsSources, ...addedSources]);
    }
  }, [sources, alreadyAddedProtomapsSources]);

  useEffect(() => {
    if (!mapContainer.current) {
      return;
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

    maplibregl.addProtocol('pmtiles', (request) => {
      return new Promise((resolve, reject) => {
        const callback = (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve({ data });
          }
        };
        pmtilesProtocol.current.tile(request, callback);
      });
    });

    const PMTILES_URL =
      configuration.runtime.PUBLIC_MAP_URL || `https://nrs.objectstore.gov.bc.ca/uphjps/invasives-local.pmtiles`;
    const p = new PMTiles(PMTILES_URL);

    pmtilesProtocol.current.add(p);

    const tileCacheSettings = (() => {
      if (configuration.features.MAP_RESTRICT_TILE_CACHE_SIZE.enabled) {
        // disable maplibre's builtin tile cache
        return { maxTileCacheSize: 0, minTileCacheSize: 0 };
      }
      return {};
    })();

    map.current = new InvasivesMap({
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
    });

    map.current.once('idle', function () {
      if (map.current !== null) {
        map.current.resize();
      }
      if (map.current.isStyleLoaded()) {
        setMapReady(true);
      }
    });

    return () => {
      if (map.current !== null) {
        map.current.remove();
      }
    };
  }, [mapContainer.current]);

  useEffect(() => {
    if (!mapReady) return;
    if (map.current == null) return;

    if (loggedInOrWorkingOffline) {
      addServerBoundariesIfNotExists(serverBoundaries, map.current);
      refreshServerBoundariesOnToggle(serverBoundaries, map.current);
    }
  }, [serverBoundaries, loggedInOrWorkingOffline, map.current, mapReady]);

  // Custom Layers:
  useEffect(() => {
    if (!mapReady) return;
    if (map.current == null) return;

    if (!loggedInOrWorkingOffline) {
      removeClientBoundaries(clientBoundaries, map.current);
      return;
    }

    addClientBoundariesIfNotExists(clientBoundaries, map.current);
    refreshClientBoundariesOnToggle(clientBoundaries, map.current);
    removeOrphanClientBoundaries(clientBoundaries, map.current);
  }, [clientBoundaries, map.current, mapReady, loggedInOrWorkingOffline]);

  // Jump Nav
  useEffect(() => {
    if (!mapReady) return;
    if (map.current == null) return;

    try {
      if (map_center && map_zoom) {
        map.current.easeTo({
          center: map_center,
          zoom: map_zoom,
          offset: [0, map.current.getContainer().clientHeight * -0.2]
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [map.current, mapReady, map_center, map_zoom]);

  useEffect(() => {
    if (map.current == null) {
      return;
    }

    const intervalID = setInterval(() => {
      if (map.current !== null) {
        setMapLoaded(map.current.areTilesLoaded());
      }
    }, 1000);
    return () => {
      clearInterval(intervalID);
    };
  }, [map.current]);

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
        <MapContext.Provider value={map.current}>
          {map.current !== null && (
            <>
              <DisplayComposite />
              <DrawControls mapReady={mapReady} />

              <ButtonContainer selectLayer={buttonContainerLayerSelect} layers={availableLayerDefinitions} />

              {[...Object.entries(recordsetSources), ...Object.entries(sources), ...Object.entries(offlineSources)].map(
                ([key, source]) => (
                  <SourceComponent mapReady={mapReady} key={key} id={key} source={source} />
                )
              )}

              {[...layers, ...recordsetLayers, ...offlineLayers].map((layer) => (
                <LayerComponent mapReady={mapReady} key={layer.id} id={layer.id} layer={layer} />
              ))}

              {[...Object.keys(sources), ...Object.keys(recordsetSources), ...Object.keys(offlineSources)].map(
                (key) => (
                  <SourceCleanupComponent mapReady={mapReady} key={key} id={key} />
                )
              )}

              <PositionMarkers mapReady={mapReady} />
              <LayerDataMarker />
              <CurrentActivityLayer mapReady={mapReady} />
              {loggedInOrWorkingOffline && (
                <LayerPicker layers={availableLayerDefinitions} setOverlayState={setOverlayState} />
              )}
              <MobileOnly>
                <OfflineRecordsetLayer mapReady={mapReady} />
              </MobileOnly>
            </>
          )}
        </MapContext.Provider>

        {children}
      </div>
    </div>
  );
};

type LegacyMapType = typeof Map;

export type { LegacyMapType };
