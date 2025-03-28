import MapboxDraw, { DrawCustomMode } from '@mapbox/mapbox-gl-draw';

const DoNothing: Partial<DrawCustomMode> = {};
DoNothing.onSetup = function (opts) {
  const state = {
    count: opts.count ?? 0
  };

  return state;
};
DoNothing.onClick = function () {
  this.changeMode('draw_polygon');
};

DoNothing.toDisplayFeatures = function (state, geojson, display) {
  if (Object.hasOwn(geojson, 'properties')) {
    geojson.properties.active = MapboxDraw.constants.activeStates.ACTIVE;
  }

  display(geojson);
};

//Example from docs - keeping as template:
const LotsOfPointsMode: Partial<DrawCustomMode> = {};

// When the mode starts this function will be called.
// The `opts` argument comes from `draw.changeMode('lotsofpoints', {count:7})`.
// The value returned should be an object and will be passed to all other lifecycle functions
LotsOfPointsMode.onSetup = function (opts) {
  const state = {
    count: opts.count ?? 0
  };
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

LotsOfPointsMode.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);
};

export { LotsOfPointsMode, DoNothing };
