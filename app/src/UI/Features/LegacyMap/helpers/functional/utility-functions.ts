import * as maplibregl from 'maplibre-gl/dist/maplibre-gl-dev';

export const toggleLayerOnBool = (map: maplibregl.Map, layer: string, boolToggle: boolean) => {
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
  try {
    if (map.getPaintProperty(mapLayer, propertyName)) {
      map.setPaintProperty(mapLayer, propertyName, value);
    }
  } catch (e) {
    console.error(e);
  }
}
