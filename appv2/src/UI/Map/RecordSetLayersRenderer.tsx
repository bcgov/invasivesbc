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
import _, { map } from 'lodash';
import { shallowEqual } from 'react-redux';
import { useState, useEffect } from 'react';

import * as turf from '@turf/turf';

import { LeafletCanvasLabel, LeafletCanvasMarker } from './LeafletCanvasLayer';
import { useMap } from 'react-leaflet';

export const RecordSetLayersRenderer = (props: any) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%cRecordSetLayersRenderer.tsx render:' + ref.current.toString(), 'color: yellow');

  const storeLayers = useSelector(
    (state: any) => state.Map?.layers,
    (prev, next) => {
      return prev.length == next.length;
    }
  );

  //const tooManyLabelsDialog = useSelector((state: any) => state.Map?.tooManyLabelsDialog);

  return (
    <>
      {storeLayers.map((layer) => (
        <LayerWrapper key={layer.recordSetID} recordSetID={layer.recordSetID}/>
      ))}
      <></>
      {/*<GeneralDialog
        dialogOpen={tooManyLabelsDialog?.dialogOpen}
        dialogTitle={tooManyLabelsDialog?.dialogTitle}
        dialogActions={tooManyLabelsDialog?.dialogActions}
        dialogContentText={tooManyLabelsDialog?.dialogContentText}></GeneralDialog>
    */}
    </>
  );
};

const LayerWrapper = (props) => {//memo(({ recordSetID }: any) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log(`%cLayerWrapper.tsx render ${props.recordSetID}:` + ref.current.toString(), 'color: green');

  const type = useSelector( (state: any) => state.Map?.layers?.find((layer) => layer?.recordSetID === props.recordSetID)?.type, shallowEqual)

  const geoJSON = useSelector(
    (state: any) =>
      state.Map?.layers?.find((layer) => layer.recordSetID === props.recordSetID)?.geoJSON
        ? state.Map?.layers?.find((layer) => layer.recordSetID === props.recordSetID)?.geoJSON
        : { type: 'FeatureCollection', features: [] },
    (prev, next) => {
      return prev?.features?.length == next?.features?.length && prev.features?.[0] == next.features?.[0];
    }
  );

//  const type: any = 'Activity';
  switch (type) {
    case 'Activity':
      return (
        <>
          <ActivitiesLayerV2 geoJSON={geoJSON} layerKey={props.recordSetID} />
          {/*<ActivityCanvasLabelMemo layerKey={recordSetID} />*/}
        </>
      );
    case 'IAPP':
      return (
        <>
          <IAPPCanvasLayerMemo geoJSON={geoJSON} layerKey={props.recordSetID} />
          <IAPPCanvasLabelMemo geoJSON={geoJSON} layerKey={props.recordSetID} />
        </>
      );
  }

  return <div key={'layerWrapper' + props.recordSetID}></div>;
};

const IAPPCanvasLayerMemo = (props) => {


    const layer  = useSelector((state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey));
  const IAPPBoundsPolygon = useSelector((state: any) => state.Map?.IAPPBoundsPolygon);

  const filteredFeatures = () => {
    let returnVal = [];
    const points = { type: 'FeatureCollection', features: returnVal };
    return props.geoJSON//pointsWithinPolygon(points as any, IAPPBoundsPolygon);
  };

//  return useMemo(() => {
    if (layer?.layerState) {
      return (
        <LeafletCanvasMarker
          key={'POICanvasLayermemo' + props.layerKey}
          labelToggle={layer?.layerState.labelToggle}
          points={filteredFeatures()}
          enabled={layer?.layerState.mapToggle}
          colour={layer?.layerState.color}
          zIndex={100000 + layer?.layerState.drawOrder}
        />
      );
    } else return <></>;
 /* }, [
    JSON.stringify(layer?.layerState),
    JSON.stringify(layer?.IDList, layer?.layerState?.mapToggle),
    JSON.stringify(IAPPBoundsPolygon)
  ]);
  */
};

const IAPPCanvasLabelMemo = (props) => {
  const dispatch = useDispatch();
  const labelBoundsPolygon = useSelector((state: any) => state.Map?.labelBoundsPolygon);
    const layer  = useSelector((state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey));

    const map = useMap()


  const layerStateColor = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey)?.color,
    shallowEqual
  );
  const IAPPBoundsPolygon = useSelector((state: any) => state.Map?.IAPPBoundsPolygon);

  const [pointsInBounds,  setPointsInBounds] = useState(null)

  if(!props.geoJSON) return <></>

  console.log('%cnumber of features to label ' + props.geoJSON?.features?.length, 'color: green')
  const filteredFeatures = () => {
    let returnVal = [];
    const points = { type: 'FeatureCollection', features: returnVal };
    return props.geoJSON//pointsWithinPolygon(points as any, IAPPBoundsPolygon);
  }

  const [bounds, setBounds] = useState(null)


  map.on('zoomend', function () {
    const bboxString = map.getBounds().toBBoxString()
    const bbox = JSON.parse('[' + bboxString + ']')
    let newPointsInBounds = pointsWithinPolygon(props.geoJSON, turf.bboxPolygon(bbox))
    setPointsInBounds(newPointsInBounds)
  })
  map.on('dragend', function () {
    const bboxString = map.getBounds().toBBoxString()
    const bbox = JSON.parse('[' + bboxString + ']')
    let newPointsInBounds = pointsWithinPolygon(props.geoJSON, turf.bboxPolygon(bbox))
    setPointsInBounds(newPointsInBounds)
  })

    //const pointsToLabel = pointsWithinPolygon(props.geoJSON, labelBoundsPolygon);
    // only allow max labels
    /*if (pointsToLabel?.features?.length > 5000) {
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
    }*/


//  return useMemo(() => {
    if (layer?.layerState) {
      return (
        <LeafletCanvasLabel
          layerType={'IAPP'}
          key={'POICanvasLayermemo' + props.layerKey}
         // labelToggle={layer.layerState.labelToggle}
          labelToggle={layer?.layerState?.labelToggle}
          points={pointsInBounds}
          enabled={layer.layerState.mapToggle}
          colour={layer.layerState.color}
          zIndex={10000 + layer.layerState.drawOrder}
        />
      );
    } else return <></>;
 /* }, [
    JSON.stringify(layer?.layerState),
    JSON.stringify(layer?.IDList),
    JSON.stringify(labelBoundsPolygon),
    props.geoJSON
  ]);
};
*/
}

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
