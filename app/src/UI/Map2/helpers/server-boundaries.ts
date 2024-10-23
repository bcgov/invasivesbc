import { LAYER_Z_FOREGROUND } from 'UI/Map2/helpers/layer-definitions';

export const addServerBoundariesIfNotExists = (serverBoundaries, map) => {
  if (map && serverBoundaries?.length > 0) {
    serverBoundaries.map((layer) => {
      const layerID = 'serverBoundary' + layer.id;

      if (!map.getSource(layerID)) {
        map
          .addSource(layerID, {
            type: 'geojson',
            data: layer.geojson
          })
          .addLayer(
            {
              id: layerID,
              source: layerID,
              type: 'fill',
              paint: {
                'fill-color': 'blue',
                'fill-outline-color': 'yellow',
                'fill-opacity': 0.5
              },
              minzoom: 0,
              maxzoom: 24
            },
            LAYER_Z_FOREGROUND
          );
      }
    });
  }
};

export const refreshServerBoundariesOnToggle = (serverBoundaries, map) => {
  if (map && serverBoundaries?.length > 0) {
    serverBoundaries.map((layer) => {
      const layerID = 'serverBoundary' + layer.id;

      if (map.getSource(layerID) && map.getLayer(layerID)) {
        const visibility = map.getLayoutProperty(layerID, 'visibility');
        if (visibility !== 'none' && !layer.toggle) {
          map.setLayoutProperty(layerID, 'visibility', 'none');
        }
        if (visibility !== 'visible' && layer.toggle) {
          map.setLayoutProperty(layerID, 'visibility', 'visible');
        }
      }
    });
  }
};
