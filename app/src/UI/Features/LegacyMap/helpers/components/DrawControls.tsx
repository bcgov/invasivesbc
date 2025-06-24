import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useDispatch, useSelector } from 'utils/use_selector';
import { ACTIVITY_UPDATE_GEO_SUCCESS, MAP_ON_SHAPE_CREATE, MAP_ON_SHAPE_UPDATE } from 'state/actions';
import TileCache from 'state/actions/cache/TileCache';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { useHistory } from 'react-router-dom';
import { DoNothing } from 'UI/Features/LegacyMap/helpers/functional/do-nothing-mode';
import maplibregl, { IControl } from 'maplibre-gl';
import { createRoot, Root } from 'react-dom/client';
import editButton from '/assets/icon/edit.png';
import saveButton from '/assets/icon/save-outline.png';
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
import { GEO_TRACKING_FEATURE } from '../functional/constants';

// @ts-expect-error mapboxdraw compatibility with maplibre-gl issue
MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
// @ts-expect-error mapboxdraw compatibility with maplibre-gl issue
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
// @ts-expect-error mapboxdraw compatibility with maplibre-gl issue
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

enum TargetMode {
  DISABLED = 'DISABLED',
  GENERIC = 'GENERIC',
  WHATS_HERE = 'WHATS_HERE',
  CUSTOM_LAYER = 'CUSTOM_LAYER',
  ACTIVITY = 'ACTIVITY',
  ACTIVITY_GEO_TRACK = 'ACTIVITY_GEO_TRACK',
  TILE_CACHE = 'TILE_CACHE'
}

