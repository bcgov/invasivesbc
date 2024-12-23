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
import { createRoot } from 'react-dom/client';

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

  const uHistory = useHistory();

  const [mode, setMode] = useState<TargetMode>(TargetMode.DISABLED);

  const drawCreate = useCallback((event) => {
    if (!drawInstance.current) return;

    //enforce one at a time everywhere
    const feature = event.features[0];
    try {
      drawInstance.current.deleteAll();
      drawInstance.current.add(feature);
    } catch (e) {
      console.error(e);
    }

    switch (mode) {
      case TargetMode.WHATS_HERE: {
        dispatch(WhatsHere.map_feature({ type: 'Feature', geometry: feature.geometry }));
        uHistory.push('/WhatsHere');
        break;
      }
      case TargetMode.ACTIVITY: {
        break;
      }

      case TargetMode.TILE_CACHE: {
        dispatch(TileCache.setTileCacheShape({ geometry: feature.geometry }));
        break;
      }
      case TargetMode.DISABLED:
      default: {
        dispatch({ type: MAP_ON_SHAPE_CREATE, payload: feature });
        break;
      }
    }
  }, []);

  // setup mode based on what's going on in the redux store / current url
  useEffect(() => {
    console.log('recomputing mode');

    const genericDrawTarget = true;

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
      return;
    } else if (genericDrawTarget) {
      setMode(TargetMode.GENERIC);
      return;
    }
    setMode(TargetMode.DISABLED);
  }, [whatsHereToggle, tileCacheMode, drawingCustomLayer, appModeURL]);

  const drawShapeUpdate = useCallback((event) => {
    if (!drawInstance.current) return;

    const editedGeo = drawInstance.current.getAll().features[0];
    if (editedGeo?.id !== event?.features?.[0]?.id) {
      dispatch({ type: MAP_ON_SHAPE_UPDATE, payload: editedGeo });
    }
  }, []);

  useEffect(() => {
    if (!map) {
      return;
    }

    console.log(`setting up for ${mode}`);

    if (mode == TargetMode.DISABLED) {
      return;
    }

    const modes = (() => {
      if (tileCacheMode) {
        return {
          ...MapboxDraw.modes
        };
      } else {
        return Object.assign(
          {
            draw_rectangle: DrawRectangle,
            do_nothing: DoNothing,
            lots_of_points: LotsOfPointsMode,
            whats_here_box_mode: WhatsHereBoxMode
          },
          MapboxDraw.modes
        );
      }
    })();

    drawInstance.current = new MapboxDraw({
      displayControlsDefault: true,
      controls: {
        combine_features: false,
        uncombine_features: false
      },
      defaultMode: mode == TargetMode.WHATS_HERE ? 'whats_here_box_mode' : 'simple_select',
      modes: modes as { [modeKey: string]: DrawCustomMode }
    });

    const drawModeDisplay = new DrawModeDisplay(mode);

    map.on('draw.create', drawCreate);
    map.on('draw.selectionchange', drawShapeUpdate);

    map.addControl(drawInstance.current as unknown as IControl, 'top-left');
    map.addControl(drawModeDisplay, 'top-left');

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

      map.removeControl(drawModeDisplay);

      console.debug('mapboxdraw listener cleanup complete');
    };
  }, [map, mode]);

  return null;
};

class DrawModeDisplay implements IControl {
  _text: string;
  _map: maplibregl.Map | undefined;
  _container: HTMLDivElement | undefined;

  constructor(mode: TargetMode) {
    this._text = mode;
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    this._map = map;
    const control = document.createElement('div');
    control.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    const root = createRoot(control);

    root.render(<>Current drawing mode: {this._text}</>);

    this._container = control;

    return this._container;
  }

  onRemove(_map: maplibregl.Map) {
    if (this._container?.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
  }
}

export { DrawControls };
