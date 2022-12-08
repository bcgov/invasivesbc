import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';
import { useSelector } from '../../../state/utilities/use_selector';
import { selectAuth } from '../../../state/reducers/auth';
import { selectActivities } from 'state/reducers/activities';
import { useMap } from 'react-leaflet';

import L from 'leaflet';

//const  glify } = require('react-leaflet-glify');
//import glify from 'react-leaflet-glify';
import { glify } from 'react-leaflet-glify';
//import 'leaflet-canvas-marker';
import 'leaflet-markers-canvas';
import { cleanup } from '@testing-library/react';
import { useLeafletContext } from '@react-leaflet/core';
import { selectMap } from 'state/reducers/map';
import { AnyKindOfDictionary } from 'lodash';

export const LeafletCanvasMarker = (props) => {
  const map = useMap();

  const context = useLeafletContext();

  const [markersCanvas, setMarkersCanvas] = useState();
  const [markers, setMarkers] = useState([]);
  const [cleanupCallback, setCleanupCallback] = useState();
  const layerRef = useRef();
  const groupRef = useRef();

  useEffect(() => {
    if (!map) return;
    try {
      //console.dir(markersCanvas);
      //const clear = (markersCanvas as any)?.clear();
      //const remove = (markersCanvas as any)?.removeMarkers();
      //map.removeLayer(markersCanvas);
    } catch (e) {}
    const container = context.layerContainer || context.map;

    layerRef.current = new (L as any).MarkersCanvas();

    groupRef.current = (L as any).layerGroup().addLayer(layerRef.current).addTo(container);
    groupRef?.current?.setZIndex(props.zIndex);

    //    container.addLayer(layerRef.current);

    //const mcLayer = mc.addTo(map);

    // if (markers?.length > 0) mcLayer.removeMarkers(markers);

    //'canvas-marker' way:
    //var ciLayer = (L as any).canvasIconLayer({}).addTo(map);

    /*
    ciLayer.addOnClickListener(function (e, data) {
      console.log(data);
    });
    ciLayer.addOnHoverListener(function (e, data) {
      console.log(data[0].data._leaflet_id);
    });
    */

    /*
    var icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [12, 10],
      iconAnchor: [10, 9]
    });
    */

    let colour = '';
    switch (props.colour) {
      case '#2A81CB':
        colour = 'blue';
        break;
      case '#FFD326':
        colour = 'gold';
        break;
      case '#CB2B3E':
        colour = 'red';
        break;
      case '#2AAD27':
        colour = 'green';
        break;
      case '#CB8427':
        colour = 'orange';
        break;
      case '#CAC428':
        colour = 'yellow';
        break;
      case '#9C2BCB':
        colour = 'violet';
        break;
      case '#7B7B7B':
        colour = 'grey';
        break;
      case '#3D3D3D':
        colour = 'black';
        break;
      default:
        colour = 'blue';
    }
    var icon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + colour + '.png',
      iconSize: [12, 10],
      iconAnchor: [10, 9]
    });

    var markers = [];
    props.points?.features?.map((point) => {
      if (!(point?.geometry?.coordinates?.length > 0)) {
        return;
      }
      var marker = L.marker([point.geometry.coordinates[1], point.geometry.coordinates[0]], {
        icon: icon
      }); //?.bindPopup('I Am ' + point.properties);
      markers.push(marker);
    });
    /*    if (markers.length > 0) ciLayer.addLayers(markers);
    return () => {
      map.removeLayer(ciLayer);
    };
    */
    if (groupRef.current) layerRef?.current?.clear();

    if (props.enabled && groupRef.current) {
      layerRef?.current?.addMarkers(markers);
    }

    /*const acleanupCallback = () => mc.removeMarkers(markers);
    setCleanupCallback(acleanupCallback);
    */

    layerRef?.current?.redraw();
    //setMarkersCanvas(mcLayer);
    /*
    setTimeout(() => {
      layerRef?.current?.redraw();
    }, 5000);
    */

    return () => {
      try {
        if (container && map) {
          layerRef?.current?.removeMarkers(markers);
          container?.removeLayer(layerRef.current);
          container?.removeLayer(groupRef.current);
        }
        //acleanupCallback();
        //(markersCanvas as any)?.removeMarkers();
        // (markersCanvas as any)?.clear();
      } catch (e) {}
    };
    //}, [map]);
  }, [props.colour, props.enabled, props.points, props.zIndex]);

  return <></>;
};

