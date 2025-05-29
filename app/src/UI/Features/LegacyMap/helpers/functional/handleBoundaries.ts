import { LAYER_Z_FOREGROUND } from './layer-definitions';

/**
 * @desc Add Layer to the Map
 */
const addBoundary = (id: string, layer, map: maplibregl.Map, layerColour = '#65DFEA') => {
  map.addSource(id, {
    type: 'geojson',
    data: layer.geojson
  });
  map.addLayer(
    {
      id: id + '-fill',
      type: 'fill',
      source: id,
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': layerColour,
        'fill-opacity': 0.4
      }
    },
    LAYER_Z_FOREGROUND
  );
  // LineString / MultiLineString
  map.addLayer(
    {
      id: id + '-line',
      type: 'line',
      source: id,
      filter: ['==', '$type', 'LineString'],
      paint: {
        'line-color': layerColour,
        'line-width': 2,
        'line-opacity': 0.9
      }
    },
    LAYER_Z_FOREGROUND
  );

  // Point / MultiPoint
  map.addLayer({
    id: id + '-circle',
    type: 'circle',
    source: id,
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-radius': 3,
      'circle-color': layerColour,
      'circle-opacity': 0.7,
      'circle-stroke-color': 'black',
      'circle-stroke-width': 1
    }
  });
};

/**
 * @desc Refresh a Boundary based on its toggle parameters
 */
const refreshBoundary = (id: string, layer, map: maplibregl.Map) => {
  ['-fill', '-line', '-circle'].forEach((suffix) => {
    const styledLayerId = id + suffix;
    if (map.getSource(id) && map.getLayer(styledLayerId)) {
      const visibility = map.getLayoutProperty(styledLayerId, 'visibility');
      if (visibility !== 'none' && !layer.toggle) {
        map.setLayoutProperty(styledLayerId, 'visibility', 'none');
      }
      if (visibility !== 'visible' && layer.toggle) {
        map.setLayoutProperty(styledLayerId, 'visibility', 'visible');
      }
    }
  });
};

// Ensure consistency in IDs between functions
const getServerLayerID = (id: string) => `serverBoundary${id}`;
const getClientLayerID = (id: string) => `clientBoundary${id}`;

const addServerBoundariesIfNotExists = (serverBoundaries, map: maplibregl.Map) => {
  if (map && serverBoundaries?.length > 0) {
    serverBoundaries.map((layer) => {
      const layerID = getServerLayerID(layer.id);
      if (!map.getSource(layerID)) {
        addBoundary(layerID, layer, map);
      }
    }, LAYER_Z_FOREGROUND);
  }
};

const refreshServerBoundariesOnToggle = (serverBoundaries, map: maplibregl.Map) => {
  if (map && serverBoundaries?.length > 0) {
    serverBoundaries.map((layer) => {
      const layerID = getServerLayerID(layer.id);
      refreshBoundary(layerID, layer, map);
    });
  }
};

const addClientBoundariesIfNotExists = (clientBoundaries, map: maplibregl.Map) => {
  if (map && clientBoundaries?.length > 0) {
    clientBoundaries.map((layer) => {
      const layerID = getClientLayerID(layer.id);

      if (!map.getSource(layerID)) {
        addBoundary(layerID, layer, map);
      }
    }, LAYER_Z_FOREGROUND);
  }
};

const refreshClientBoundariesOnToggle = (clientBoundaries, map) => {
  if (map && clientBoundaries?.length > 0) {
    clientBoundaries.map((layer) => {
      const layerID = getClientLayerID(layer.id);
      refreshBoundary(layerID, layer, map);
    });
  }
};

const removeClientBoundaries = (clientBoundaries, map) => {
  clientBoundaries.map((layer) => {
    const layerID = getClientLayerID(layer.id);
    if (map.getSource(layerID) && map.getLayer(layerID)) {
      map.removeLayer(layerID);
      map.removeSource(layerID);
    }
  });
};

export {
  removeClientBoundaries,
  refreshClientBoundariesOnToggle,
  refreshServerBoundariesOnToggle,
  addClientBoundariesIfNotExists,
  addServerBoundariesIfNotExists
};
