import circle from '@turf/circle';
import maplibregl, { LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect, useRef, useState } from 'react';
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

/*

  MW: For every state obj, property, or array that the map cares about, there is a hook that listens for changes and handler functions to deal with them.
  I've tried to make it so the handlers can safely run more than once, and no destructing and recreating when not necessary.

 */
export const Map = ({ children }) => {
  const { API_BASE } = useSelector((state) => state.Configuration.current);

  const [draw, setDraw] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const mapContainer = useRef(null);
  const map = useRef<maplibregl.Map>(null);
  const MapMode = useSelector((state) => state.Map.MapMode);
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
  const positionMarker = new maplibregl.Marker({ element: positionMarkerEl });
  const accuracyCircle = useSelector((state) => {
    if (state.Map.userCoords?.long) {
      return circle([state.Map.userCoords.long, state.Map.userCoords.lat], state.Map.userCoords.accuracy, {
        steps: 64,
        units: 'meters'
      });
    } else {
      return null;
    }
  });

  const baseMapToggle = useSelector((state) => state.Map.baseMapToggle);
  const HDToggle = useSelector((state) => state.Map.HDToggle);

  // Draw tools - determine who needs edit and where the geos get dispatched, what tools to display etc
  const whatsHereFeature = useSelector((state) => state.Map?.whatsHere.feature);
  const whatsHereToggle = useSelector((state) => state.Map.whatsHere.toggle);
  const whatsHereMarker = new maplibregl.Marker({ element: whatsHereMarkerEl });
  const appModeUrl = useSelector((state) => state.AppMode.url);
  // also used with current marker below:
  const activityGeo = useSelector((state) => state.ActivityPage.activity?.geometry);
  const drawingCustomLayer = useSelector((state) => state.Map.drawingCustomLayer);

  //Current rec markers:
  const currentActivityShortID = useSelector((state) => state.ActivityPage.activity?.short_id);
  const currentIAPPID = useSelector((state) => state.IAPPSitePage?.site?.site_id);
  const currentIAPPGeo = useSelector((state) => state.IAPPSitePage?.site?.geom);
  const activityMarker = new maplibregl.Marker({ element: activityMarkerEl });
  const IAPPMarker = new maplibregl.Marker({ element: IAPPMarkerEl });

  //Highlighted Record from main records page:
  const userRecordOnHoverRecordRow = useSelector((state) => state.Map.userRecordOnHoverRecordRow);
  const userRecordOnHoverRecordType = useSelector((state) => state.Map.userRecordOnHoverRecordType);
  const quickPanToRecord = useSelector((state) => state.Map.quickPanToRecord);

  const PUBLIC_MAP_URL = useSelector((state) => state.Configuration.current.PUBLIC_MAP_URL);

  useEffect(() => {
    if (!map.current || mapReady) return;
    if (map.current.isStyleLoaded()) {
      setMapReady(true);
    }
  }, [map.current?.isStyleLoaded()]);

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
      map_center
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
    console.log('all layers');
    console.dir(map.current.getStyle().layers);
  }, [storeLayers, map.current, mapReady]);

  // Layer picker:
  useEffect(() => {
    if (!mapReady) return;
    addWMSLayersIfNotExist(simplePickerLayers2, map.current);
    refreshWMSOnToggle(simplePickerLayers2, map.current);
  }, [simplePickerLayers2, map.current, mapReady]);

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
      if (map_center && map_zoom) map.current.jumpTo({ center: map_center, zoom: map_zoom });
    } catch (e) {
      console.log('jumpTo failed, probable invalid coords');
      console.dir(map_center);
      console.dir(e);
    }
  }, [map_center, map_zoom]);

  // User position tracking and marker
  useEffect(() => {
    if (!mapReady) return;
    handlePositionTracking(map.current, positionMarker, userCoords, accuracyCircle, accuracyToggle, positionTracking);
  }, [userCoords, positionTracking, accuracyToggle, mapReady]);

  //Toggle Topo
  useEffect(() => {
    if (!mapReady) return;
    toggleLayerOnBool(map.current, 'Esri-Sat-LayerHD', !baseMapToggle && HDToggle);
    toggleLayerOnBool(map.current, 'Esri-Sat-LayerSD', !baseMapToggle && !HDToggle);
    toggleLayerOnBool(map.current, 'Esri-Sat-Label', !baseMapToggle);
    toggleLayerOnBool(map.current, 'Esri-Topo', baseMapToggle);
  }, [baseMapToggle, HDToggle, map.current, mapReady]);

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
      appModeUrl,
      activityGeo,
      drawingCustomLayer
    );
  }, [whatsHereToggle, appModeUrl, dispatch, map.current, activityGeo, drawingCustomLayer, mapReady]);

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
    console.log('***highlighted rec hook');
    if (!mapReady) return;
    if (!map.current) return;

    refreshHighlightedRecord(map.current, { userRecordOnHoverRecordRow, userRecordOnHoverRecordType });

    if (quickPanToRecord) {
      if (userRecordOnHoverRecordRow && userRecordOnHoverRecordType === 'IAPP') {
        if (userRecordOnHoverRecordRow.geometry) {
          map.current.jumpTo({
            center: centroid(userRecordOnHoverRecordRow.geometry).geometry.coordinates as LngLatLike,
            zoom: 15
          });
        }
      }
      if (userRecordOnHoverRecordRow && userRecordOnHoverRecordType === 'Activity') {
        if (userRecordOnHoverRecordRow.geometry?.[0]) {
          map.current.jumpTo({
            center: centroid(userRecordOnHoverRecordRow.geometry?.[0]).geometry.coordinates as LngLatLike,
            zoom: 15
          });
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

    console.log('checking if logged in:', loggedIn);
    if (loggedIn) {
      console.log('logged in');
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
      console.log('error rotating marker');
      console.dir(e);
    }
  }, [userCoords?.heading, mapReady]);

  return (
    <div className="map-containing-block">
      <div className="MapWrapper">
        <div ref={mapContainer} className="Map" />
        <div id="LoadingMap" className={!mapLoaded ? 'loadingMap' : 'loadedMap'}>
          Loading tiles...
        </div>
        {children}
      </div>
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

const whatsHereMarkerEl = document.createElement('div');
whatsHereMarkerEl.className = 'whatsHereMarkerEl';
whatsHereMarkerEl.style.backgroundImage = 'url(/assets/icon/pin.svg)';
whatsHereMarkerEl.style.width = `32px`;
whatsHereMarkerEl.style.height = `32px`;
