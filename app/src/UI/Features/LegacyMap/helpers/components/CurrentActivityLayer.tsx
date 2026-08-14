import { useContext, useEffect } from 'react';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { LAYER_Z_FOREGROUND } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import { useSelector } from 'utils/use_selector';

const CurrentActivityLayer = ({ mapReady }) => {
  const map = useContext(MapContext);
  const url = useSelector((state) => state.AppMode.url);

  // TODO: Remove LegacyForm Check
  const activeGeometry = useSelector((state) => {
    if (!url) return null;
    if (new RegExp(/\/Activity/).test(url)) {
      return state.ActivityPage?.formState?.shape;
    } else if (new RegExp(/\/LegacyForm/).test(url)) {
      return state.ActivityPage.activity?.geometry?.[0];
    }
    return null;
  });

  useEffect(() => {
    if (!map) return;
    if (!mapReady) return;

    // add the layer if needed

    const LAYER_ID = 'current-activity-';

    const SHAPE_LAYER = `${LAYER_ID}-shape`;
    const OUTLINE_LAYER = `${LAYER_ID}-outline`;
    const ZOOM_CIRCLE_LAYER = `${LAYER_ID}-zoomoutcircle`;

    if (activeGeometry) {
      map
        .addSource(LAYER_ID, {
          type: 'geojson',
          data: activeGeometry
        })
        .addLayer(
          {
            id: SHAPE_LAYER,
            source: LAYER_ID,
            type: 'fill',
            paint: {
              'fill-color': 'white',
              'fill-outline-color': 'black',
              'fill-opacity': 0.7
            },
            minzoom: 0,
            maxzoom: 24
          },
          LAYER_Z_FOREGROUND
        )
        .addLayer(
          {
            id: OUTLINE_LAYER,
            source: LAYER_ID,
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
        )
        .addLayer(
          {
            id: ZOOM_CIRCLE_LAYER,
            source: LAYER_ID,
            type: 'circle',
            paint: {
              'circle-color': 'white',
              'circle-radius': 3
            },
            minzoom: 0,
            maxzoom: 24
          },
          LAYER_Z_FOREGROUND
        );

      return () => {
        // cleanup effect -- remove created entries in reverse
        map.removeLayer(ZOOM_CIRCLE_LAYER);
        map.removeLayer(OUTLINE_LAYER);
        map.removeLayer(SHAPE_LAYER);
        map.removeSource(LAYER_ID);
      };
    }
  }, [map, mapReady, activeGeometry]);

  return null;
};

export { CurrentActivityLayer };
