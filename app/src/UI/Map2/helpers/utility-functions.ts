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
