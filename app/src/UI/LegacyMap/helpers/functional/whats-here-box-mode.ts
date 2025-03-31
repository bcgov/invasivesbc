import MapboxDraw, { DrawCustomMode, DrawFeature } from '@mapbox/mapbox-gl-draw';
import { GeoJSON } from 'geojson';

enum DrawState {
  INVALID,
  DRAWING,
  DRAWN
}

interface WhatsHereBoxState {
  rectangle: DrawFeature;
  startPointIndicator: DrawFeature;

  startPoint: [number, number];
  endPoint: [number, number];
  drawing: DrawState;
}

interface WhatsHereBoxOptions {}

function updateRectangle(state: WhatsHereBoxState) {
  state.rectangle.updateCoordinate('0.0', state.startPoint[0], state.startPoint[1]); //minX, minY - the starting point
  state.rectangle.updateCoordinate('0.1', state.endPoint[0], state.startPoint[1]); // maxX, minY
  state.rectangle.updateCoordinate('0.2', state.endPoint[0], state.endPoint[1]); // maxX, maxY
  state.rectangle.updateCoordinate('0.3', state.startPoint[0], state.endPoint[1]); // minX,maxY
  state.rectangle.updateCoordinate('0.4', state.startPoint[0], state.startPoint[1]); //minX,minY - ending point (equals to starting point)
}

const WhatsHereBoxMode: DrawCustomMode<WhatsHereBoxState, WhatsHereBoxOptions> = {
  onSetup: function (_opts: WhatsHereBoxOptions): WhatsHereBoxState {
    const rectangle = this.newFeature({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[]]
      }
    });

    const startPointIndicator = this.newFeature({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: []
      }
    });

    this.addFeature(rectangle);
    this.addFeature(startPointIndicator);

    this.clearSelectedFeatures();
    this.updateUIClasses({ mouse: 'add' });

    this.setActionableState({
      trash: true,
      combineFeatures: false,
      uncombineFeatures: false
    });
    return {
      rectangle,
      startPointIndicator,
      startPoint: [0, 0],
      endPoint: [0, 0],
      drawing: DrawState.INVALID
    };
  },
  onClick: function (state: WhatsHereBoxState, e: MapboxDraw.MapMouseEvent) {
    switch (state.drawing) {
      case DrawState.DRAWING:
        state.endPoint = [e.lngLat.lng, e.lngLat.lat];
        state.drawing = DrawState.DRAWN;
        updateRectangle(state);
        this.changeMode('simple_select', { featuresId: state.rectangle.id });
        break;

      case DrawState.DRAWN:
      case DrawState.INVALID:
      default:
        state.drawing = DrawState.DRAWING;
        state.startPoint = [e.lngLat.lng, e.lngLat.lat];
        state.endPoint = [e.lngLat.lng, e.lngLat.lat];
        state.startPointIndicator.updateCoordinate('0', e.lngLat.lng, e.lngLat.lat);
        updateRectangle(state);
        break;
    }
  },
  onMouseMove: function (state: WhatsHereBoxState, e: MapboxDraw.MapMouseEvent) {
    if (state.drawing == DrawState.DRAWING) {
      state.endPoint[0] = e.lngLat.lng;
      state.endPoint[1] = e.lngLat.lat;
      updateRectangle(state);
    }
  },
  onKeyUp: function (_state: WhatsHereBoxState, e: KeyboardEvent) {
    if (e.keyCode === 27) {
      this.changeMode('simple_select');
    }
  },
  onTap: function (state: WhatsHereBoxState, e: MapboxDraw.MapTouchEvent) {
    switch (state.drawing) {
      case DrawState.DRAWING:
        state.endPoint = [e.lngLat.lng, e.lngLat.lat];
        state.drawing = DrawState.DRAWN;
        updateRectangle(state);
        this.changeMode('simple_select', { featuresId: state.rectangle.id });
        break;
      case DrawState.DRAWN:
      case DrawState.INVALID:
      default:
        state.drawing = DrawState.DRAWING;
        state.startPointIndicator.updateCoordinate('0', e.lngLat.lng, e.lngLat.lat);
        state.startPoint = [e.lngLat.lng, e.lngLat.lat];
        state.endPoint = [e.lngLat.lng, e.lngLat.lat];
        updateRectangle(state);
        break;
    }
  },

  onStop: function (state) {
    this.updateUIClasses({ mouse: 'none' });
    this.activateUIButton();

    if (this.getFeature('' + state.rectangle.id) === undefined) return;
    if (state.rectangle.isValid()) {
      this.map.fire('draw.create', {
        features: [state.rectangle.toGeoJSON()]
      });
    } else {
      this.deleteFeature('' + state.rectangle.id, { silent: true });
      this.changeMode('simple_select', {}, { silent: true });
    }
  },

  onTrash: function (state: WhatsHereBoxState) {
    this.deleteFeature('' + state.rectangle.id, { silent: true });
    this.changeMode('simple_select');
  },

  toDisplayFeatures: (state: WhatsHereBoxState, geojson: GeoJSON, display: (geojson: GeoJSON) => void) => {
    if (state.drawing == DrawState.INVALID) {
      return;
    }

    if (geojson.type == 'Feature' && geojson.properties !== null) {
      const isActivePolygon = geojson.properties.id === state.rectangle.id;
      geojson.properties.active = isActivePolygon ? 'true' : 'false';
      return display(geojson);
    }
  }
};

export { WhatsHereBoxMode };
