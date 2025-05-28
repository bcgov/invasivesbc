import { LAYER_Z_FOREGROUND, LAYER_Z_MID } from 'UI/LegacyMap/helpers/functional/layer-definitions';
import { buildTimeConfig } from 'state/configuration/build-time-config';

export const addWMSLayersIfNotExist = (simplePickerLayers2: any, map, API_BASE) => {
  simplePickerLayers2.map((layer) => {
    if (!map.getSource(layer.url) && layer.toggle && layer.type === 'wms') {
      map
        .addSource(layer.url, {
          type: 'raster',
          tiles: buildTimeConfig.MOBILE
            ? [`${API_BASE}/api/proxy/openmaps?bbox={bbox-epsg-3857}&url=${encodeURIComponent(layer.url)}`]
            : [layer.url],
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
        map.moveLayer(layer.url, LAYER_Z_MID);
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

export const removeWMSLayers = (simplePickerLayers2, map) => {
  simplePickerLayers2.map((layer) => {
    if (map.getLayer(layer.url)) {
      map.removeLayer(layer.url);
      map.removeSource(layer.url);
    }
  });
};
