import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useDispatch, useSelector } from 'utils/use_selector';
import TileCache from 'state/actions/cache/TileCache';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { useHistory } from 'react-router-dom';
import { DoNothing } from 'UI/Features/LegacyMap/helpers/functional/do-nothing-mode';
import { IControl } from 'maplibre-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { InvasivesMap } from 'UI/Features/LegacyMap/InvasivesMap';
import Prompt from 'state/actions/prompts/Prompt';
import {
  GeoTrackingMode,
  convertLineToPolygon,
  updateGPSCoordinate
} from 'UI/Features/LegacyMap/helpers/functional/geo-tracking-mode';
import { WhatsHereBoxMode } from 'UI/Features/LegacyMap/helpers/functional/whats-here-box-mode';
import GeoShapes from 'constants/geoShapes';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import { TargetMode } from 'constants/targetModes';
import { GEO_TRACKING_FEATURE, SUBMITTED_ACTIVITY_SHAPE } from 'UI/Features/LegacyMap/helpers/functional/constants';

import { DrawModeDisplay, EditControls } from 'UI/Features/LegacyMap/helpers/components/MapCustomControls';
import Alerts from 'state/actions/alerts/Alerts';
import mappingAlertMessages from 'constants/alerts/mappingAlerts';
import { isDrawing, isPaused, isTracking } from 'utils/geoTrackingHelpers';
import { GeoTrackingStatus } from 'constants/geoTrackingStatus';
import { LAYER_Z_FOREGROUND } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import DrawToolActions from 'state/actions/drawtool/drawToolActions';

// @ts-expect-error mapboxdraw compatibility with maplibre-gl issue
MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
// @ts-expect-error mapboxdraw compatibility with maplibre-gl issue
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
// @ts-expect-error mapboxdraw compatibility with maplibre-gl issue
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

