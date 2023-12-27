import center from '@turf/center';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'util/use_selector';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';

//const  glify } = require('react-leaflet-glify');
//import glify from 'react-leaflet-glify';
//import 'leaflet-canvas-marker';
import { pointsWithinPolygon } from '@turf/turf';
import 'leaflet-markers-canvas';
import { useDispatch } from 'react-redux';
import { SET_TOO_MANY_LABELS_DIALOG } from 'state/actions';
import { GeneralDialog } from './GeneralDialog';
import { LeafletCanvasLabel, LeafletCanvasMarker } from './LeafletCanvasLayer';

export const RecordSetLayersRenderer = (props: any) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%cRecordSetLayersRenderer.tsx render:' + ref.current.toString(), 'color: yellow');

  const layers = useSelector((state: any) =>
    state.Map?.layers?.map((layer) => {
      return { recordSetID: layer.recordSetID, type: layer.type };
    })
  );
  const tooManyLabelsDialog = useSelector((state: any) => state.Map?.tooManyLabelsDialog);

  return (
    <>
      {layers.map((layer) => (
        <LayerWrapper key={layer.recordSetID} recordSetID={layer.recordSetID} type={layer.type} />
      ))}
      <GeneralDialog
        dialogOpen={tooManyLabelsDialog?.dialogOpen}
        dialogTitle={tooManyLabelsDialog?.dialogTitle}
        dialogActions={tooManyLabelsDialog?.dialogActions}
        dialogContentText={tooManyLabelsDialog?.dialogContentText}></GeneralDialog>
    </>
  );
};

const LayerWrapper = memo(({ recordSetID, type }: any) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log(`%cLayerWrapper.tsx render ${recordSetID}:` + ref.current.toString(), 'color: green');

  console.log('type', type)
  switch (type) {
    case 'Activity':
      return (
        <>
          <ActivitiesLayerV2 layerKey={recordSetID} />
          {/*<ActivityCanvasLabelMemo layerKey={recordSetID} />*/}
        </>
      );
    case 'IAPP':
      return (
        <>
          <IAPPCanvasLayerMemo layerKey={recordSetID} />
          <IAPPCanvasLabelMemo layerKey={recordSetID} />
        </>
      );
  }

  return <div key={'layerWrapper' + recordSetID}></div>;
});

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
    const points = { type: 'FeatureCollection', features: returnVal };
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
    const points = { type: 'FeatureCollection', features: returnVal };
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
            dialogContentText:
              'There are too many labels returned.\n Please zoom in more or filter down the record set more.',
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
                  });
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
  const layerState = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey)?.layerState
  );
  const labelBoundsPolygon = useSelector((state: any) => state.Map?.labelBoundsPolygon);
  const activitiesGeoJSON = useSelector((state: any) => state.Map?.activitiesGeoJSON);

  const filteredFeatures = () => {
    let returnVal;
    if (activitiesGeoJSON && labelBoundsPolygon) {
      returnVal = activitiesGeoJSON?.features.map((row) => {
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
        return { ...row, geometry: computedCenter };
      });
    } else {
      returnVal = [];
    }
    const points = { type: 'FeatureCollection', features: returnVal };
    return pointsWithinPolygon(points as any, labelBoundsPolygon);
  };

  return useMemo(() => {
    if (layerState) {
      return (
        <LeafletCanvasLabel
          layerType={'ACTIVITY'}
          key={'activityCanvasLayermemo' + props.layerKey}
          labelToggle={layerState.labelToggle}
          points={filteredFeatures()}
          enabled={layerState.mapToggle}
          colour={layerState.color}
          zIndex={10000 + layerState.drawOrder}
        />
      );
    } else return <div key={Math.random()}></div>;
  }, [JSON.stringify(layerState), activitiesGeoJSON, JSON.stringify(labelBoundsPolygon)]);
};
