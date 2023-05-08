import {getSearchCriteriaFromFilters} from 'components/activities-list/Tables/Plant/ActivityGrid';
import {IActivitySearchCriteria} from 'interfaces/useInvasivesApi-interfaces';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {ActivitiesLayerV2} from './ActivitiesLayerV2';
import {useSelector} from '../../../state/utilities/use_selector';
import {selectAuth} from '../../../state/reducers/auth';
import {useMap} from 'react-leaflet';
import center from '@turf/center';

import L from 'leaflet';

//const  glify } = require('react-leaflet-glify');
//import glify from 'react-leaflet-glify';
import {glify} from 'react-leaflet-glify';
//import 'leaflet-canvas-marker';
import 'leaflet-markers-canvas';
import {cleanup} from '@testing-library/react';
import {useLeafletContext} from '@react-leaflet/core';
import {selectMap} from 'state/reducers/map';
import {AnyKindOfDictionary} from 'lodash';
import {LeafletCanvasLabel, LeafletCanvasMarker} from './LeafletCanvasLayer';
import { pointsWithinPolygon } from '@turf/turf';
import { GeneralDialog } from 'components/dialog/GeneralDialog';
import { useDispatch } from 'react-redux';
import { SET_TOO_MANY_LABELS_DIALOG } from 'state/actions';

const IAPPCanvasLayerMemo = (props) => {
  const mapState = useSelector(selectMap);

  const filteredFeatures = () => {
    let returnVal;
    if (mapState?.layers?.[props.layerKey]?.IDList && mapState?.layers?.[props.layerKey].layerState?.mapToggle && mapState?.IAPPBoundsPolygon) {
      returnVal = mapState?.IAPPGeoJSON?.features.filter((row) => {
        return mapState?.layers?.[props.layerKey]?.IDList?.includes(row.properties.site_id);
      });
    } else {
      returnVal = [];
    }
    const points = {type: 'FeatureCollection', features: returnVal};
    return pointsWithinPolygon(points as any, mapState?.IAPPBoundsPolygon);
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
    JSON.stringify(mapState?.layers?.[props.layerKey]?.IDList, mapState?.layers?.[props.layerKey].layerState?.mapToggle),
    JSON.stringify(mapState?.IAPPBoundsPolygon)
  ]);
};

const IAPPCanvasLabelMemo = (props) => {
  const mapState = useSelector(selectMap);
  const dispatch = useDispatch();

  //CAP LABEL COUNT HERE
  const filteredFeatures = () => {
    let returnVal;
    if (mapState?.labelBoundsPolygon && mapState?.layers?.[props.layerKey]?.IDList && mapState?.IAPPBoundsPolygon) {
      returnVal = mapState?.IAPPGeoJSON?.features.filter((row) => {
        return mapState?.layers?.[props.layerKey]?.IDList?.includes(row.properties.site_id);
      });
    } else {
      returnVal = [];
    }
    const points = {type: 'FeatureCollection', features: returnVal};
    const pointsInBounds = pointsWithinPolygon(points as any, mapState?.IAPPBoundsPolygon);
    const pointsToLabel = pointsWithinPolygon(pointsInBounds as any, mapState?.labelBoundsPolygon);
    // only allow max labels
    if (pointsToLabel?.features?.length > 5000) {
      dispatch({
        type: SET_TOO_MANY_LABELS_DIALOG,
        payload: {
          dialog: {
            dialogOpen: true,
            dialogTitle: 'Too many labels',
            dialogContentText: 'There are too many labels returned.\n Please zoom in more or filter down the record set more.',
            dialogActions: [
              {
                actionName: 'OK',
                actionOnClick: async () => {
                  dispatch({
                    type: SET_TOO_MANY_LABELS_DIALOG,
                    payload: {
                      dialog: {
                        dialogOpen: false,
                        dialogTitle: '',
                        dialogContentText: '',
                        dialogActions: []
                      }
                    }
                  })
                },
                autoFocus: true
              }
            ]
          }
        }
      });
      return [];
    }
    
    return pointsToLabel;
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
    JSON.stringify(mapState?.layers?.[props.layerKey]?.IDList),
    JSON.stringify(mapState?.labelBoundsPolygon)
  ]);
};

const ActivityCanvasLabelMemo = (props) => {
  const mapState = useSelector(selectMap);

  const filteredFeatures = () => {
    let returnVal;
    if (mapState?.layers?.[props.layerKey]?.IDList && mapState?.labelBoundsPolygon) {
      returnVal = mapState?.activitiesGeoJSON?.features
        .filter((row) => {
          return (mapState?.layers?.[props.layerKey]?.IDList?.includes(row.properties.id) && row.geometry)
        })
        .map((row) => {
          let computedCenter = null;
          try {
            // center() function can throw an error
            if (row?.geometry != null) {
              computedCenter = center(row.geometry).geometry;
            }
          } catch (e) {
            console.dir(row.geometry);
            console.error(e);
          }
          return {...row, geometry: computedCenter};
        });
    } else {
      returnVal = [];
    }
    const points = {type: 'FeatureCollection', features: returnVal};
    return pointsWithinPolygon(points as any, mapState?.labelBoundsPolygon);
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
    } else return <div key={Math.random()}></div>;
  }, [
    JSON.stringify(mapState?.layers?.[props.layerKey]?.layerState),
    JSON.stringify(mapState?.layers?.[props.layerKey]?.IDList),
    JSON.stringify(mapState?.labelBoundsPolygon)
  ]);
};

const ActivityLayerMemo = (props) => {
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
    return {type: 'FeatureCollection', features: returnVal};
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
    } else return <div key={Math.random()}></div>;
  }, [
    JSON.stringify(mapState?.layers?.[props.layerKey]?.layerState),
    JSON.stringify(mapState?.layers?.[props.layerKey]?.IDList)
  ]);
};
export const RecordSetLayersRenderer = (props: any) => {
  const {accessRoles} = useSelector(selectAuth);
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
    return <div key={Math.random()}></div>;
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
        return {id: l, order: mapState?.layers?.[l]?.layerState?.drawOrder};
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
          if (layerKey)
            return (
              <div key={layerKey + 'activityLayerDivWrapper'}>
                <ActivityLayerMemo key={'activitiesv2memo' + layerKey} layerKey={layerKey}/>;
                <ActivityCanvasLabelMemo key={'activitiesCanvasLayerLabel' + layerKey} layerKey={layerKey}/>;
              </div>
            );
        })
      ) : (
        <div key={Math.random()}></div>
      )}
      {iappLayers()?.length > 0 ? (
        iappLayers()?.map((layerKey) => {
          if (layerKey)
            return (
              <div key={layerKey + 'IAPPLayerDivWrapper'}>
                <IAPPCanvasLayerMemo key={'POICanvasLayer' + layerKey} layerKey={layerKey}/>;
                <IAPPCanvasLabelMemo key={'POICanvasLayerLabel' + layerKey} layerKey={layerKey}/>;
              </div>
            );
        })
      ) : (
        <div key={Math.random()}></div>
      )}
      <GeneralDialog
        dialogOpen={mapState?.tooManyLabelsDialog?.dialogOpen}
        dialogTitle={mapState?.tooManyLabelsDialog?.dialogTitle}
        dialogActions={mapState?.tooManyLabelsDialog?.dialogActions}
        dialogContentText={mapState?.tooManyLabelsDialog?.dialogContentText}>
      </GeneralDialog>
    </>
  );
};
