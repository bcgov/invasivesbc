import centroid from '@turf/centroid';
import { LAYER_Z_FOREGROUND } from 'UI/Map2/helpers/layer-definitions';

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
  const layerID = 'highlightRecordLayer';
  if (map && map.getLayer(layerID + 'shape')) {
    map.removeLayer(layerID + 'shape');
  }
  if (map && map.getLayer(layerID + 'outline')) {
    map.removeLayer(layerID + 'outline');
  }
  if (map && map.getLayer(layerID + 'zoomoutcircle')) {
    map.removeLayer(layerID + 'zoomoutcircle');
  }

  if (map && map.getLayer(layerID)) {
    map.removeLayer(layerID);
  }

  if (map && map.getSource(layerID)) {
    map.removeSource(layerID);
  }

  if (
    map &&
    options.userRecordOnHoverRecordType === 'Activity' &&
    options.userRecordOnHoverRecordRow &&
    options.userRecordOnHoverRecordRow?.geometry?.[0]
  ) {
    map
      .addSource(layerID, {
        type: 'geojson',
        data: options.userRecordOnHoverRecordRow.geometry[0]
      })
      .addLayer(
        {
          id: layerID + 'shape',
          source: layerID,
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
      )
      .addLayer(
        {
          id: layerID + 'zoomoutcircle',
          source: layerID,
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

  if (map && options.userRecordOnHoverRecordType === 'IAPP' && options.userRecordOnHoverRecordRow) {
    map
      .addSource(layerID, {
        type: 'geojson',
        data: options.userRecordOnHoverRecordRow.geometry
      })
      .addLayer(
        {
          id: layerID,
          source: layerID,
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
