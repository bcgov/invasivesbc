import maplibregl from 'maplibre-gl';

export const toggleLayerOnBool = (map, layer, boolToggle) => {
  if (!map) return;

  if (!map.getLayer(layer)) return;

  const visibility = map.getLayoutProperty(layer, 'visibility');

  if (visibility !== 'visible' && boolToggle) {
    map.setLayoutProperty(layer, 'visibility', 'visible');
  }
  if (visibility !== 'none' && !boolToggle) {
    map.setLayoutProperty(layer, 'visibility', 'none');
  }
};

export function safelySetPaintProperty(map: maplibregl.Map, mapLayer: string, propertyName: string, value: string) {
  if (map.getPaintProperty(mapLayer, propertyName)) {
    try {
      map.setPaintProperty(mapLayer, propertyName, value);
    } catch (e) {
      console.error(e);
    }
  } else {
    console.error(`map layer ${mapLayer} does not have paint property ${propertyName}`);
  }
}
