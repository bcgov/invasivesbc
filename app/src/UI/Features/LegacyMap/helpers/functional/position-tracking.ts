import { LAYER_Z_FOREGROUND } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions';
import { toggleLayerOnBool } from 'UI/Features/LegacyMap/helpers/functional/utility-functions';

export const handlePositionTracking = (
  map,
  positionMarker,
  userCoords,
  accuracyCircle,
  accuracyToggle,
  positionTracking,
  panToUser: boolean
) => {
  if (userCoords && positionTracking) {
    if (panToUser) {
      map.jumpTo({ center: [userCoords.long, userCoords.lat] });
    }
    positionMarker.setLngLat([userCoords.long, userCoords.lat]);
    positionMarker.addTo(map);
    const currAccuracyCircle = map.getSource('accuracyCircle');
    if (!currAccuracyCircle && accuracyCircle) {
      map
        .addSource('accuracyCircle', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [accuracyCircle]
          }
        })
        .addLayer(
          {
            id: 'accuracyCircle',
            source: 'accuracyCircle',
            type: 'fill',
            paint: {
              'fill-color': '#00b0ff',
              'fill-opacity': 0.15
            },
            layout: {
              visibility: accuracyToggle ? 'visible' : 'none'
            }
          },
          LAYER_Z_FOREGROUND
        );
    } else if (accuracyCircle) {
      currAccuracyCircle.setData(accuracyCircle);
    }
  }
  toggleLayerOnBool(map, 'accuracyCircle', accuracyToggle && positionTracking);
};
