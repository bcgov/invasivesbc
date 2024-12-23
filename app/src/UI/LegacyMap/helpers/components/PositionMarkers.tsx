import { useContext, useEffect } from 'react';
import { refreshWhatsHereFeature } from 'UI/LegacyMap/helpers/functional/whats-here';
import { refreshCurrentRecMakers, refreshHighlightedRecord } from 'UI/LegacyMap/helpers/functional/current-record';
import centroid from '@turf/centroid';
import maplibregl, { LngLatLike } from 'maplibre-gl';
import { useSelector } from 'utils/use_selector';
import circle from '@turf/circle';
import { MapContext } from 'UI/LegacyMap/helpers/components/MapContext';
import { handlePositionTracking } from 'UI/LegacyMap/helpers/functional/position-tracking';

const PositionMarkers = ({ mapReady }) => {
  const map = useContext(MapContext);

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
  const whatsHereMarker = new maplibregl.Marker({ element: whatsHereMarkerEl });
  
  const appModeUrl = useSelector((state) => state.AppMode.url);
  // also used with current marker below:
  const activityGeo = useSelector((state) => state.ActivityPage.activity?.geometry);

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

  //Current Activity & IAPP Markers
  useEffect(() => {
    if (!mapReady) return;
    refreshCurrentRecMakers(map, {
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
  }, [currentActivityShortID, currentIAPPID, map, mapReady, userRecordOnHoverRecordRow]);

  //Highlighted Record
  useEffect(() => {
    if (!mapReady) return;
    if (!map) return;

    refreshHighlightedRecord(map, { userRecordOnHoverRecordRow, userRecordOnHoverRecordType });

    if (quickPanToRecord) {
      if (userRecordOnHoverRecordRow && userRecordOnHoverRecordType === 'IAPP') {
        if (userRecordOnHoverRecordRow.geometry) {
          const c = centroid(userRecordOnHoverRecordRow.geometry).geometry.coordinates as LngLatLike;
          if (c) {
            map.jumpTo({ center: c, zoom: 15 });
          }
        }
      }
      if (userRecordOnHoverRecordRow && userRecordOnHoverRecordType === 'Activity') {
        if (userRecordOnHoverRecordRow.geometry?.[0]) {
          const c = centroid(userRecordOnHoverRecordRow.geometry?.[0]).geometry.coordinates as LngLatLike;
          if (c) {
            map.jumpTo({
              center: c,
              zoom: 15
            });
          }
        }
      }
    }

    // Jump Nav
  }, [userRecordOnHoverRecordRow, map, map?.isStyleLoaded()]);

  useEffect(() => {
    refreshWhatsHereFeature(map, { whatsHereFeature });
  }, [whatsHereFeature, appModeUrl, map, mapReady]);

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

  // User position tracking and marker
  useEffect(() => {
    if (!mapReady) return;
    handlePositionTracking(map, positionMarker, userCoords, accuracyCircle, accuracyToggle, positionTracking, panned);
  }, [userCoords, positionTracking, accuracyToggle, mapReady, panned]);

  return null;
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

export { PositionMarkers };