const IAPPCanvasLayerMemo = (props) => {
  const { accessRoles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);

  const filteredFeatures = () => {
    let returnVal;
    if (mapState?.layers?.[props.layerKey]?.IDList) {
      returnVal = mapState?.IAPPGeoJSON?.features.filter((row) => {
        return mapState?.layers?.[props.layerKey]?.IDList?.includes(row.properties.site_id);
      });
    } else {
      returnVal = [];
    }
    return { type: 'FeatureCollection', features: returnVal };
  };

  return useMemo(() => {
    if (mapState.layers?.[props.layerKey]?.layerState) {
      return (
        <LeafletCanvasMarker
          key={'POICanvasLayermemo' + props.layerKey}
          points={filteredFeatures()}
          enabled={mapState.layers[props.layerKey].layerState.mapToggle}
          colour={mapState.layers[props.layerKey].layerState.color}
          zIndex={mapState.layers[props.layerKey].layerState.drawOrder + 10000}
        />
      );
    } else return <></>;
  }, [
    JSON.stringify(mapState?.layers?.[props.layerKey]?.layerState),
    JSON.stringify(mapState?.layers?.[props.layerKey]?.IDList)
  ]);
};
const ActivityLayerMemo = (props) => {
  const { accessRoles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);

  const filteredFeatures = () => {
    let returnVal;
    if (mapState?.layers?.[props.layerKey]?.IDList) {
      returnVal = mapState?.activitiesGeoJSON?.features.filter((row) => {
        return mapState?.layers?.[props.layerKey]?.IDList?.includes(row.properties.id);
      });
    } else {
      returnVal = [];
    }
    return { type: 'FeatureCollection', features: returnVal };
  };

  return useMemo(() => {
    if (mapState.layers?.[props.layerKey]?.layerState) {
      return (
        <ActivitiesLayerV2
          key={'activitiesv2filter' + props.layerKey}
          activities={filteredFeatures()}
          enabled={mapState.layers[props.layerKey].layerState.mapToggle}
          color={mapState.layers[props.layerKey].layerState.color}
          zIndex={mapState.layers[props.layerKey].layerState.drawOrder + 10000}
          opacity={0.8}
        />
      );
    } else return <></>;
  }, [
    JSON.stringify(mapState?.layers?.[props.layerKey]?.layerState),
    JSON.stringify(mapState?.layers?.[props.layerKey]?.IDList)
  ]);
};
export const RecordSetLayersRenderer = (props: any) => {
  const { accessRoles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);

  interface ILayerToRender {
    filter: IActivitySearchCriteria;
    color: any;
    setName: string;
  }

  const GLLayerPoints = (props) => {
    const map = useMap();

    useEffect(() => {
      if (map && props.points) {
        //        (L as any).glify = glify;

        (L as any).glify.points({
          map,
          data: props.points,
          size: 10,

          click: (e, pointOrGeoJsonFeature, xy): boolean | void => {
            // do something when a point is clicked
            // return false to continue traversing
          },
          hover: (e, pointOrGeoJsonFeature, xy): boolean | void => {
            // do something when a point is hovered
          }
        });
      }
    }, []);
    return <></>;
  };

  const iappLayers = useCallback(() => {
    const keys = Object.keys(mapState?.layers ? mapState.layers : {});
    const filtered = keys?.filter((key) => mapState?.layers[key]?.type === 'POI');
    const sorted = filtered.sort((a, b) => {
      if (mapState.layers[a].layerState.drawOrder > mapState.layers[b].layerState.drawOrder) return 1; // if the first value is greater than the second
      if (mapState.layers[a].layerState.drawOrder === mapState.layers[b].layerState.drawOrder) return 0; // if values are equal
      if (mapState.layers[a].layerState.drawOrder < mapState.layers[b].layerState.drawOrder) return -1; // if the first value is less than the second);
    });
    return sorted;
  }, [
    JSON.stringify(
      Object.keys(mapState?.layers ? mapState.layers : {}).map((l) => {
        return { id: l, order: mapState?.layers?.[l]?.layerState?.drawOrder };
      })
    )
  ]);

  const activityLayers = useCallback(() => {
    const keys = Object.keys(mapState?.layers ? mapState.layers : {});
    const filtered = keys?.filter((key) => mapState?.layers[key]?.type === 'Activity');
    const sorted = filtered.sort((a, b) => {
      if (mapState.layers[a].layerState.drawOrder > mapState.layers[b].layerState.drawOrder) return 1; // if the first value is greater than the second
      if (mapState.layers[a].layerState.drawOrder === mapState.layers[b].layerState.drawOrder) return 0; // if values are equal
      if (mapState.layers[a].layerState.drawOrder < mapState.layers[b].layerState.drawOrder) return -1; // if the first value is less than the second);
    });
    return sorted;
  }, [JSON.stringify(Object.keys(mapState?.layers ? mapState.layers : {}))]);

  return (
    <>
      {activityLayers()?.length > 0 ? (
        activityLayers()?.map((layerKey) => {
          return <ActivityLayerMemo key={'activitiesv2memo' + layerKey} layerKey={layerKey} />;
        })
      ) : (
        <></>
      )}
      {iappLayers()?.length > 0 ? (
        iappLayers()?.map((layerKey) => {
          return <IAPPCanvasLayerMemo key={'POICanvasLayer' + layerKey} layerKey={layerKey} />;
        })
      ) : (
        <></>
      )}
    </>
  );
};
