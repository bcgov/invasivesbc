import { LAYER_Z_FOREGROUND } from 'UI/Map2/helpers/layer-definitions';

export const refreshWhatsHereFeature = (map, options: any) => {
  const layerID = 'WhatsHereFeatureLayer';
  try {
    if (map && map.getLayer(layerID + 'shape')) {
      map.removeLayer(layerID + 'shape');
    }
    if (map && map.getLayer(layerID + 'outline')) {
      map.removeLayer(layerID + 'outline');
    }
    if (map && map.getSource(layerID)) {
      map.removeSource(layerID);
    }
  } catch (e) {
    console.error(e);
  }

  if (map && options?.whatsHereFeature?.geometry) {
    map
      .addSource(layerID, {
        type: 'geojson',
        data: options.whatsHereFeature.geometry
      })
      .addLayer(
        {
          id: layerID + 'shape',
          source: layerID,
          type: 'fill',
          paint: {
            'fill-color': 'white',
            'fill-outline-color': 'black',
            'fill-opacity': 0.4
          },
          minzoom: 0,
          maxzoom: 24
        },
        LAYER_Z_FOREGROUND
      )
      .addLayer(
        {
          id: layerID + 'outline',
          source: layerID,
          type: 'line',
          paint: {
            'line-color': 'black',
            'line-opacity': 1,
            'line-width': 3
          },
          minzoom: 0,
          maxzoom: 24
        },
        LAYER_Z_FOREGROUND
      );
  }
};
