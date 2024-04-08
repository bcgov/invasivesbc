import circle from '@turf/circle';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import './map.css';

// Draw tools:
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useHistory } from 'react-router-dom';
import {
  mapInit,
  rebuildLayersOnTableHashUpdate,
  refreshColoursOnColourUpdate,
  refreshVisibilityOnToggleUpdate,
  removeDeletedRecordSetLayersOnRecordSetDelete,
  addWMSLayersIfNotExist,
  handlePositionTracking,
  toggleLayerOnBool,
  initDrawModes,
  refreshDrawControls,
  refreshCurrentRecMakers,
  refreshHighlightedRecord,
  refreshWMSOnToggle,
  addServerBoundariesIfNotExists,
  refreshServerBoundariesOnToggle,
  addClientBoundariesIfNotExists,
  refreshClientBoundariesOnToggle
} from './Helpers';
import { useSelector } from 'util/use_selector';
import { opacify } from 'color2k';

/*

  MW: For every state obj, property, or array that the map cares about, there is a hook that listens for changes and handler functions to deal with them.
  I've tried to make it so the handlers can safely run more than once, and no destructing and recreating when not necessary.

 */
export const Map = (props: any) => {
  const { API_BASE } = useSelector((state) => state.Configuration.current);
  const store = useStore(); // to escape useselector memoization

  const [draw, setDraw] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const MapMode = useSelector((state: any) => state.Map?.MapMode);
  const dispatch = useDispatch();
  const uHistory = useHistory();

  // Avoid remounting map to avoid unnecesssary tile fetches or bad umounts:
  const authInitiated = useSelector((state: any) => state.Auth.initialized);
  const loggedIn = useSelector((state: any) => state.Auth.authenticated);

  // RecordSet Layers
  const storeLayers = useSelector((state: any) => state.Map?.layers);

  // WMS Layers
  const simplePickerLayers2 = useSelector((state: any) => state.Map?.simplePickerLayers2);

  //KML
  const serverBoundaries = useSelector((state: any) => state.Map?.serverBoundaries);
  //Drawn boundaries:
  const clientBoundaries = useSelector((state: any) => state.Map?.clientBoundaries);

  // Map position jump
  const map_center = useSelector((state: any) => state.Map?.map_center);
  const map_zoom = useSelector((state: any) => state.Map?.map_zoom);

  // User tracking coords jump and markers/indicators
  const userCoords = useSelector((state: any) => state.Map?.userCoords);
  const accuracyToggle = useSelector((state: any) => state.Map?.accuracyToggle);
  const positionTracking = useSelector((state: any) => state.Map?.positionTracking);
  const positionMarker = new maplibregl.Marker({ element: positionMarkerEl });
  const accuracyCircle = useSelector((state: any) => {
    if (state.Map?.userCoords?.long) {
      return circle([state.Map?.userCoords?.long, state.Map?.userCoords?.lat], state.Map?.userCoords?.accuracy, {
        steps: 64,
        units: 'meters'
      });
    } else {
      return null;
    }
  });

  const baseMapToggle = useSelector((state: any) => state.Map?.baseMapToggle);
  const HDToggle = useSelector((state: any) => state.Map?.HDToggle);

  // Draw tools - determing who needs edit and where the geos get dispatched, what tools to display etc
  const whatsHereToggle = useSelector((state: any) => state.Map?.whatsHere?.toggle);
  const appModeUrl = useSelector((state: any) => state.AppMode.url);
  // also used with current marker below:
  const activityGeo = useSelector((state: any) => state.ActivityPage?.activity?.geometry);
  const drawingCustomLayer = useSelector((state: any) => state.Map.drawingCustomLayer);

  //Current rec markers:
  const currentActivityShortID = useSelector((state: any) => state.ActivityPage?.activity?.short_id);
  const currentIAPPID = useSelector((state: any) => state?.IAPPSitePage?.site?.site_id);
  const currentIAPPGeo = useSelector((state: any) => state?.IAPPSitePage?.site?.geom);
  const activityMarker = new maplibregl.Marker({ element: activityMarkerEl });
  const IAPPMarker = new maplibregl.Marker({ element: IAPPMarkerEl });

  //Highlighted Record from main records page:
  const userRecordOnHoverRecordRow = useSelector((state: any) => state.Map?.userRecordOnHoverRecordRow);
  const userRecordOnHoverRecordType = useSelector((state: any) => state.Map?.userRecordOnHoverRecordType);

  const PUBLIC_MAP_URL = useSelector((state: any) => state.Configuration.current.PUBLIC_MAP_URL);

  // Map Init
  useEffect(() => {
    if (map.current || !authInitiated) return;
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
        return store.getState().Auth.requestHeaders;
      },
      PUBLIC_MAP_URL
    );
  }, [authInitiated]);

  // RecordSet Layers:
  useEffect(() => {
    if (!map.current) return;
    rebuildLayersOnTableHashUpdate(storeLayers, map.current, MapMode, API_BASE);
    refreshColoursOnColourUpdate(storeLayers, map.current);
    refreshVisibilityOnToggleUpdate(storeLayers, map.current);
    removeDeletedRecordSetLayersOnRecordSetDelete(storeLayers, map.current);
  }, [storeLayers]);

  // Layer picker:
  useEffect(() => {
    if (!map.current) return;
    addWMSLayersIfNotExist(simplePickerLayers2, map.current);
    refreshWMSOnToggle(simplePickerLayers2, map.current);
  }, [simplePickerLayers2]);

  useEffect(() => {
    if (loggedIn) {
      addServerBoundariesIfNotExists(serverBoundaries, map.current);
      refreshServerBoundariesOnToggle(serverBoundaries, map.current);
    }
  }, [serverBoundaries, loggedIn]);

  useEffect(() => {
    addClientBoundariesIfNotExists(clientBoundaries, map.current);
    refreshClientBoundariesOnToggle(clientBoundaries, map.current);
  }, [clientBoundaries]);

  // Jump Nav
  useEffect(() => {
    if (!map.current) return;
    if (map_center && map_center && map_zoom) map.current.jumpTo({ center: map_center, zoom: map_zoom });
  }, [map_center, map_zoom]);

  // User position tracking and marker
  useEffect(() => {
    if (!map.current) return;
    handlePositionTracking(map.current, positionMarker, userCoords, accuracyCircle, accuracyToggle, positionTracking);
  }, [userCoords, positionTracking, accuracyToggle]);

  //Toggle Topo
  useEffect(() => {
    if (!map.current) return;
    toggleLayerOnBool(map.current, 'Esri-Sat-LayerHD', !baseMapToggle && HDToggle);
    toggleLayerOnBool(map.current, 'Esri-Sat-LayerSD', !baseMapToggle && !HDToggle);
    toggleLayerOnBool(map.current, 'Esri-Sat-Label', !baseMapToggle);
    toggleLayerOnBool(map.current, 'Esri-Topo', baseMapToggle);
  }, [baseMapToggle, HDToggle]);

  // Handle draw mode changes, controls, and action dispatching:
  useEffect(() => {
    if (!map.current) return;
    refreshDrawControls(
      map.current,
      draw,
      setDraw,
      dispatch,
      uHistory,
      whatsHereToggle,
      appModeUrl,
      activityGeo,
      drawingCustomLayer
    );
  }, [whatsHereToggle, appModeUrl, map, activityGeo, drawingCustomLayer]);

  //Current Activity & IAPP Markers
  useEffect(() => {
    if (!map.current) return;
    refreshCurrentRecMakers(map.current, {
      activityGeo,
      currentActivityShortID,
      currentIAPPID,
      currentIAPPGeo,
      activityMarker,
      IAPPMarker
    });
  }, [currentActivityShortID, currentIAPPID]);

  //Highlighted Record
  useEffect(() => {
    refreshHighlightedRecord(map.current, { userRecordOnHoverRecordRow, userRecordOnHoverRecordType });
  }, [userRecordOnHoverRecordRow]);

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
    if (!map.current) return;

    if (loggedIn) {
      console.log('logged in')
      toggleLayerOnBool(map.current, 'invasivesbc-pmtile-vector', false);
      toggleLayerOnBool(map.current, 'iapp-pmtile-vector', false);
      toggleLayerOnBool(map.current, 'invasivesbc-pmtile-vector-label', false);
      toggleLayerOnBool(map.current, 'iapp-pmtile-vector-label', false);
    }
  }, [loggedIn, map.current]);

  return (
    <div className="MapWrapper">
      <div ref={mapContainer} className="Map" />
      <div id="LoadingMap" className={!mapLoaded ? 'loadingMap' : 'loadedMap'}>
        Loading tiles...
      </div>
      {props.children}
    </div>
  );
};

const positionMarkerEl = document.createElement('div');
positionMarkerEl.className = 'userTrackingMarker';
positionMarkerEl.style.backgroundImage = 'url(/assets/icon/circle.png)';
positionMarkerEl.style.width = `32px`;
positionMarkerEl.style.height = `32px`;

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