const DrawControls = () => {
  const map = useContext(MapContext);

  const whatsHereToggle = useSelector((state) => state.Map.whatsHere.toggle);
  const tileCacheMode = useSelector((state) => state.Map.tileCacheMode);
  const drawingCustomLayer = useSelector((state) => state.Map.drawingCustomLayer);
  const appModeURL = useSelector((state) => state.AppMode.url);
  const currGeoTrackingMode = useSelector((state) => state.Map.track_me_draw_geo.isTracking);
  const [prevGeoTrackingMode, setPrevGeoTrackingMode] = useState<boolean>(false);
  const EMPTY_OBJECT = {}; //  a stable reference for the default value to avoid unnecessary re-renders
  const activityGeo = (useSelector((state) => state.ActivityPage.activity?.geometry) ?? [])[0] ?? EMPTY_OBJECT;

  const dispatch = useDispatch();
  const drawInstance = useRef<MapboxDraw>();
  const drawModeDisplay = useRef<DrawModeDisplay>();
  const editControls = useRef<EditControls>();
  const isEditing = useRef(false);

  const uHistory = useHistory();

  const [mode, setMode] = useState<TargetMode>(TargetMode.DISABLED);
  const isEditDisabled = ![TargetMode.ACTIVITY].includes(mode);

  // keep a ref to mode so we don't need to keep re-binding the callback for maplibre. keep it in sync with a hook.
  const modeRef = useRef<TargetMode>(TargetMode.DISABLED);

  const handleEdit = () => {
    const features = drawInstance.current?.getAll().features;

    if (!features || features.length === 0) {
      return;
    }

    isEditing.current = true;
    drawInstance?.current?.changeMode('direct_select', { featureId: features[0].id });
  };

  const handleSave = () => {
    isEditing.current = false;
    drawInstance.current?.changeMode('simple_select');

    const updatedFeature = drawInstance.current?.getAll().features[0];
    if (updatedFeature) {
      dispatch({ type: MAP_ON_SHAPE_UPDATE, payload: updatedFeature });
    }
  };

  useEffect(() => {
    modeRef.current = mode;
    editControls.current?.setDisabled(isEditDisabled);
  }, [mode]);

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
    const isFeaturePresent = feature && Object.keys(feature).length > 0;

    if (isActivityGeoEmpty && isFeaturePresent) {
      drawInstance?.current?.deleteAll();
      return;
    }

    if (!activityGeo?.geometry) return;

    const isPolygon = activityGeo.geometry.type === GeoShapes.Polygon;
    const coordinates = activityGeo.geometry.coordinates;
    const hasError = String(activityGeo?.properties?.error ?? 'false') === 'true';
    const isInitialDraw = !feature || coordinates.length === 1;
    const justExitedTracking = prevGeoTrackingMode && !currGeoTrackingMode;

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

    if (mode === TargetMode.ACTIVITY_GEO_TRACK) {
      if (isInitialDraw) {
        handleInitialDraw();
      } else {
        handleUpdate();
      }
    }

    if (justExitedTracking && isPolygon) {
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
        dispatch({
          type: ACTIVITY_UPDATE_GEO_SUCCESS,
          payload: {
            geometry: undefined,
            utm: undefined,
            lat: undefined,
            long: undefined,
            reported_area: undefined,
            Well_Information: undefined
          }
        });
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
      if (mode === TargetMode.TILE_CACHE) {
        dispatch(TileCache.clearTileCacheShape());
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
        dispatch({ type: MAP_ON_SHAPE_CREATE, payload: feature });
        break;
      }

      case TargetMode.ACTIVITY_GEO_TRACK: {
        // don't do anything
        break;
      }
      case TargetMode.CUSTOM_LAYER:
        dispatch({ type: MAP_ON_SHAPE_UPDATE, payload: feature });
        break;
      case TargetMode.TILE_CACHE: {
        dispatch(TileCache.setTileCacheShape({ geometry: feature.geometry }));
        break;
      }
      case TargetMode.DISABLED: {
        drawInstance.current.deleteAll();
        break;
      }
      default: {
        dispatch({ type: MAP_ON_SHAPE_CREATE, payload: feature });
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
    } else if (tileCacheMode) {
      setMode(TargetMode.TILE_CACHE);

      return;
    } else if (drawingCustomLayer) {
      setMode(TargetMode.CUSTOM_LAYER);
      return;
    } else if (appModeURL?.includes('Activity')) {
      if (currGeoTrackingMode || prevGeoTrackingMode) {
        setMode(TargetMode.ACTIVITY_GEO_TRACK);
        disableDrawButtons(true);
      } else {
        setMode(TargetMode.ACTIVITY);
      }
    } else {
      setMode(TargetMode.DISABLED);
      disableDrawButtons(true);
    }
  }, [whatsHereToggle, tileCacheMode, drawingCustomLayer, appModeURL, currGeoTrackingMode, prevGeoTrackingMode]);

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
      dispatch({ type: MAP_ON_SHAPE_UPDATE, payload: editedGeo });
    }
  }, []);

  useEffect(() => {
    if (!drawInstance.current) return;

    drawInstance.current.deleteAll();

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
  }, [mode]);

  useEffect(() => {
    if (!map) {
      return;
    }

    drawInstance.current = new MapboxDraw({
      displayControlsDefault: true,
      controls: {
        combine_features: false,
        uncombine_features: false
      },
      touchEnabled: true,
      userProperties: true,
      modes: {
        ...MapboxDraw.modes,
        do_nothing: DoNothing,
        whats_here_box_mode: WhatsHereBoxMode,
        geo_tracking_mode: GeoTrackingMode
      },
      styles: [
        {
          id: 'gl-edited-line',
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
          }
        },
        {
          id: 'gl-drawn-line',
          type: 'line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          filter: ['all', ['==', 'active', 'false'], ['!=', 'user_error', 'true']],
          paint: {
            'line-color': '#FCBA19',
            'line-width': 3
          }
        },
        {
          id: 'gl-drawn-fill',
          type: 'fill',
          layout: {},
          filter: ['all', ['==', 'active', 'false'], ['!=', 'user_error', 'true']],
          paint: {
            'fill-color': 'white',
            'fill-opacity': 0.5
          }
        },
        {
          id: 'gl-error-line',
          type: 'line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': ['match', ['get', 'user_error'], 'true', '#B00020', 'false', '#FCBA19', '#FCBA19'],
            'line-dasharray': [1, 2],
            'line-width': 3
          }
        },
        {
          id: 'gl-draw-polygon-point',
          type: 'circle',
          paint: {
            'circle-radius': 3,
            'circle-color': ['match', ['get', 'user_error'], 'true', '#B00020', 'false', '#FCBA19', '#FCBA19'],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
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
          }
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

class DrawModeDisplay implements IControl {
  _text: string;
  _map: maplibregl.Map | undefined;
  _container: HTMLDivElement | undefined;

  _root: Root | undefined = undefined;

  constructor(mode: TargetMode) {
    this._text = mode;
  }

  setMode(mode: TargetMode) {
    this._text = mode;
    this._rerender();
  }

  _rerender() {
    if (this._root) {
      this._root.render(<>Drawing mode: {this._text}</>);
    }
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    this._map = map;
    const control = document.createElement('div');
    control.style.background = 'rgba(255, 255, 255, 0.8)';
    control.style.padding = '0 5px';
    control.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    control.style.borderRadius = '4px';
    control.id = 'draw-mode-display';

    this._root = createRoot(control);

    this._rerender();

    this._container = control;

    return this._container;
  }

  onRemove() {
    if (this._root) {
      this._root.unmount();
      this._root = undefined;
    }
    if (this._container?.parentNode) {
      this._container.parentNode.removeChild(this._container);
      this._container = undefined;
    }
  }
}

class EditControls implements IControl {
  _container?: HTMLDivElement;
  _map?: maplibregl.Map;
  _root?: Root;
  _onEdit?: () => void;
  _onSave?: () => void;
  _isDisabled?: boolean;

  constructor(onEdit?: () => void, onSave?: () => void, isDisabled: boolean = false) {
    this._onEdit = onEdit;
    this._onSave = onSave;
    this._isDisabled = isDisabled;
  }

  setDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
    if (this._root && this._container) {
      this._root.render(<EditControlUI onEdit={this._onEdit} onSave={this._onSave} isDisabled={this._isDisabled} />);
    }
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    this._map = map;
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    container.style.background = 'rgba(255, 255, 255, 1.0)';
    container.style.marginTop = '0px';
    container.style.borderRadius = '0px 0px 4px 4px';
    container.id = 'custom-edit-tool';

    this._root = createRoot(container);
    this._root.render(
      <EditControlUI onEdit={this._onEdit} onSave={this._onSave} isDisabled={this._isDisabled ?? false} />
    );

    this._container = container;
    return container;
  }

  onRemove() {
    if (this._root) {
      this._root.unmount();
      this._root = undefined;
    }
    if (this._container?.parentNode) {
      this._container.parentNode.removeChild(this._container);
      this._container?.remove();
      this._container = undefined;
    }
  }
}

type EditControlUIProps = {
  onEdit?: () => void;
  onSave?: () => void;
  isDisabled: boolean;
};

const EditControlUI: React.FC<EditControlUIProps> = ({ onEdit, onSave, isDisabled }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
    onEdit?.();
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onSave?.();
  };

  return (
    <>
      {!isEditing ? (
        <button
          onClick={handleEditClick}
          disabled={isDisabled}
          className={`${isDisabled ? 'custom-edit-button disabled' : ''}`}
        >
          <img src={editButton} alt="✏️" style={{ width: 15, height: 15, marginTop: 3 }} />
        </button>
      ) : (
        <button title="Save" onClick={handleSaveClick}>
          <img src={saveButton} alt="💾" style={{ width: 15, height: 15, marginTop: 3 }} />
        </button>
      )}
    </>
  );
};

export { DrawControls };
