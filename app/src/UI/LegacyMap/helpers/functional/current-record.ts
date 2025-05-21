import centroid from '@turf/centroid';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { LAYER_Z_FOREGROUND } from 'UI/LegacyMap/helpers/functional/layer-definitions';

export const refreshCurrentRecMakers = (map, options: any) => {
  if (options.IAPPMarker && options.currentIAPPGeo?.geometry && options.currentIAPPID) {
    options.IAPPMarker.setLngLat(options.currentIAPPGeo.geometry.coordinates);
    options.IAPPMarker.addTo(map);
  }
  if (options.activityMarker && options.activityGeo?.[0]?.geometry && options.currentActivityShortID) {
    options.activityMarker.setLngLat(centroid(options.activityGeo[0]).geometry.coordinates);
    options.activityMarker.addTo(map);
  }

  if (
    options.whatsHereMarker &&
    (options.userRecordOnHoverRecordRow?.geometry?.[0] || options.userRecordOnHoverRecordRow?.geometry)
  ) {
    options.whatsHereMarker.setLngLat(
      centroid(options.userRecordOnHoverRecordRow?.geometry?.[0] || options.userRecordOnHoverRecordRow?.geometry)
        .geometry?.coordinates
    );
    options.whatsHereMarker.addTo(map);
  }
};

export const refreshHighlightedRecord = (map, options: any) => {
  const LAYER_ID = 'highlightRecordLayer';

  const SHAPE_LAYER = `${LAYER_ID}-shape`;
  const OUTLINE_LAYER = `${LAYER_ID}-outline`;
  const ZOOM_CIRCLE_LAYER = `${LAYER_ID}-zoomoutcircle`;

  if (!map) {
    return;
  }

  if (map.getLayer(SHAPE_LAYER)) {
    map.removeLayer(SHAPE_LAYER);
  }
  if (map.getLayer(OUTLINE_LAYER)) {
    map.removeLayer(OUTLINE_LAYER);
  }
  if (map.getLayer(ZOOM_CIRCLE_LAYER)) {
    map.removeLayer(ZOOM_CIRCLE_LAYER);
  }

  if (map.getLayer(LAYER_ID)) {
    map.removeLayer(LAYER_ID);
  }

  if (map.getSource(LAYER_ID)) {
    map.removeSource(LAYER_ID);
  }

  if (
    options.userRecordOnHoverRecordType === RecordSetType.Activity &&
    options.userRecordOnHoverRecordRow &&
    options.userRecordOnHoverRecordRow?.geometry?.[0]
  ) {
    map
      .addSource(LAYER_ID, {
        type: 'geojson',
        data: options.userRecordOnHoverRecordRow.geometry[0]
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
  }

  if (options.userRecordOnHoverRecordType === RecordSetType.IAPP && options.userRecordOnHoverRecordRow) {
    map
      .addSource(LAYER_ID, {
        type: 'geojson',
        data: options.userRecordOnHoverRecordRow.geometry
      })
      .addLayer(
        {
          id: LAYER_ID,
          source: LAYER_ID,
          type: 'circle',
          paint: {
            'circle-color': 'yellow',
            'circle-radius': 3
          },
          minzoom: 0,
          maxzoom: 24
        },
        LAYER_Z_FOREGROUND
      );
  }
};
