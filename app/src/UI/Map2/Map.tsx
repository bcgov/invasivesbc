import circle from '@turf/circle';
import maplibregl, { LngLatLike, Map as MapLibre } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import './map.css';
import centroid from '@turf/centroid';

// Draw tools:
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useHistory } from 'react-router-dom';
import {
  addClientBoundariesIfNotExists,
  addServerBoundariesIfNotExists,
  addWMSLayersIfNotExist,
  handlePositionTracking,
  mapInit,
  rebuildLayersOnTableHashUpdate,
  refreshClientBoundariesOnToggle,
  refreshColoursOnColourUpdate,
  refreshCurrentRecMakers,
  refreshDrawControls,
  refreshHighlightedRecord,
  refreshServerBoundariesOnToggle,
  refreshVisibilityOnToggleUpdate,
  refreshWhatsHereFeature,
  refreshWMSOnToggle,
  removeDeletedRecordSetLayersOnRecordSetDelete,
  toggleLayerOnBool
} from './Helpers';
import { useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import {
  allBaseMapLayerIdsNotInDefinition,
  allOverlayLayerIdsNotInDefinitions,
  allSourceIDsRequiredForDefinition,
  LAYER_Z_BACKGROUND,
  LAYER_Z_MID,
  layersForDefinition,
  MAP_DEFINITIONS
} from 'UI/Map2/helpers/layer-definitions';
import { Context } from 'utils/tile-cache/context';
import { MOBILE } from 'state/build-time-config';

/*

  MW: For every state obj, property, or array that the map cares about, there is a hook that listens for changes and handler functions to deal with them.
  I've tried to make it so the handlers can safely run more than once, and no destructing and recreating when not necessary.

 */
export const Map = (props: any) => {
  const { API_BASE } = useSelector((state) => state.Configuration.current);
  const tileCache = useContext(Context);

  const [draw, setDraw] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const mapContainer = useRef(null);
  const map: React.MutableRefObject<MapLibre | null> = useRef(null);
  const MapMode = useSelector((state: any) => state.Map?.MapMode);
  const dispatch = useDispatch();
  const uHistory = useHistory();

  // Avoid remounting map to avoid unnecesssary tile fetches or bad umounts:
  const authInitiated = useSelector((state) => state.Auth.initialized);
  const loggedIn = useSelector((state) => state.Auth.authenticated);

  // RecordSet Layers
  const storeLayers = useSelector((state) => state.Map.layers);

  // WMS Layers
  const simplePickerLayers2 = useSelector((state) => state.Map.simplePickerLayers2);

  //KML
  const serverBoundaries = useSelector((state) => state.Map.serverBoundaries);
  //Drawn boundaries:
  const clientBoundaries = useSelector((state) => state.Map.clientBoundaries);

  // Map position jump
  const map_center = useSelector((state) => state.Map.map_center);
  const map_zoom = useSelector((state) => state.Map.map_zoom);

  // User tracking coords jump and markers/indicators
  const userCoords = useSelector((state) => state.Map.userCoords);
  const accuracyToggle = useSelector((state) => state.Map.accuracyToggle);
  const positionTracking = useSelector((state) => state.Map.positionTracking);
  const panned = useSelector((state) => state.Map.panned);
  const positionMarker = new maplibregl.Marker({ element: positionMarkerEl });
  const accuracyCircle = useSelector((state) => {
    if (state.Map.userCoords?.long) {
      return circle([state.Map?.userCoords?.long, state.Map?.userCoords?.lat], state.Map?.userCoords?.accuracy, {
        steps: 64,
        units: 'meters'
      });
    }
    return null;
  });

  // Draw tools - determine who needs edit and where the geos get dispatched, what tools to display etc
  const whatsHereFeature = useSelector((state) => state.Map.whatsHere?.feature);
  const whatsHereToggle = useSelector((state) => state.Map.whatsHere?.toggle);
  const whatsHereMarker = new maplibregl.Marker({ element: whatsHereMarkerEl });

  const tileCacheMode = useSelector((state) => state.Map.tileCacheMode);

  const appModeUrl = useSelector((state) => state.AppMode.url);
  // also used with current marker below:
  const activityGeo = useSelector((state) => state.ActivityPage.activity?.geometry);
  const drawingCustomLayer = useSelector((state) => state.Map.drawingCustomLayer);

  //Current rec markers:
  const currentActivityShortID = useSelector((state) => state.ActivityPage.activity?.short_id);
  const currentIAPPID = useSelector((state) => state.IAPPSitePage.site?.site_id);
  const currentIAPPGeo = useSelector((state) => state.IAPPSitePage.site?.geom);
  const activityMarker = new maplibregl.Marker({ element: activityMarkerEl });
  const IAPPMarker = new maplibregl.Marker({ element: IAPPMarkerEl });

  //Highlighted Record from main records page:
  const userRecordOnHoverRecordRow = useSelector((state) => state.Map.userRecordOnHoverRecordRow);
  const userRecordOnHoverRecordType = useSelector((state) => state.Map.userRecordOnHoverRecordType);
  const quickPanToRecord = useSelector((state) => state.Map.quickPanToRecord);

  const baseMapLayer = useSelector((state) => state.Map.baseMapLayer);
  const enabledOverlayLayers = useSelector((state) => state.Map.enabledOverlayLayers);

  const offlineDefinitions = useSelector((state) => state.TileCache?.mapSpecifications);

  const PUBLIC_MAP_URL = useSelector((state) => state.Configuration.current.PUBLIC_MAP_URL);

  useEffect(() => {
    if (!map.current || mapReady) return;

    if (map.current !== null) {
      map.current.once('idle', function () {
        if (map.current !== null) {
          map.current.resize();
        }
      });
    }

    if (map.current.isStyleLoaded()) {
      setMapReady(true);
    }
  }, [map?.current?.isStyleLoaded()]);

  const [currentAuthHeader, setCurrentAuthHeader] = useState<string>('');
  const authHeaderRef = useRef<string>();
  authHeaderRef.current = currentAuthHeader;

  useEffect(() => {
    if (!loggedIn) {
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
  }, [loggedIn]);

  // Map Init
  useEffect(() => {
    if (map.current || !authInitiated || !map_center) return;
    mapInit(
      map,
      mapContainer,
      setDraw,
      dispatch,
      uHistory,
      appModeUrl,
      activityGeo,
      null,
      API_BASE,
      () => {
        if (authHeaderRef.current === undefined) {
          console.error('requested access before header received');
          return '';
        }
        return authHeaderRef.current;
      },
      PUBLIC_MAP_URL,
      MOBILE,
      map_center,
      tileCache
    );
  }, [authInitiated, map_center]);

  // RecordSet Layers:
  useEffect(() => {
    if (!mapReady) return;
    if (!map.current) return;

    rebuildLayersOnTableHashUpdate(storeLayers, map.current, MapMode, API_BASE);
    refreshColoursOnColourUpdate(storeLayers, map.current);
    refreshVisibilityOnToggleUpdate(storeLayers, map.current);
    removeDeletedRecordSetLayersOnRecordSetDelete(storeLayers, map.current);
  }, [storeLayers, map.current, mapReady]);

  // Layer picker:
  useEffect(() => {
    if (!mapReady) return;
    if (!map.current) return;
    addWMSLayersIfNotExist(simplePickerLayers2, map.current);
    refreshWMSOnToggle(simplePickerLayers2, map.current);
  }, [simplePickerLayers2, map.current, mapReady, baseMapLayer]);

  useEffect(() => {
    if (!mapReady) return;
    if (loggedIn) {
      addServerBoundariesIfNotExists(serverBoundaries, map.current);
      refreshServerBoundariesOnToggle(serverBoundaries, map.current);
    }
  }, [serverBoundaries, loggedIn, map.current, mapReady]);

  useEffect(() => {
    if (!mapReady) return;
    addClientBoundariesIfNotExists(clientBoundaries, map.current);
    refreshClientBoundariesOnToggle(clientBoundaries, map.current);
  }, [clientBoundaries, map.current, mapReady]);

  // Jump Nav
  useEffect(() => {
    if (!mapReady) return;
    if (!map.current) return;

    try {
      if (map_center && map_zoom) {
        map.current.jumpTo({ center: map_center, zoom: map_zoom });
      }
    } catch (e) {
      console.error(e);
    }
  }, [map_center, map_zoom]);

  // User position tracking and marker
  useEffect(() => {
    if (!mapReady) return;
    handlePositionTracking(
      map.current,
      positionMarker,
      userCoords,
      accuracyCircle,
      accuracyToggle,
      positionTracking,
      panned
    );
  }, [userCoords, positionTracking, accuracyToggle, mapReady, panned]);

  // set base map layer
  useEffect(() => {
    if (!mapReady) return;

    if (!map.current) {
      return;
    }

    if (!baseMapLayer) {
      return;
    }

    const deactivateBaseLayers = allBaseMapLayerIdsNotInDefinition(
      [...MAP_DEFINITIONS, ...(offlineDefinitions || [])],
      baseMapLayer
    );

    const deactivateOverlayLayers = allOverlayLayerIdsNotInDefinitions(
      [...MAP_DEFINITIONS, ...(offlineDefinitions || [])],
      enabledOverlayLayers
    );

    const staticSources = MAP_DEFINITIONS.map((m) => {
      return {
        id: m.name,
        source: m.source
      };
    });

    /* cached layers */
    const cachedSources = (offlineDefinitions || []).map((m) => {
      return {
        id: m.name,
        source: m.source
      };
    });

    const allSources = [...staticSources, ...cachedSources];

    const sourcesRequired = allSources.filter((s) => {
      for (const layerToCheck of [baseMapLayer, ...enabledOverlayLayers]) {
        if (
          allSourceIDsRequiredForDefinition([...MAP_DEFINITIONS, ...(offlineDefinitions || [])], layerToCheck).includes(
            s.id
          )
        ) {
          return true;
        }
      }
      return false;
    });

    const sourcesNotRequired = allSources.filter((s) => !sourcesRequired.some((r) => r.id == s.id));

    // first remove the unneeded layers
    for (const layerId of [...deactivateBaseLayers, ...deactivateOverlayLayers]) {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    }

    // now we can delete associated sources we no longer reference
    for (const source of sourcesNotRequired) {
      if (map.current.getSource(source.id)) {
        map.current.removeSource(source.id);
      }
    }

    // ...add the required sources in
    for (const source of sourcesRequired) {
      if (!map.current.getSource(source.id)) {
        map.current.addSource(source.id, source.source);
      }
    }

    //  add the base map layers (which depend on the sources)
    for (const layerSpec of layersForDefinition([...MAP_DEFINITIONS, ...(offlineDefinitions || [])], baseMapLayer)) {
      if (!map.current.getLayer(layerSpec.id)) {
        map.current.addLayer(layerSpec, LAYER_Z_BACKGROUND);
      }
    }

    // finally add the overlay layers (which can also depend on the sources)
    for (const overlayLayer of enabledOverlayLayers) {
      for (const layerSpec of layersForDefinition([...MAP_DEFINITIONS, ...(offlineDefinitions || [])], overlayLayer)) {
        if (!map.current.getLayer(layerSpec.id)) {
          map.current.addLayer(layerSpec, LAYER_Z_MID);
        }
      }
    }
  }, [baseMapLayer, enabledOverlayLayers, map.current, mapReady]);

  // Handle draw mode changes, controls, and action dispatching:
  useEffect(() => {
    if (!mapReady) return;
    refreshDrawControls(
      map.current,
      draw,
      setDraw,
      dispatch,
      uHistory,
      whatsHereToggle,
      tileCacheMode,
      appModeUrl,
      activityGeo,
      drawingCustomLayer
    );
  }, [whatsHereToggle, tileCacheMode, appModeUrl, dispatch, map.current, activityGeo, drawingCustomLayer, mapReady]);

  //Current Activity & IAPP Markers
  useEffect(() => {
    if (!mapReady) return;
    refreshCurrentRecMakers(map.current, {
      activityGeo,
      currentActivityShortID,
      currentIAPPID,
      currentIAPPGeo,
      userRecordOnHoverRecordRow,
      activityMarker,
      IAPPMarker,
      whatsHereMarker,
      whatsHereFeature
    });
  }, [currentActivityShortID, currentIAPPID, map.current, mapReady, userRecordOnHoverRecordRow]);

  //Highlighted Record
  useEffect(() => {
    if (!mapReady) return;
    if (!map.current) return;

    refreshHighlightedRecord(map.current, { userRecordOnHoverRecordRow, userRecordOnHoverRecordType });

    if (quickPanToRecord) {
      if (userRecordOnHoverRecordRow && userRecordOnHoverRecordType === 'IAPP') {
        if (userRecordOnHoverRecordRow.geometry) {
          const c = centroid(userRecordOnHoverRecordRow.geometry).geometry.coordinates as LngLatLike;
          if (c) {
            map.current.jumpTo({ center: c, zoom: 15 });
          }
        }
      }
      if (userRecordOnHoverRecordRow && userRecordOnHoverRecordType === 'Activity') {
        if (userRecordOnHoverRecordRow.geometry?.[0]) {
          const c = centroid(userRecordOnHoverRecordRow.geometry?.[0]).geometry.coordinates as LngLatLike;
          if (c) {
            map.current.jumpTo({
              center: c,
              zoom: 15
            });
          }
        }
      }
    }

    // Jump Nav
  }, [userRecordOnHoverRecordRow, map.current, map?.current?.isStyleLoaded()]);

  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setInterval(() => {
      if (map.current) {
        setMapLoaded(map.current.areTilesLoaded());
      }
    }, 1000);
  }, [map.current]);

  // toggle public map pmtile layer
  useEffect(() => {
    if (!mapReady) return;
    if (loggedIn) {
      toggleLayerOnBool(map.current, 'invasivesbc-pmtile-vector', false);
      toggleLayerOnBool(map.current, 'iapp-pmtile-vector', false);
      toggleLayerOnBool(map.current, 'invasivesbc-pmtile-vector-label', false);
      toggleLayerOnBool(map.current, 'iapp-pmtile-vector-label', false);
    }
  }, [loggedIn, map.current, mapReady]);

  useEffect(() => {
    refreshWhatsHereFeature(map.current, { whatsHereFeature });
  }, [whatsHereFeature, appModeUrl, map.current, mapReady]);

  useEffect(() => {
    try {
      if (!mapReady) return;
      if (!userCoords?.heading) return;
      if (positionMarker?.getRotation() === userCoords?.heading) return;
      positionMarker?.setRotationAlignment('map');
      positionMarker?.setRotation(userCoords?.heading);
    } catch (e) {
      console.error(e);
    }
  }, [userCoords?.heading, mapReady]);

  return (
    <div className="map-containing-block">
      <div className="MapWrapper">
        <div ref={mapContainer} className="Map" />
        <div id="LoadingMap" className={!mapLoaded ? 'loadingMap' : 'loadedMap'}>
          Loading tiles...
        </div>
        {props.children}
      </div>
    </div>
  );
};

const positionMarkerEl = document.createElement('div');
positionMarkerEl.className = 'userTrackingMarker';
positionMarkerEl.innerHTML = `<img src='/assets/icon/circle.svg' />`;

const activityMarkerEl = document.createElement('div');
activityMarkerEl.className = 'activityMarkerEl';
activityMarkerEl.style.backgroundImage = 'url(/assets/icon/clip.png)';
activityMarkerEl.style.width = `32px`;
activityMarkerEl.style.height = `32px`;

const IAPPMarkerEl = document.createElement('div');
IAPPMarkerEl.className = 'IAPPMarkerEl';
IAPPMarkerEl.style.backgroundImage = 'url(/assets/iapp_logo.gif)';
IAPPMarkerEl.style.width = `32px`;
IAPPMarkerEl.style.height = `32px`;

const whatsHereMarkerEl = document.createElement('div');
whatsHereMarkerEl.className = 'whatsHereMarkerEl';
whatsHereMarkerEl.style.backgroundImage = 'url(/assets/icon/pin.svg)';
whatsHereMarkerEl.style.width = `32px`;
whatsHereMarkerEl.style.height = `32px`;
