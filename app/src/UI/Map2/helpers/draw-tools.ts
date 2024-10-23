import MapboxDraw, { DrawCustomMode } from '@mapbox/mapbox-gl-draw';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';

import maplibregl from 'maplibre-gl';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import TileCache from 'state/actions/cache/TileCache';
import { MAP_ON_SHAPE_CREATE, MAP_ON_SHAPE_UPDATE } from 'state/actions';
import { AppDispatch } from 'utils/use_selector';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

// @ts-ignore
MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

interface RefreshDrawControlsOptions {
  map: maplibregl.Map;
  draw;
  drawSetter;
  dispatch: AppDispatch;
  uHistory;
  whatsHereToggle: boolean;
  tileCacheMode: boolean;
  appModeUrl: string;
  activityGeo;
  drawingCustomLayer: boolean;
}

export const refreshDrawControls = (options: RefreshDrawControlsOptions) => {
  const {
    map,
    draw,
    drawSetter,
    dispatch,
    uHistory,
    whatsHereToggle,
    tileCacheMode,
    appModeUrl,
    activityGeo,
    drawingCustomLayer
  } = options;
  /*
    We fully tear down map box draw and re-add depending on app state / route, to have conditionally rendered controls:
    Because mapbox draw doesn't clean up its old sources properly we need to do it manually
   */
  try {
    if (map.hasControl(draw)) {
      map.removeControl(draw);
      drawSetter(null);
    }
  } catch (e) {
    console.error(e);
  }

  if (!map.hasControl(draw)) {
    const noMapVisible = /Report|Batch|Landing|WhatsHere/.test(appModeUrl);
    const userInActivity = /Activity/.test(appModeUrl);
    let hideControls = (noMapVisible || !userInActivity) && !drawingCustomLayer;
    if (tileCacheMode) {
      hideControls = false;
    }

    initDrawModes({
      map,
      drawSetter,
      dispatch,
      uHistory,
      hideControls,
      activityGeo: userInActivity ? activityGeo : null,
      whatsHereToggle,
      tileCacheMode,

      draw
    });
  }
};

const customDrawListenerCreate = (drawInstance, dispatch, uHistory, whats_here_toggle, tileCacheMode) => (e) => {
  //enforce one at a time everywhere
  const feature = e.features[0];
  try {
    if (drawInstance) {
      drawInstance.deleteAll();
      drawInstance.add(feature);
    }
  } catch (e) {
    console.error(e);
  }

  // For what's here
  if (whats_here_toggle) {
    dispatch(WhatsHere.map_feature({ type: 'Feature', geometry: feature.geometry }));
    uHistory.push('/WhatsHere');
  } else if (tileCacheMode) {
    dispatch(TileCache.setTileCacheShape({ geometry: feature.geometry }));
  } else {
    dispatch({ type: MAP_ON_SHAPE_CREATE, payload: feature });
  }
};

const customDrawListenerSelectionChange = (drawInstance: MapboxDraw, dispatch) => (e) => {
  const editedGeo = drawInstance.getAll().features[0];
  if (editedGeo?.id !== e?.features?.[0]?.id) {
    dispatch({ type: MAP_ON_SHAPE_UPDATE, payload: editedGeo });
  }
};

const attachedListeners: WeakRef<Function>[] = [];

interface InitDrawModesOptions {
  map: maplibregl.Map;
  drawSetter;
  dispatch: AppDispatch;
  uHistory;
  hideControls: boolean;
  activityGeo;
  whatsHereToggle: boolean;
  tileCacheMode: boolean;
  draw;
}

export const initDrawModes = (options: InitDrawModesOptions) => {
  const { map, drawSetter, dispatch, uHistory, hideControls, activityGeo, whatsHereToggle, tileCacheMode, draw } =
    options;

  ['draw.selectionchange', 'draw.create', 'draw.update'].map((eName) => {
    map._listeners[eName]?.map((l) => {
      let indexToSplice = -1;
      let refFound = false;

      for (let i = 0; i < attachedListeners.length; i++) {
        if (attachedListeners[i].deref() === l) {
          refFound = true;
          indexToSplice = i;
        }
      }

      if (refFound) {
        // remove from ref list
        attachedListeners.splice(indexToSplice, 1);
        map.off(eName, l);
      }
    });
  });

  const DoNothing: any = {};
  DoNothing.onSetup = function (opts) {
    //  if(map.draw && activityGeo)
    if (activityGeo) {
      this.addFeature(this.newFeature(activityGeo[0]));
    }

    const state: any = {};
    state.count = opts.count || 0;
    return state;
  };
  DoNothing.onClick = function (state, e) {
    this.changeMode('draw_polygon');
  };

  DoNothing.toDisplayFeatures = function (state, geojson, display) {
    geojson.properties.active = MapboxDraw.constants.activeStates.ACTIVE;
    display(geojson);
  };

  DoNothing.on;

  const WhatsHereBoxMode: any = { ...DrawRectangle };

  //Example from docs - keeping as template:
  const LotsOfPointsMode: any = {};

  // When the mode starts this function will be called.
  // The `opts` argument comes from `draw.changeMode('lotsofpoints', {count:7})`.
  // The value returned should be an object and will be passed to all other lifecycle functions
  LotsOfPointsMode.onSetup = function (opts) {
    const state: any = {};
    state.count = opts.count || 0;
    return state;
  };

  // Whenever a user clicks on the map, Draw will call `onClick`
  LotsOfPointsMode.onClick = function (state, e) {
    // `this.newFeature` takes geojson and makes a DrawFeature
    const point = this.newFeature({
      type: 'Feature',
      properties: {
        count: state.count
      },
      geometry: {
        type: 'Point',
        coordinates: [e.lngLat.lng, e.lngLat.lat]
      }
    });
    this.addFeature(point); // puts the point on the map
  };

  // Whenever a user clicks on a key while focused on the map, it will be sent here
  LotsOfPointsMode.onKeyUp = function (state, e) {
    if (e.keyCode === 27) return this.changeMode('simple_select');
  };

  // This is the only required function for a mode.
  // It decides which features currently in Draw's data store will be rendered on the map.
  // All features passed to `display` will be rendered, so you can pass multiple display features per internal feature.
  // See `styling-draw` in `API.md` for advice on making display features
  LotsOfPointsMode.toDisplayFeatures = function (state, geojson, display) {
    display(geojson);
  };

  const mode = (() => {
    if (whatsHereToggle) {
      return 'whats_here_box_mode';
    }
    return 'simple_select';
  })();

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

  // Add the new draw mode to the MapboxDraw object
  const localDraw = new MapboxDraw({
    displayControlsDefault: !hideControls,
    controls: {
      combine_features: false,
      uncombine_features: false
    },
    defaultMode: mode,
    // Adds the LotsOfPointsMode to the built-in set of modes
    modes: modes as { [modeKey: string]: DrawCustomMode }
  });

  const drawCreateListener = customDrawListenerCreate(localDraw, dispatch, uHistory, whatsHereToggle, tileCacheMode);
  const drawSelectionchangeListener = customDrawListenerSelectionChange(localDraw, dispatch);

  map.on('draw.create', drawCreateListener);
  map.on('draw.selectionchange', drawSelectionchangeListener);

  attachedListeners.push(new WeakRef(drawSelectionchangeListener));
  attachedListeners.push(new WeakRef(drawCreateListener));

  if (!map.hasControl(draw)) {
    map.addControl(localDraw, 'top-left');
  }
  if (activityGeo) {
    localDraw.add({ type: 'FeatureCollection', features: activityGeo });
  }
  drawSetter(localDraw);
};
