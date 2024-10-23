import { LAYER_Z_FOREGROUND } from 'UI/Map2/helpers/layer-definitions';
import { toggleLayerOnBool } from 'UI/Map2/helpers/utility-functions';

export const handlePositionTracking = (
  map,
  positionMarker,
  userCoords,
  accuracyCircle,
  accuracyToggle,
  positionTracking,
  panToUser: boolean
) => {
  function animateMarker(timestamp) {
    positionMarker.setLngLat([userCoords.long, userCoords.lat]);
    // Ensure it's added to the map. This is safe to call if it's already added.
    positionMarker.addTo(map);
    // Request the next frame of the animation.
    requestAnimationFrame(animateMarker);
  }

  if (userCoords && positionTracking) {
    if (panToUser) {
      map.jumpTo({ center: [userCoords.long, userCoords.lat] });
    }
    // Start the animation.
    requestAnimationFrame(animateMarker);
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
