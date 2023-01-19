import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';
import { useSelector } from '../../../state/utilities/use_selector';
import { selectAuth } from '../../../state/reducers/auth';
import { selectActivities } from 'state/reducers/activities';
import { useMap } from 'react-leaflet';
import center from '@turf/center';

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
import { LeafletCanvasLabel, LeafletCanvasMarker } from './LeafletCanvasLayer';

const IAPPCanvasLayerMemo = (props) => {
  const { accessRoles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);

  const filteredFeatures = () => {
    let returnVal;
    if (mapState?.layers?.[props.layerKey]?.IDList && mapState?.layers?.[props.layerKey].layerState?.mapToggle) {
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
          labelToggle={mapState.layers[props.layerKey].layerState.labelToggle}
          points={filteredFeatures()}
          enabled={mapState.layers[props.layerKey].layerState.mapToggle}
          colour={mapState.layers[props.layerKey].layerState.color}
          zIndex={10000 + mapState.layers[props.layerKey].layerState.drawOrder}
        />
      );
    } else return <></>;
  }, [
    JSON.stringify(mapState?.layers?.[props.layerKey]?.layerState),
    JSON.stringify(mapState?.layers?.[props.layerKey]?.IDList, mapState?.layers?.[props.layerKey].layerState?.mapToggle)
  ]);
};

const IAPPCanvasLabelMemo = (props) => {
  const { accessRoles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);

  //CAP LABEL COUNT HERE
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
        <LeafletCanvasLabel
          layerType={'IAPP'}
          key={'POICanvasLayermemo' + props.layerKey}
          labelToggle={mapState.layers[props.layerKey].layerState.labelToggle}
          points={filteredFeatures()}
          enabled={mapState.layers[props.layerKey].layerState.mapToggle}
          colour={mapState.layers[props.layerKey].layerState.color}
          zIndex={10000 + mapState.layers[props.layerKey].layerState.drawOrder}
        />
      );
    } else return <></>;
  }, [
    JSON.stringify(mapState?.layers?.[props.layerKey]?.layerState),
    JSON.stringify(mapState?.layers?.[props.layerKey]?.IDList)
  ]);
};

const ActivityCanvasLabelMemo = (props) => {
  const { accessRoles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);

  const filteredFeatures = () => {
    let returnVal;
    if (mapState?.layers?.[props.layerKey]?.IDList) {
      returnVal = mapState?.activitiesGeoJSON?.features
        .filter((row) => {
          return mapState?.layers?.[props.layerKey]?.IDList?.includes(row.properties.id);
        })
        .map((row) => {
          return { ...row, geometry: center(row.geometry).geometry };
        });
    } else {
      returnVal = [];
    }
    return { type: 'FeatureCollection', features: returnVal };
  };

  return useMemo(() => {
    if (mapState.layers?.[props.layerKey]?.layerState) {
      return (
        <LeafletCanvasLabel
          layerType={'ACTIVITY'}
          key={'activityCanvasLayermemo' + props.layerKey}
          labelToggle={mapState.layers[props.layerKey].layerState.labelToggle}
          points={filteredFeatures()}
          enabled={mapState.layers[props.layerKey].layerState.mapToggle}
          colour={mapState.layers[props.layerKey].layerState.color}
          zIndex={10000 + mapState.layers[props.layerKey].layerState.drawOrder}
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
          layerKey={props.layerKey}
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
          if(!layerKey)
          {
            return <></>
          }
          return (
            <>
              <ActivityLayerMemo key={'activitiesv2memo' + layerKey} layerKey={layerKey} />;
              <ActivityCanvasLabelMemo key={'activitiesCanvasLayerLabel' + layerKey} layerKey={layerKey} />;
            </>
          );
        })
      ) : (
        <></>
      )}
      {iappLayers()?.length > 0 ? (
        iappLayers()?.map((layerKey) => {
          if(!layerKey)
          {
            return <></>
          }
          return (
            <>
              <IAPPCanvasLayerMemo key={'POICanvasLayer' + layerKey} layerKey={layerKey} />;
              <IAPPCanvasLabelMemo key={'POICanvasLayerLabel' + layerKey} layerKey={layerKey} />;
            </>
          );
        })
      ) : (
        <></>
      )}
    </>
  );
};
