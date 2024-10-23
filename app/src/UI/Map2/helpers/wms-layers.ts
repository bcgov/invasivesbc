import { LAYER_Z_FOREGROUND, LAYER_Z_MID } from 'UI/Map2/helpers/layer-definitions';

export const addWMSLayersIfNotExist = (simplePickerLayers2: any, map) => {
  simplePickerLayers2.map((layer) => {
    if (!map.getSource(layer.url) && layer.toggle && layer.type === 'wms') {
      map
        .addSource(layer.url, {
          type: 'raster',
          tiles: [layer.url],
          tileSize: 256,
          maxzoom: 18
        })
        .addLayer(
          {
            id: layer.url,
            type: 'raster',
            source: layer.url,
            minzoom: 0,
            paint: {
              'raster-opacity': layer.opacity ? layer.opacity : 1
            }
          },
          LAYER_Z_MID
        );
    }
    if (layer.toggle) {
      // bring to top
      map.moveLayer(layer.url, LAYER_Z_FOREGROUND);
    }
  });
};

export const refreshWMSOnToggle = (simplePickerLayers2, map) => {
  simplePickerLayers2.map((layer) => {
    if (map.getLayer(layer.url)) {
      const visibility = map.getLayoutProperty(layer.url, 'visibility');
      if (visibility !== 'none' && !layer.toggle) {
        map.setLayoutProperty(layer.url, 'visibility', 'none');
      }
      if (visibility !== 'visible' && layer.toggle) {
        map.setLayoutProperty(layer.url, 'visibility', 'visible');
        if (layer.toggle) {
          // bring to top
          map.moveLayer(layer.url, LAYER_Z_FOREGROUND);
        }
      }
    }
  });
};
