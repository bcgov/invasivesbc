import { useContext, useEffect, useRef } from 'react';
import { refreshWhatsHereFeature } from 'UI/Features/LegacyMap/helpers/functional/whats-here';
import {
  refreshCurrentRecMakers,
  refreshHighlightedRecord
} from 'UI/Features/LegacyMap/helpers/functional/current-record';
import pointOnFeature from '@turf/point-on-feature';
import maplibregl, { LngLatLike } from 'maplibre-gl';
import { useSelector } from 'utils/use_selector';
import circle from '@turf/circle';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { handlePositionTracking } from 'UI/Features/LegacyMap/helpers/functional/position-tracking';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { makeMapMarker, makeMarkerElement } from 'utils/makeMapMarker';

const PositionMarkers = ({ mapReady }) => {
  const map = useContext(MapContext);

  // User tracking coords jump and markers/indicators
  const userCoords = useSelector((state) => state.Map.userCoords);
  const accuracyToggle = useSelector((state) => state.Map.accuracyToggle);
  const positionTracking = useSelector((state) => state.Map.positionTracking);
  const panned = useSelector((state) => state.Map.panned);
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
  const hoveredFeature = useSelector((state) => state.Map.whatsHere?.feature);
  const appModeUrl = useSelector((state) => state.AppMode.url);

  const activityGeo = useSelector((state) => state.ActivityPage.activity?.geometry);

  const currentActivityShortID = useSelector((state) => state.ActivityPage.activity?.short_id);
  const currentIAPPID = useSelector((state) => state.IAPPSitePage.site?.site_id);
  const currentIAPPGeo = useSelector((state) => state.IAPPSitePage.site?.geom);

  //Highlighted Record from main records page:
  const quickPanToRecord = useSelector((state) => state.Map.quickPanToRecord);
  const userRecordOnHoverRecordGeometry = useSelector((state) => state.Map.userRecordOnHoverRecordGeometry);
  const userRecordOnHoverRecordType = useSelector((state) => state.Map.userRecordOnHoverRecordType);
  const userRecordOnHoverRecordID = useSelector((state) => state.Map.userRecordOnHoverRecordID);
  const readableIdentifier = useSelector((state) => state.Map?.readableIdentifier);

  // Map Marker Refs
  const activityMarker = useRef<maplibregl.Marker>();
  const IAPPMarker = useRef<maplibregl.Marker>();
  const hoveredFeatureMarker = useRef<maplibregl.Marker>();
  const positionMarker = useRef(
    new maplibregl.Marker({
      element: makeMarkerElement(
        '/assets/icon/circle.svg',
        buildTimeConfig.MOBILE ? 'userTrackingMarker userTrackingMarkerCone' : 'userTrackingMarker'
      )
    })
  );

  // Sets Map Marker for Currently Hovered Record
  useEffect(() => {
    if (!mapReady) return;

    hoveredFeatureMarker?.current?.remove();
    hoveredFeatureMarker.current = makeMapMarker({
      marker: new maplibregl.Marker(),
      ref: hoveredFeatureMarker,
      id: readableIdentifier,
      recordType: userRecordOnHoverRecordType
    });
    refreshCurrentRecMakers(map, {
      userRecordOnHoverRecordGeometry,
      whatsHereMarker: hoveredFeatureMarker.current,
      whatsHereFeature: hoveredFeature
    });
  }, [hoveredFeature, userRecordOnHoverRecordID, readableIdentifier]);

  // Sets Map Marker for Active IAPP
  useEffect(() => {
    if (!mapReady) return;
    hoveredFeature?.current?.remove();
    IAPPMarker?.current?.remove();
    IAPPMarker.current = makeMapMarker({
      ref: IAPPMarker,
      iconSrc: '/assets/iapp_logo.gif',
      classes: 'IAPPMarkerEl',
      id: currentIAPPID,
      recordType: RecordSetType.IAPP
    });
    refreshCurrentRecMakers(map, {
      currentIAPPID,
      currentIAPPGeo,
      IAPPMarker: IAPPMarker.current
    });
  }, [currentIAPPID, currentIAPPGeo]);

  // Sets Map Marker for Active Activity
  useEffect(() => {
    if (!mapReady) return;
    hoveredFeature?.current?.remove();
    activityMarker?.current?.remove();
    activityMarker.current = makeMapMarker({
      ref: activityMarker,
      iconSrc: '/assets/InvasivesBC_Icon.svg',
      classes: 'activityMarkerEl',
      id: currentActivityShortID,
      recordType: RecordSetType.Activity
    });

    refreshCurrentRecMakers(map, {
      activityGeo,
      currentActivityShortID,
      activityMarker: activityMarker.current
    });
  }, [currentActivityShortID, activityGeo]);

  // Highlighted Record
  useEffect(() => {
    if (!mapReady) return;
    if (!map) return;

    refreshHighlightedRecord(map, { userRecordOnHoverRecordGeometry, userRecordOnHoverRecordType });
    if (quickPanToRecord && userRecordOnHoverRecordGeometry) {
      const c = pointOnFeature(userRecordOnHoverRecordGeometry).geometry.coordinates as LngLatLike;
      if (c) {
        map.easeTo({
          center: c,
          zoom: 15,
          offset: [0, map.getContainer().clientHeight * -0.2]
        });
      }
    }
  }, [userRecordOnHoverRecordGeometry, quickPanToRecord]);

  useEffect(() => {
    refreshWhatsHereFeature(map, { whatsHereFeature: hoveredFeature });
  }, [hoveredFeature, appModeUrl, map, mapReady]);

  useEffect(() => {
    try {
      if (!mapReady) return;
      if (!userCoords?.heading) return;
      if (positionMarker?.current.getRotation() === userCoords?.heading) return;
      positionMarker?.current.setRotationAlignment('map');
      positionMarker?.current.setRotation(userCoords?.heading);
    } catch (e) {
      console.error(e);
    }
  }, [userCoords?.heading, mapReady]);

  // User position tracking marker
  useEffect(() => {
    if (!mapReady) return;
    if (positionTracking) {
      handlePositionTracking(
        map,
        positionMarker.current,
        userCoords,
        accuracyCircle,
        accuracyToggle,
        positionTracking,
        panned
      );
    } else {
      positionMarker?.current?.remove();
    }
  }, [userCoords, positionTracking, accuracyToggle, mapReady, panned]);

  return null;
};

export { PositionMarkers };
