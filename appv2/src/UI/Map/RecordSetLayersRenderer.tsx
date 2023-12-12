import center from '@turf/center';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import { selectAuth } from 'state/reducers/auth';
import { useSelector } from 'util/use_selector';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';

import L from 'leaflet';

//const  glify } = require('react-leaflet-glify');
//import glify from 'react-leaflet-glify';
//import 'leaflet-canvas-marker';
import { pointsWithinPolygon } from '@turf/turf';
import { GeneralDialog } from './GeneralDialog';
import 'leaflet-markers-canvas';
import { useDispatch } from 'react-redux';
import { SET_TOO_MANY_LABELS_DIALOG } from 'state/actions';
import { LeafletCanvasLabel, LeafletCanvasMarker } from './LeafletCanvasLayer';

const IAPPCanvasLayerMemo = (props) => {
  const IAPPGeoJSON = useSelector((state: any) => state.Map?.IAPPGeoJSON);
  const layers = useSelector((state: any) => state.Map?.layers);
  const IAPPBoundsPolygon = useSelector((state: any) => state.Map?.IAPPBoundsPolygon);

  const filteredFeatures = () => {
    let returnVal;
    if (layers?.[props.layerKey]?.IDList && layers?.[props.layerKey].layerState?.mapToggle && IAPPBoundsPolygon) {
      returnVal = IAPPGeoJSON?.features.filter((row) => {
        return layers?.[props.layerKey]?.IDList?.includes(row.properties.site_id);
      });
    } else {
      returnVal = [];
    }
    const points = {type: 'FeatureCollection', features: returnVal};
    return pointsWithinPolygon(points as any, IAPPBoundsPolygon);
  };

  return useMemo(() => {
    if (layers?.[props.layerKey]?.layerState) {
      return (
        <LeafletCanvasMarker
          key={'POICanvasLayermemo' + props.layerKey}
          labelToggle={layers[props.layerKey].layerState.labelToggle}
          points={filteredFeatures()}
          enabled={layers[props.layerKey].layerState.mapToggle}
          colour={layers[props.layerKey].layerState.color}
          zIndex={100000 + layers[props.layerKey].layerState.drawOrder}
        />
      );
    } else return <></>;
  }, [
    JSON.stringify(layers?.[props.layerKey]?.layerState),
    JSON.stringify(layers?.[props.layerKey]?.IDList, layers?.[props.layerKey].layerState?.mapToggle),
    JSON.stringify(IAPPBoundsPolygon)
  ]);
};

const IAPPCanvasLabelMemo = (props) => {
  const dispatch = useDispatch();
  const labelBoundsPolygon = useSelector((state: any) => state.Map?.labelBoundsPolygon);
  const IAPPBoundsPolygon = useSelector((state: any) => state.Map?.IAPPBoundsPolygon);
  const layers = useSelector((state: any) => state.Map?.layers);
  const IAPPGeoJSON = useSelector((state: any) => state.Map?.IAPPGeoJSON);

  //CAP LABEL COUNT HERE
  const filteredFeatures = () => {
    let returnVal;
    if (labelBoundsPolygon && layers?.[props.layerKey]?.IDList && IAPPBoundsPolygon) {
      returnVal = IAPPGeoJSON?.features.filter((row) => {
        return layers?.[props.layerKey]?.IDList?.includes(row.properties.site_id);
      });
    } else {
      returnVal = [];
    }
    const points = {type: 'FeatureCollection', features: returnVal};
    const pointsInBounds = pointsWithinPolygon(points as any, IAPPBoundsPolygon);
    const pointsToLabel = pointsWithinPolygon(pointsInBounds as any, labelBoundsPolygon);
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
    if (layers?.[props.layerKey]?.layerState) {
      return (
        <LeafletCanvasLabel
          layerType={'IAPP'}
          key={'POICanvasLayermemo' + props.layerKey}
          labelToggle={layers[props.layerKey].layerState.labelToggle}
          points={filteredFeatures()}
          enabled={layers[props.layerKey].layerState.mapToggle}
          colour={layers[props.layerKey].layerState.color}
          zIndex={10000 + layers[props.layerKey].layerState.drawOrder}
        />
      );
    } else return <></>;
  }, [
    JSON.stringify(layers?.[props.layerKey]?.layerState),
    JSON.stringify(layers?.[props.layerKey]?.IDList),
    JSON.stringify(labelBoundsPolygon)
  ]);
};

