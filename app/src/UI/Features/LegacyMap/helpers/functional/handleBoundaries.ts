import { LAYER_Z_FOREGROUND } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import { InvasivesMap } from 'UI/Features/LegacyMap/InvasivesMap';

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
const refreshBoundary = (id: string, layer, map: InvasivesMap) => {
  ['-fill', '-line', '-circle'].forEach((suffix) => {
    const styledLayerId = id + suffix;
    if (map.getSource(id) && map.getLayer(styledLayerId)) {
      const visibility = map.getLayoutProperty(styledLayerId, 'visibility');
      if (visibility !== 'none' && !layer?.toggle) {
        map.setLayoutProperty(styledLayerId, 'visibility', 'none');
      }
      if (visibility !== 'visible' && layer?.toggle) {
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

const refreshClientBoundariesOnToggle = (clientBoundaries, map: InvasivesMap) => {
  if (!map) return;
  clientBoundaries.forEach((layer) => {
    const layerID = getClientLayerID(layer.id);
    refreshBoundary(layerID, layer, map);
  });
  // Check for Stray IDs
  const ID_PREFIX = getClientLayerID('');
  const currentLayerIds = clientBoundaries.map(({ id }) => getClientLayerID(id));
  map
    .getLayersOrder()
    .filter(
      (liveLayerId) =>
        liveLayerId.startsWith(ID_PREFIX) &&
        !currentLayerIds.some((clientBoundaryId) => liveLayerId.includes(clientBoundaryId))
    )
    .forEach((orphanedClientBoundaries) => {
      if (map.getLayer(orphanedClientBoundaries)) map.removeLayer(orphanedClientBoundaries);
      if (map.getSource(orphanedClientBoundaries)) map.removeSource(orphanedClientBoundaries);
    });
};

const removeClientBoundaries = (clientBoundaries, map: InvasivesMap) => {
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
