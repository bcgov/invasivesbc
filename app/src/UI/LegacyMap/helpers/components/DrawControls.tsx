import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MapContext } from 'UI/LegacyMap/helpers/components/MapContext';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useDispatch, useSelector } from 'utils/use_selector';
import { ACTIVITY_UPDATE_GEO_SUCCESS, MAP_ON_SHAPE_CREATE, MAP_ON_SHAPE_UPDATE } from 'state/actions';
import TileCache from 'state/actions/cache/TileCache';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { useHistory } from 'react-router-dom';
import { DoNothing, LotsOfPointsMode } from 'UI/LegacyMap/helpers/functional/custom-drawing-modes';
import maplibregl, { IControl } from 'maplibre-gl';
import { createRoot, Root } from 'react-dom/client';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { InvasivesMap } from 'UI/LegacyMap/InvasivesMap';
import Prompt from 'state/actions/prompts/Prompt';
import { WhatsHereBoxMode } from 'UI/LegacyMap/helpers/functional/whats-here-box-mode';

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
  TILE_CACHE = 'TILE_CACHE'
}

const DrawControls = () => {
  const map = useContext(MapContext);

  const whatsHereToggle = useSelector((state) => state.Map.whatsHere.toggle);
  const tileCacheMode = useSelector((state) => state.Map.tileCacheMode);
  const drawingCustomLayer = useSelector((state) => state.Map.drawingCustomLayer);
  const appModeURL = useSelector((state) => state.AppMode.url);
  const activityGeo = useSelector((state) => state.ActivityPage.activity?.geometry ?? {});
  const prevGeoErrorRef = useRef(activityGeo?.properties?.error);

  const dispatch = useDispatch();
  const drawInstance = useRef<MapboxDraw>();
  const drawModeDisplay = useRef<DrawModeDisplay>();

  const uHistory = useHistory();

  const [mode, setMode] = useState<TargetMode>(TargetMode.DISABLED);

  // keep a ref to mode so we don't need to keep re-binding the callback for maplibre. keep it in sync with a hook.
  const modeRef = useRef<TargetMode>(TargetMode.DISABLED);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // update the drawn LineString or Polygon to a red dotted line if an error occurs
  useEffect(() => {
    const feature = drawInstance?.current?.getAll().features[0];
    if (feature) {
      feature.properties = { error: activityGeo?.properties?.error ?? 'false' };
      try {
        drawInstance?.current?.deleteAll();
        drawInstance?.current?.add(feature);
      } catch (e) {
        console.error(e);
      }
    }
  }, [activityGeo?.properties?.error, activityGeo?.geometry]);

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
        uHistory.push('/WhatsHere');
        break;
      }
      case TargetMode.ACTIVITY: {
        dispatch({ type: MAP_ON_SHAPE_CREATE, payload: feature });
        break;
      }
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
      setMode(TargetMode.ACTIVITY);
    } else {
      setMode(TargetMode.DISABLED);
    }
  }, [whatsHereToggle, tileCacheMode, drawingCustomLayer, appModeURL]);

  /**
   * @desc Update the Drawn Shape.
   * Temporarily add reference to map in the callback function due to an issue with current mapbox-draw-gl
   * This allows us to make sure that the dragPan functionality is enabled after shape creation.
   * @link https://github.com/mapbox/mapbox-gl-draw/issues/1366
   */
  const drawShapeUpdate = useCallback((event, map: InvasivesMap | undefined) => {
    if (!drawInstance.current) return;

    const currentMode = drawInstance.current.getMode();

    if ('direct_select' === currentMode) {
      map?.touchZoomRotate.disable();
    } else if ('simple_select' === currentMode) {
      map?.touchZoomRotate.enable();
      map?.dragPan.enable();
    } else {
      // we're not done drawing until we revert to one of these modes
      return;
    }

    const editedGeo = drawInstance.current.getAll().features[0];

    if (editedGeo?.id !== event?.features?.[0]?.id) {
      dispatch({ type: MAP_ON_SHAPE_UPDATE, payload: editedGeo });
    }
  }, []);

  useEffect(() => {
    if (drawModeDisplay.current) {
      drawModeDisplay.current.setMode(mode);
    }

    if (drawInstance.current) {
      // we changed modes, so reset everything
      drawInstance.current.deleteAll();

      switch (mode) {
        case TargetMode.WHATS_HERE:
          drawInstance.current.changeMode('whats_here_box_mode');
          break;
        case TargetMode.DISABLED:
        case TargetMode.ACTIVITY:
          drawInstance.current.changeMode('do_nothing');
          break;
        default:
          break;
      }
    }
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
        lots_of_points: LotsOfPointsMode,
        whats_here_box_mode: WhatsHereBoxMode
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
          id: 'gl-error-line',
          type: 'line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          filter: ['all', ['==', 'active', 'false']],
          paint: {
            'line-color': ['match', ['get', 'user_error'], 'true', 'red', 'false', '#FCBA19', '#FCBA19'],
            'line-dasharray': [1, 2],
            'line-width': 3
          }
        },
        {
          id: 'gl-draw-polygon-point',
          type: 'circle',
          paint: {
            'circle-radius': 3,
            'circle-color': ['match', ['get', 'user_error'], 'true', 'red', 'false', '#FCBA19', '#FCBA19'],
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

    map.on('draw.create', drawCreate);
    map.on('draw.selectionchange', (evt) => drawShapeUpdate(evt, map));

    map.addControl(drawInstance.current as unknown as IControl, 'top-left');
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
      this._root.render(<>Current drawing mode: {this._text}</>);
    }
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    this._map = map;
    const control = document.createElement('div');
    control.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    this._root = createRoot(control);

    this._rerender();

    this._container = control;

    return this._container;
  }

  onRemove(_map: maplibregl.Map) {
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

export { DrawControls };