const ActivityCanvasLabelMemo = (props) => {
  const layers = useSelector((state: any) => state.Map?.layers);
  const labelBoundsPolygon  = useSelector((state: any) => state.Map?.labelBoundsPolygon);
  const activitiesGeoJSON = useSelector((state: any) => state.Map?.activitiesGeoJSON);


  const filteredFeatures = () => {
    let returnVal;
    if (layers?.[props.layerKey]?.IDList && labelBoundsPolygon) {
      returnVal = activitiesGeoJSON?.features
        .filter((row) => {
          return (layers?.[props.layerKey]?.IDList?.includes(row.properties.id) && row.geometry)
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
    return pointsWithinPolygon(points as any, labelBoundsPolygon);
  };

  return useMemo(() => {
    if (layers?.[props.layerKey]?.layerState) {
      return (
        <LeafletCanvasLabel
          layerType={'ACTIVITY'}
          key={'activityCanvasLayermemo' + props.layerKey}
          labelToggle={layers[props.layerKey].layerState.labelToggle}
          points={filteredFeatures()}
          enabled={layers[props.layerKey].layerState.mapToggle}
          colour={layers[props.layerKey].layerState.color}
          zIndex={10000 + layers[props.layerKey].layerState.drawOrder}
        />
      );
    } else return <div key={Math.random()}></div>;
  }, [
    JSON.stringify(layers?.[props.layerKey]?.layerState),
    JSON.stringify(layers?.[props.layerKey]?.IDList),
    JSON.stringify(labelBoundsPolygon)
  ]);
};

const ActivityLayerMemo = (props) => {
  const IDList = useSelector((state: any) => state.Map?.layers?.[props.layerKey]?.IDList);
  const layerState = useSelector((state: any) => state.Map?.layers?.[props.layerKey]?.layerState);
  const activitiesGeoJSON = useSelector((state: any) => state.Map?.activitiesGeoJSON);

  const filteredFeatures = () => {
    let returnVal;
    if (IDList) {
      returnVal = activitiesGeoJSON?.features.filter((row) => {
        return IDList?.includes(row.properties.id);
      });
    } else {
      returnVal = [];
    }
    return {type: 'FeatureCollection', features: returnVal};
  };

  return useMemo(() => {
    if (layerState) {
      return (
        <ActivitiesLayerV2
          key={'activitiesv2filter' + props.layerKey}
          layerKey={props.layerKey}
          activities={filteredFeatures()}
          enabled={layerState.mapToggle}
          color={layerState.color}
          zIndex={layerState.drawOrder + 10000}
          opacity={0.8}
        />
      );
    } else return <div key={Math.random()}></div>;
  }, [
    JSON.stringify(layerState),
    JSON.stringify(IDList)
  ]);
};
export const RecordSetLayersRenderer = (props: any) => {
  const layers = useSelector((state: any) => state.Map?.layers);
  const tooManyLabelsDialog = useSelector((state: any) => state.Map?.tooManyLabelsDialog);

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
    const keys = Object.keys(layers ? layers : {});
    const filtered = keys?.filter((key) => layers[key]?.type === 'POI');
    const sorted = filtered.sort((a, b) => {
      if (layers[a].layerState.drawOrder > layers[b].layerState.drawOrder) return 1; // if the first value is greater than the second
      if (layers[a].layerState.drawOrder === layers[b].layerState.drawOrder) return 0; // if values are equal
      if (layers[a].layerState.drawOrder < layers[b].layerState.drawOrder) return -1; // if the first value is less than the second);
    });
    return sorted;
  }, [
    JSON.stringify(
      Object.keys(layers ? layers : {}).map((l) => {
        return {id: l, order: layers?.[l]?.layerState?.drawOrder};
      })
    )
  ]);

  const activityLayers = useCallback(() => {
    const keys = Object.keys(layers ? layers : {});
    const filtered = keys?.filter((key) => layers[key]?.type === 'Activity');
    const sorted = filtered.sort((a, b) => {
      if (layers[a].layerState.drawOrder > layers[b].layerState.drawOrder) return 1; // if the first value is greater than the second
      if (layers[a].layerState.drawOrder === layers[b].layerState.drawOrder) return 0; // if values are equal
      if (layers[a].layerState.drawOrder < layers[b].layerState.drawOrder) return -1; // if the first value is less than the second);
    });
    return sorted;
  }, [JSON.stringify(Object.keys(layers ? layers : {}))]);

  return (
    <>
      {activityLayers()?.length > 0 ? (
        activityLayers()?.map((layerKey) => {
          if (layerKey)
            return (
              <div key={layerKey + 'activityLayerDivWrapper'}>
                <ActivityLayerMemo key={'activitiesv2memo' + layerKey} layerKey={layerKey}/>
                <ActivityCanvasLabelMemo key={'activitiesCanvasLayerLabel' + layerKey} layerKey={layerKey}/>
              </div>
            )
        })
      ) : (
        <div key={Math.random()}></div>
      )}
      {iappLayers()?.length > 0 ? (
        iappLayers()?.map((layerKey) => {
          if (layerKey)
            return (
              <div key={layerKey + 'IAPPLayerDivWrapper'}>
                <IAPPCanvasLayerMemo key={'POICanvasLayer' + layerKey} layerKey={layerKey}/>
                <IAPPCanvasLabelMemo key={'POICanvasLayerLabel' + layerKey} layerKey={layerKey}/>
              </div>
            )
        })
      ) : (
        <div key={Math.random()}></div>
      )}
      <GeneralDialog
        dialogOpen={tooManyLabelsDialog?.dialogOpen}
        dialogTitle={tooManyLabelsDialog?.dialogTitle}
        dialogActions={tooManyLabelsDialog?.dialogActions}
        dialogContentText={tooManyLabelsDialog?.dialogContentText}>
      </GeneralDialog>
    </>
  );
};