const DrawControls = () => {
  const map = useContext(MapContext);

  const whatsHereToggle = useSelector((state) => state.Map.whatsHere.toggle);
  const planMyTripDrawMode = useSelector((state) => state.Map.planMyTripDrawMode);
  const drawingCustomLayer = useSelector((state) => state.Map.drawingCustomLayer);

  const geoTrackingStatus = useSelector((state) => state.Map.track_me_draw_geo.status);
  const currGeoTrackingMode = isTracking(geoTrackingStatus);
  const isDrawingShape = isDrawing(geoTrackingStatus);
  const isPausedDrawing = isPaused(geoTrackingStatus);
  const [prevGeoTrackingMode, setPrevGeoTrackingMode] = useState<boolean>(false);

  const EMPTY_OBJECT = {}; //  a stable reference for the default value to avoid unnecessary re-renders
  const activityGeo = (useSelector((state) => state.ActivityPage.activity?.geometry) ?? [])[0] ?? EMPTY_OBJECT;

  const can_edit = useSelector((state) => !!state.ActivityPage?.activeActivityPermissions?.can_edit);
  const created_by = useSelector((state) => state.ActivityPage?.activity?.created_by);
  const username = useSelector((state) => state.Auth.username);
  const userCanEdit = username === created_by || can_edit;

  const url = useSelector((state) => state.AppMode.url);

  const dispatch = useDispatch();
  const uHistory = useHistory();

  const drawInstance = useRef<MapboxDraw>();
  const drawModeDisplay = useRef<DrawModeDisplay>();
  const editControls = useRef<EditControls>();
  const isEditing = useRef(false);

  // keep a ref to mode so we don't need to keep re-binding the callback for maplibre. keep it in sync with a hook.
  const modeRef = useRef<TargetMode>(TargetMode.DISABLED);

  const [mode, setMode] = useState<TargetMode>(TargetMode.DISABLED);
  const prevMode = useRef<TargetMode>(TargetMode.DISABLED);

  const isEditDisabled = ![TargetMode.ACTIVITY].includes(mode);

  /**
   * @desc Dispatch Custom event for when the Edit Button is used. Listened to by `LayerDataMarker.tsx`
   */
  const emitEdit = () => {
    map?.fire('draw.editshape', { active: isEditing.current });
  };
  const handleEdit = () => {
    const features = drawInstance.current?.getAll().features;

    if (!features || features.length === 0 || features[0].geometry.type === GeoShapes.Point) return;

    isEditing.current = true;
    emitEdit();
    drawInstance?.current?.changeMode('direct_select', { featureId: features[0].id });
    dispatch(Alerts.create(mappingAlertMessages.saveActivityShape));

    if (prevMode.current === TargetMode.ACTIVITY_GEO_TRACK) {
      // to disable geo-tracking resume button
      dispatch(GeoTracking.edit(true));
    }
  };

  const handleSave = () => {
    isEditing.current = false;
    drawInstance.current?.changeMode('simple_select');

    const updatedFeature = drawInstance.current?.getAll().features[0];
    emitEdit();
    if (!updatedFeature || updatedFeature.geometry.type === GeoShapes.Point) return;
    dispatch(DrawToolActions.updateShape(updatedFeature));

    if (prevMode.current === TargetMode.ACTIVITY_GEO_TRACK) {
      dispatch(GeoTracking.edit(false));
    }
  };

  const hasEditableShape = () => {
    const features = drawInstance.current?.getAll().features;

    if (!features || features.length === 0 || !userCanEdit) return false;

    const isGeoTracking = mode === TargetMode.ACTIVITY_GEO_TRACK;

    if (isGeoTracking) {
      return isPausedDrawing || geoTrackingStatus === GeoTrackingStatus.COMPLETED;
    }

    return features[0].geometry.type !== GeoShapes.Point;
  };

  const updateEditControlState = () => {
    const shouldEnableEdit = hasEditableShape();
    editControls.current?.setDisabled(!shouldEnableEdit);
  };

  useEffect(() => {
    modeRef.current = mode;

    const shouldEnableEdit = hasEditableShape() && !isEditDisabled;
    editControls.current?.setDisabled(!shouldEnableEdit);
  }, [mode]);

  useEffect(() => {
    updateEditControlState();
  }, [isDrawingShape, userCanEdit, activityGeo?.geometry]);

  // make a geometry for previously submitted shapes
  useEffect(() => {
    if (!activityGeo || mode === TargetMode.ACTIVITY_GEO_TRACK) return;

    const feature = drawInstance?.current?.getAll()?.features?.[0];
    const submittedShapeFeature = drawInstance?.current?.get(SUBMITTED_ACTIVITY_SHAPE);
    const isActivityGeoEmpty = (activityGeo?.geometry?.coordinates?.length ?? 0) === 0;
    const isFeaturePresent = (feature?.geometry?.coordinates?.length ?? 0) > 0;

    if (submittedShapeFeature?.id && !userCanEdit) {
      drawInstance?.current?.delete(String(submittedShapeFeature.id));
    }

    // Early return if:
    // - No geometry to draw
    // - A feature is already present
    // - User is not the creator or cannot edit
    // - Not on the Activity page
    if (isActivityGeoEmpty || isFeaturePresent || !userCanEdit || !url?.includes('Activity')) return;

    drawInstance?.current?.deleteAll();
    drawInstance?.current?.add({
      id: SUBMITTED_ACTIVITY_SHAPE,
      type: 'Feature',
      geometry: activityGeo.geometry,
      properties: {}
    });

    updateEditControlState();
  }, [activityGeo?.geometry, userCanEdit, url]);

  // update drawn LineString or Polygon to a red dotted line if an error occurs
  useEffect(() => {
    if (!activityGeo?.properties?.error) return;
    const feature = drawInstance?.current?.getAll()?.features?.[0];

    if (!feature) return;

    // Update feature properties to reflect error state
    feature.properties = {
      ...feature.properties,
      error: activityGeo.properties.error,
      user_error: activityGeo.properties.error
    };

    if (activityGeo.geometry?.type && activityGeo.geometry?.coordinates) {
      feature.geometry = {
        type: activityGeo.geometry.type,
        coordinates: activityGeo.geometry.coordinates
      };
    }

    try {
      drawInstance?.current?.deleteAll();
      drawInstance?.current?.add(feature);
    } catch (error) {
      console.error('Failed to update feature with error styling:', error);
    }
  }, [activityGeo?.properties?.error, activityGeo?.geometry]);

  useEffect(() => {
    const feature = drawInstance?.current?.get(GEO_TRACKING_FEATURE);
    const isActivityGeoEmpty = Object.keys(activityGeo).length === 0;
    const isFeaturePresent = feature && feature?.geometry?.coordinates?.length > 0;
    const coordinates = activityGeo?.geometry?.coordinates || [];
    const hasError = String(activityGeo?.properties?.error ?? 'false') === 'true';

    const handleInitialDraw = () => {
      setPrevGeoTrackingMode(currGeoTrackingMode);
    };

    const handleUpdate = () => {
      updateGPSCoordinate(coordinates, hasError ? 'true' : 'false');
      if (hasError) {
        setPrevGeoTrackingMode(false); // allow user to adjust shape after error
      }
    };

    const handlePolygonConversion = () => {
      convertLineToPolygon(coordinates, hasError ? 'true' : 'false');
      setPrevGeoTrackingMode(currGeoTrackingMode);
    };

    if (isActivityGeoEmpty && isFeaturePresent) {
      drawInstance?.current?.deleteAll();
      handleUpdate();
      return;
    }

    if (!activityGeo?.geometry || !isFeaturePresent) return;
    const isPolygon = activityGeo.geometry.type === GeoShapes.Polygon;

    const isInitialDraw = !feature || coordinates.length === 1;
    const exitedTrackingAndDrawing = !prevGeoTrackingMode;
    if (mode === TargetMode.ACTIVITY_GEO_TRACK) {
      if (isInitialDraw) {
        handleInitialDraw();
      } else {
        handleUpdate();
      }
    }

    if (exitedTrackingAndDrawing && isPolygon) {
      handlePolygonConversion();
    }
  }, [activityGeo?.geometry, currGeoTrackingMode]);

  useEffect(() => {
    const feature = drawInstance?.current?.get(GEO_TRACKING_FEATURE);
    const hasError = feature?.properties?.error === 'true';

    // Either intersection occurs or activity is reset in the store due to another error
    if (currGeoTrackingMode && hasError) {
      drawInstance?.current?.deleteAll();
      drawInstance?.current?.changeMode('geo_tracking_mode'); // force reset geo-tracking instance
    }

    // early exit
    if (!currGeoTrackingMode && prevGeoTrackingMode) setPrevGeoTrackingMode(false);
  }, [currGeoTrackingMode]);

  /**
   * @desc Override the delete button to clear all shapes from drawn tools and to update the Form activity with null shape.
   */
  MapboxDraw.modes.simple_select.onTrash = () => {
    const callback = (confirmation: boolean) => {
      if (confirmation) {
        drawInstance.current?.deleteAll();
        dispatch(DrawToolActions.deleteGeo());
        updateEditControlState();
      }
    };

    if (!drawInstance.current) return;
    if (mode === TargetMode.ACTIVITY) {
      dispatch(
        Prompt.confirmation({
          callback,
          title: 'Delete Geometry',
          prompt: 'Do you want to delete the geometry from the activity? This action cannot be undone.',
          confirmText: 'Delete Geometry'
        })
      );
    } else {
      if (mode === TargetMode.TRIP_PLANNING) {
        dispatch(TileCache.clearTileCacheShape());
        dispatch(PlanMyTrip.clearShape());
      } else if (mode === TargetMode.WHATS_HERE) {
        dispatch(WhatsHere.clear_whats_here());
      }

      drawInstance.current.deleteAll();
    }
  };

  const disableDrawButtons = (disabled: boolean) => {
    const buttons = document.querySelectorAll('.mapbox-gl-draw_ctrl-draw-btn');
    buttons.forEach((btn) => {
      (btn as HTMLButtonElement).disabled = disabled;
      btn.classList.toggle('disabled', disabled);
    });
  };

  const drawCreate = useCallback((event) => {
    if (!drawInstance.current) return;

    const currentMode = modeRef.current;

    //enforce one at a time everywhere
    const feature = event.features[0];
    try {
      drawInstance.current.deleteAll();
      drawInstance.current.add(feature);
    } catch (e) {
      console.error(e);
    }

    switch (currentMode) {
      case TargetMode.WHATS_HERE: {
        dispatch(WhatsHere.map_feature({ type: 'Feature', geometry: feature.geometry }));
        if (uHistory.location.pathname !== '/WhatsHere') {
          uHistory.push('/WhatsHere');
        }
        break;
      }
      case TargetMode.ACTIVITY: {
        dispatch(DrawToolActions.createShape(feature));
        break;
      }

      case TargetMode.ACTIVITY_GEO_TRACK: {
        // don't do anything
        break;
      }
      case TargetMode.CUSTOM_LAYER:
        dispatch(DrawToolActions.updateShape(feature));
        break;
      case TargetMode.TRIP_PLANNING: {
        dispatch(TileCache.setTileCacheShape({ geometry: feature.geometry }));
        dispatch(PlanMyTrip.setShape({ geometry: feature.geometry }));
        break;
      }
      case TargetMode.DISABLED: {
        drawInstance.current.deleteAll();
        break;
      }
      default: {
        dispatch(DrawToolActions.createShape(feature));
        break;
      }
    }
  }, []);

  // setup mode based on what's going on in the redux store / current url
  useEffect(() => {
    disableDrawButtons(false);

    if (whatsHereToggle) {
      setMode(TargetMode.WHATS_HERE);
      return;
    } else if (planMyTripDrawMode) {
      setMode(TargetMode.TRIP_PLANNING);
      return;
    } else if (drawingCustomLayer) {
      setMode(TargetMode.CUSTOM_LAYER);
      return;
    } else if (url?.includes('Activity')) {
      if (currGeoTrackingMode || prevGeoTrackingMode) {
        setMode(TargetMode.ACTIVITY_GEO_TRACK);
        disableDrawButtons(true);
      } else {
        setMode(TargetMode.ACTIVITY);
      }
    } else {
      setMode(TargetMode.DISABLED);
      disableDrawButtons(true);
      editControls.current?.reset();
    }
  }, [whatsHereToggle, planMyTripDrawMode, drawingCustomLayer, url, currGeoTrackingMode, prevGeoTrackingMode]);

  /**
   * @desc Update the Drawn Shape.
   * Temporarily add reference to map in the callback function due to an issue with current mapbox-draw-gl
   * This allows us to make sure that the dragPan functionality is enabled after shape creation.
   * @link https://github.com/mapbox/mapbox-gl-draw/issues/1366
   */
  const drawShapeUpdate = useCallback((event, map: InvasivesMap | undefined) => {
    if (!drawInstance.current) return;
    const currentMode = drawInstance.current.getMode();

    if (currentMode === 'direct_select') {
      map?.touchZoomRotate.disable();
    } else if (currentMode === 'simple_select') {
      map?.touchZoomRotate.enable();
      map?.dragPan.enable();
    } else {
      // we're not done drawing until we revert to one of these modes
      return;
    }

    const featureId = event.features?.[0]?.id;
    if (!isEditing.current) {
      if (featureId) {
        drawInstance.current.changeMode('simple_select');
      }
      return;
    }

    if (!featureId) return;

    drawInstance.current.changeMode('direct_select', { featureId });

    const editedGeo = drawInstance.current.getAll().features[0];
    if (editedGeo?.id !== featureId) {
      dispatch(DrawToolActions.updateShape(editedGeo));
    }
  }, []);

  useEffect(() => {
    if (!drawInstance.current) return;

    const shouldPreserveShape = prevMode.current === TargetMode.ACTIVITY_GEO_TRACK && mode === TargetMode.ACTIVITY;

    if (!shouldPreserveShape) {
      drawInstance.current.deleteAll();
    }

    switch (mode) {
      case TargetMode.WHATS_HERE:
        drawInstance.current.changeMode('whats_here_box_mode');
        break;
      case TargetMode.ACTIVITY_GEO_TRACK:
        drawInstance.current.changeMode('geo_tracking_mode');
        break;
      case TargetMode.ACTIVITY:
        drawInstance.current.changeMode('simple_select');
        break;
      case TargetMode.DISABLED:
        drawInstance.current.changeMode('do_nothing');
        break;
      default:
        break;
    }

    drawModeDisplay.current?.setMode(mode);
    prevMode.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!map) {
      return;
    }

    drawInstance.current = new MapboxDraw({
      displayControlsDefault: true,
      touchEnabled: true,
      controls: {
        combine_features: false,
        uncombine_features: false
      },
      userProperties: true,
      modes: {
        ...MapboxDraw.modes,
        do_nothing: DoNothing,
        whats_here_box_mode: WhatsHereBoxMode,
        geo_tracking_mode: GeoTrackingMode
      },
      styles: [
        {
          id: 'gl-edited-line.hot',
          type: 'line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          filter: ['all', ['==', 'active', 'true']],
          paint: {
            'line-color': '#FCBA19',
            'line-dasharray': [0.2, 2],
            'line-width': 3
          },
          slot: LAYER_Z_FOREGROUND
        },
        {
          id: 'gl-drawn-line.hot',
          type: 'line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          filter: ['all', ['==', 'active', 'false'], ['!=', 'user_error', 'true']],
          paint: {
            'line-color': '#FCBA19',
            'line-width': 3
          },
          slot: LAYER_Z_FOREGROUND
        },
        {
          id: 'gl-drawn-fill.hot',
          type: 'fill',
          layout: {},
          filter: ['all', ['==', 'active', 'false'], ['!=', 'user_error', 'true']],
          paint: {
            'fill-color': 'white',
            'fill-opacity': 0.5
          },
          slot: LAYER_Z_FOREGROUND
        },
        {
          id: 'gl-error-line.hot',
          type: 'line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': ['match', ['get', 'user_error'], 'true', '#B00020', 'false', '#FCBA19', '#FCBA19'],
            'line-dasharray': [1, 2],
            'line-width': 3
          },
          slot: LAYER_Z_FOREGROUND
        },
        {
          id: 'gl-draw-polygon-point.hot',
          type: 'circle',
          paint: {
            'circle-radius': 3,
            'circle-color': ['match', ['get', 'user_error'], 'true', '#B00020', 'false', '#FCBA19', '#FCBA19'],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          },
          slot: LAYER_Z_FOREGROUND
        },
        {
          id: 'whats-here-box-start-point-marker',
          filter: ['all', ['==', 'mode', 'whats_here_box_mode'], ['==', 'meta:type', 'Point']],
          type: 'circle',
          paint: {
            'circle-radius': 4,
            'circle-color': '#FCBA19',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          },
          slot: LAYER_Z_FOREGROUND
        }
      ]
    });
    drawModeDisplay.current = new DrawModeDisplay(mode);
    editControls.current = new EditControls(handleEdit, handleSave, isEditDisabled);

    map.on('draw.create', drawCreate);
    map.on('draw.selectionchange', (evt) => drawShapeUpdate(evt, map));

    map.addControl(drawInstance.current as unknown as IControl, 'top-left');
    map.addControl(editControls.current, 'top-left');
    map.addControl(drawModeDisplay.current, 'top-left');

    // cleanup
    return () => {
      if (!map) {
        return;
      }

      map.off('draw.create', drawCreate);
      map.off('draw.selectionChange', (evt) => drawShapeUpdate(evt, map));

      if (drawInstance.current) {
        (map as unknown as mapboxgl.Map).removeControl(drawInstance.current);
        drawInstance.current = undefined;
      }

      if (drawModeDisplay.current) {
        map.removeControl(drawModeDisplay.current);
        drawModeDisplay.current = undefined;
      }
      if (editControls.current) {
        map.removeControl(editControls.current);
        editControls.current = undefined;
      }
    };
  }, [map]);

  return null;
};

export { DrawControls };
