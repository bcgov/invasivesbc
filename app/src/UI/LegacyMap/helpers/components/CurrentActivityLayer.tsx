import { useContext, useEffect, useState } from 'react';
import { selectOfflineActivity } from 'state/reducers/offlineActivity';
import { MapContext } from 'UI/LegacyMap/helpers/components/MapContext';
import { LAYER_Z_FOREGROUND } from 'UI/LegacyMap/helpers/functional/layer-definitions';
import { useSelector } from 'utils/use_selector';

const CurrentActivityLayer = ({ mapReady }) => {
  const map = useContext(MapContext);
  const [geo, setGeo] = useState(null);
  console.log('MAp ready', mapReady);

  const activityGeometryArray = useSelector((state) => state.ActivityPage.activity?.geometry);
  const { url } = useSelector((state) => state.AppMode);
  console.log('Activty geo', activityGeometryArray);
  const { working, serializedActivities } = useSelector(selectOfflineActivity);
  // react to changes in the geometry or current page and set our rendered geo appropriately
  // render if a) we're on the Activity page and b) There is a geo object in the Activity
  useEffect(() => {
    if (activityGeometryArray && activityGeometryArray[0] && url?.includes('Activity')) {
      setGeo(activityGeometryArray[0]);
    } else {
      setGeo(null);
    }
  }, [activityGeometryArray, url]);

  useEffect(() => {
    if (!map) return;
    if (!mapReady) return;

    // add the layer if needed

    const LAYER_ID = 'current-activity-';

    const SHAPE_LAYER = `${LAYER_ID}-shape`;
    const OUTLINE_LAYER = `${LAYER_ID}-outline`;
    const ZOOM_CIRCLE_LAYER = `${LAYER_ID}-zoomoutcircle`;
    console.log('Inside Current Activity Layer', geo);
    console.log(LAYER_ID, SHAPE_LAYER);

    if (geo) {
      map
        .addSource(LAYER_ID, {
          type: 'geojson',
          data: geo
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
        console.log('CURRENT CLEANING CALLED');

        map.removeLayer(ZOOM_CIRCLE_LAYER);
        map.removeLayer(OUTLINE_LAYER);
        map.removeLayer(SHAPE_LAYER);
        map.removeSource(LAYER_ID);
      };
    }
  }, [geo]);

  return null;
};

export { CurrentActivityLayer };
