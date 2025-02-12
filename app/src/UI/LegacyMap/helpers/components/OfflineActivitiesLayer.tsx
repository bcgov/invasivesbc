import { FeatureCollection } from 'geojson';
import { useContext, useEffect } from 'react';
import { selectNetworkConnected } from 'state/reducers/network';
import { OfflineActivityRecord, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { MapContext } from 'UI/LegacyMap/helpers/components/MapContext';
import { LAYER_Z_FOREGROUND } from 'UI/LegacyMap/helpers/functional/layer-definitions';
import { useSelector } from 'utils/use_selector';

const OfflineActivitiesMapLayer = ({ mapReady }) => {
  const map = useContext(MapContext);

  const { serializedActivities, offlineActivitiesVisibility } = useSelector(selectOfflineActivity);
  const connected = useSelector(selectNetworkConnected);

  const geometryList = Object.values(serializedActivities)
    .map((item) => {
      const parsedData = JSON.parse((item as OfflineActivityRecord).data);
      return parsedData.geometry ? parsedData.geometry[0] : null;
    })
    .filter((geometry) => geometry !== null);

  let geojsonData: FeatureCollection = {
    type: 'FeatureCollection',
    features: geometryList || []
  };

  useEffect(() => {
    if (!map || !mapReady || connected || !offlineActivitiesVisibility) return;

    // add the layer if needed

    const LAYER_ID = 'current-activity-';

    const SHAPE_LAYER = `${LAYER_ID}-shape`;
    const OUTLINE_LAYER = `${LAYER_ID}-outline`;
    const ZOOM_CIRCLE_LAYER = `${LAYER_ID}-zoomoutcircle`;
    console.log(LAYER_ID, SHAPE_LAYER);

    if (geojsonData.features) {
      map
        .addSource(LAYER_ID, {
          type: 'geojson',
          data: geojsonData
        })
        .addLayer(
          {
            id: SHAPE_LAYER,
            source: LAYER_ID,
            type: 'fill',
            paint: {
              'fill-color': 'blue',
              'fill-outline-color': 'blue',
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
              'line-color': 'blue',
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
              'circle-color': 'blue',
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
  }, [geometryList]);

  return null;
};

export { OfflineActivitiesMapLayer };
