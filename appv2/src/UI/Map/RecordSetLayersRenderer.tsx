import center from '@turf/center';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'util/use_selector';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';

//const  glify } = require('react-leaflet-glify');
//import glify from 'react-leaflet-glify';
//import 'leaflet-canvas-marker';
import { pointsWithinPolygon } from '@turf/turf';
import 'leaflet-markers-canvas';
import { SET_TOO_MANY_LABELS_DIALOG } from 'state/actions';
import { GeneralDialog } from './GeneralDialog';
import _, { debounce, map } from 'lodash';
import { shallowEqual } from 'react-redux';
import { useState, useEffect } from 'react';

import * as turf from '@turf/turf';

import { LeafletCanvasLabel, LeafletCanvasMarker, MAX_LABLES_TO_RENDER } from './LeafletCanvasLayer';
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


  return (
    <>
      {storeLayers.map((layer) => (
        <LayerWrapper key={layer.recordSetID} recordSetID={layer.recordSetID} />
      ))}
      <></>
    </>
  );
};

// Rerender for new keys, and if geojson changes
const LayerWrapper = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log(`%cLayerWrapper.tsx render ${props.recordSetID}:` + ref.current.toString(), 'color: green');

  const type = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer?.recordSetID === props.recordSetID)?.type,
    shallowEqual
  );

  const geoJSON = useSelector(
    (state: any) =>
      state.Map?.layers?.find((layer) => layer.recordSetID === props.recordSetID)?.geoJSON
        ? state.Map?.layers?.find((layer) => layer.recordSetID === props.recordSetID)?.geoJSON
        : { type: 'FeatureCollection', features: [] },
    (prev, next) => {
      return prev?.features?.length == next?.features?.length && prev.features?.[0] == next.features?.[0];
    }
  );
  console.log(`%c*${props.recordSetID} **geojson length: ${geoJSON?.features?.length}`, 'color: red');

  // These rerender internally if the layer state changes, without regrabbing the geojson
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
          <IAPPCanvasLayer geoJSON={geoJSON} layerKey={props.recordSetID} />
          <IAPPCanvasLabelMemo geoJSON={geoJSON} layerKey={props.recordSetID} />
        </>
      );
  }

  return <div key={'layerWrapper' + props.recordSetID}></div>;
};

const IAPPCanvasLayer = (props) => {
  const layerState = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey).layerState,
    shallowEqual
  );

  if (props.geoJSON?.features?.length > 0 && layerState.mapToggle) {
    return (
      <LeafletCanvasMarker
        key={'POICanvasLayermemo' + props.layerKey}
        points={props.geoJSON}
        enabled={layerState.mapToggle}
        colour={layerState.color}
        zIndex={100000 + layerState.drawOrder}
      />
    );
  } else return <></>;
};

const IAPPCanvasLabelMemo = (props) => {
  const layerState = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey).layerState,
    shallowEqual
  );

  const map = useMap();
  const [pointsInBounds, setPointsInBounds] = useState(null);

  if (!props.geoJSON) return <></>;

  // Grab first .slice(0, MAX_LABLES_TO_RENDER) points in bounds
  const getPointsInPoly = useCallback(() => {
    const bboxString = map.getBounds().toBBoxString();
    const bbox = JSON.parse('[' + bboxString + ']');
    let newPointsInBounds = pointsWithinPolygon(props.geoJSON, turf.bboxPolygon(bbox));
    if(newPointsInBounds?.features?.length < MAX_LABLES_TO_RENDER) {
      return newPointsInBounds
    }
    else
    {
      const sliced = newPointsInBounds?.features?.slice(0, MAX_LABLES_TO_RENDER);
      const collection = { type: 'FeatureCollection', features: sliced}
      return collection
    }
  }, [props.geoJSON, map]);

  const debouncedGetPointsInPoly = debounce(getPointsInPoly, 500, { leading: true });

  useEffect(() => {
    map.on('zoomend', function () {
      const newPointsInBounds = debouncedGetPointsInPoly();
      setPointsInBounds(newPointsInBounds);
    });
    map.on('dragend', function () {
      const newPointsInBounds = debouncedGetPointsInPoly();
      setPointsInBounds(newPointsInBounds);
    });
  }, []);

  if (!(pointsInBounds?.features?.length > 0)) return <></>;
  return (
    <LeafletCanvasLabel
      layerType={'IAPP'}
      key={'POICanvasLayermemo' + props.layerKey}
      labelToggle={layerState.labelToggle}
      points={pointsInBounds}
      enabled={layerState.mapToggle}
      colour={layerState.color}
      zIndex={10000 + layerState.drawOrder}
    />
  );
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
