import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MapContext } from 'UI/LegacyMap/helpers/components/MapContext';
import MapboxDraw, { DrawCustomMode } from '@mapbox/mapbox-gl-draw';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import { useDispatch, useSelector } from 'utils/use_selector';
import { MAP_ON_SHAPE_CREATE, MAP_ON_SHAPE_UPDATE } from 'state/actions';
import TileCache from 'state/actions/cache/TileCache';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { useHistory } from 'react-router-dom';
import { DoNothing, LotsOfPointsMode, WhatsHereBoxMode } from 'UI/LegacyMap/helpers/functional/custom-drawing-modes';
import maplibregl, { IControl } from 'maplibre-gl';
import { createRoot, Root } from 'react-dom/client';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

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
  const activityGeo = useSelector((state) => state.ActivityPage.activity?.geometry);
  const drawingCustomLayer = useSelector((state) => state.Map.drawingCustomLayer);
  const appModeURL = useSelector((state) => state.AppMode.url);

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

  const drawShapeUpdate = useCallback((event) => {
    if (!drawInstance.current) return;

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
          drawInstance.current.changeMode('do_nothing');
          break;
        case TargetMode.ACTIVITY:
          drawInstance.current.changeMode('do_nothing');
          if (activityGeo && activityGeo[0] && activityGeo[0].id) {
            drawInstance.current.deleteAll();
            drawInstance.current.add(activityGeo[0]);
          }
          break;
        default:
          break;
      }

      //drawInstance.current.changeMode('whats_here_box_mode');
    }
  }, [mode, activityGeo]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const modes = (() => {
      return Object.assign(
        {
          draw_rectangle: DrawRectangle,
          do_nothing: DoNothing,
          lots_of_points: LotsOfPointsMode,
          whats_here_box_mode: WhatsHereBoxMode
        },
        MapboxDraw.modes
      );
    })();

    drawInstance.current = new MapboxDraw({
      displayControlsDefault: true,
      controls: {
        combine_features: false,
        uncombine_features: false
      },
      defaultMode: 'simple_select',
      modes: modes as { [modeKey: string]: DrawCustomMode },
      styles: [
        {
          id: 'gl-draw-line',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#D20C0C',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        }
      ]
    });

    drawModeDisplay.current = new DrawModeDisplay(mode);

    map.on('draw.create', drawCreate);
    map.on('draw.selectionchange', drawShapeUpdate);

    map.addControl(drawInstance.current as unknown as IControl, 'top-left');
    map.addControl(drawModeDisplay.current, 'top-left');

    // cleanup
    return () => {
      if (!map) {
        return;
      }

      map.off('draw.create', drawCreate);
      map.off('draw.selectionChange', drawShapeUpdate);

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
