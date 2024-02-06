import center from '@turf/center';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'util/use_selector';
import { ActivitiesDonutLayer } from './ActivitiesLayerV2';

//const  glify } = require('react-leaflet-glify');
//import glify from 'react-leaflet-glify';
//import 'leaflet-canvas-marker';
import { pointsWithinPolygon } from '@turf/turf';
import 'leaflet-markers-canvas';
import { SET_TOO_MANY_LABELS_DIALOG } from 'state/actions';
import { GeneralDialog } from './GeneralDialog';
import _, { debounce, map, set, update } from 'lodash';
import { shallowEqual } from 'react-redux';
import { useState, useEffect } from 'react';

import * as turf from '@turf/turf';

import { LeafletCanvasLabel, LeafletCanvasMarker, MAX_LABLES_TO_RENDER } from './LeafletCanvasLayer';
import { useMap, GeoJSON } from 'react-leaflet';
import { circleMarker } from 'leaflet';
import { RENDER_DEBUG } from 'UI/App';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';

export const RecordSetLayersRenderer = (props: any) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%cRecordSetLayersRenderer.tsx render:' + ref.current.toString(), 'color: yellow');

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

  if (RENDER_DEBUG)
    console.log(`%cLayerWrapper.tsx render ${props.recordSetID}:` + ref.current.toString(), 'color: green');

  const type = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer?.recordSetID === props.recordSetID)?.type,
    shallowEqual
  );

  const color = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer?.recordSetID === props.recordSetID)?.layerState?.color,
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

  let backupPalette = {
    Biocontrol: '#845ec2',
    FREP: '#de852c',
    Monitoring: '#2138e0',
    Observation: '#399c3e',
    Treatment: '#c6c617'
  };
  let defaultStyle = (feature) => {
    return { color: backupPalette[feature?.properties?.type] };
  };

  let customStyle = (feature) => {
    return { color: color };
  };

  if (!(geoJSON?.features?.length > 0)) return <></>;
  // These rerender internally if the layer state changes, without regrabbing the geojson
  switch (type) {
    case 'Activity':
      if (props.recordSetID === '2') {
        return (
          <>
            {/*<ActivitiesDonutLayer geoJSON={geoJSON} layerKey={props.recordSetID} />*/}
            {/*<CustomGeoJSONLayer geoJSON={geoJSON} layerKey={props.recordSetID} customStyle={defaultStyle} />*/}
            <GeoJSONVtLayer
            zIndex={4000}
              geoJSON={geoJSON}
              options={{
                maxZoom: 24,
                tolerance: 100,
                debug: 0,
                extent: 4096, // tile extent (both width and height)
                buffer: 128, // tile buffer on each side
                indexMaxPoints: 100000, // max number of points per tile in the index
                solidChildren: false,
                layerStyles: defaultStyle,
                style: {...defaultStyle,
                /*style: {
                        fillColor: '#eb4034',
                       color: '#eb4034',
                      strokeColor: '#eb4034',
                      */
                  stroke: true,
                  strokeOpacity: 1,
                  strokeWidth: 10,
                  opacity: 1,
                  fillOpacity: 2 / 2,
                  weight: 3,
                  zIndex: 4000 
                }
              }}
            />
            <ActivityCanvasLabel geoJSON={geoJSON} layerKey={props.recordSetID} />
          </>
        );
      } else {
        return (
          <>
            <CustomGeoJSONLayer geoJSON={geoJSON} layerKey={props.recordSetID} customStyle={customStyle} />
            <ActivityCanvasLabel geoJSON={geoJSON} layerKey={props.recordSetID} />
          </>
        );
      }
    case 'IAPP':
      return (
        <>
          <IAPPCanvasLayer geoJSON={geoJSON} layerKey={props.recordSetID} />
          <IAPPCanvasLabel geoJSON={geoJSON} layerKey={props.recordSetID} />
        </>
      );
  }

  return <div key={'layerWrapper' + props.recordSetID}></div>;
};

const CustomGeoJSONLayer = (props) => {
  const enabled = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey)?.layerState?.mapToggle,
    shallowEqual
  );
  if (!enabled) return <></>;
  return (
    <GeoJSON
      key={'ActivityGeoJSON' + props.recordSetID + Math.random()}
      data={props.geoJSON}
      style={props.customStyle}
      pointToLayer={(feature, latlng) => {
        return circleMarker(latlng, { radius: 2 });
      }}
    />
  );
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

const IAPPCanvasLabel = (props) => {
  const map = useMap();
  const [pointsInBounds, setPointsInBounds] = useState(null);

  const layerState = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey).layerState,
    shallowEqual
  );

  if (!props.geoJSON || !layerState.labelToggle) return <></>;

  // Grab first .slice(0, MAX_LABLES_TO_RENDER) points in bounds
  const getPointsInPoly = () => {
    //useCallback(() => {
    const bboxString = map.getBounds().toBBoxString();
    const bbox = JSON.parse('[' + bboxString + ']');
    let newPointsInBounds = pointsWithinPolygon(props.geoJSON, turf.bboxPolygon(bbox));
    if (newPointsInBounds?.features?.length < MAX_LABLES_TO_RENDER) {
      return { ...newPointsInBounds };
    } else {
      const sliced = newPointsInBounds?.features?.slice(0, MAX_LABLES_TO_RENDER);
      const collection = { type: 'FeatureCollection', features: [...sliced] };
      return { ...collection };
    }
  };

  const debouncedGetPointsInPoly = debounce(getPointsInPoly, 500, { leading: true, trailing: false });

  const updatePointsInBounds = () => {
    const newPointsInBounds = debouncedGetPointsInPoly();
    setPointsInBounds(newPointsInBounds);
  };

  useEffect(() => {
    if (!props.geoJSON || !layerState.labelToggle) return;

    updatePointsInBounds();

    map.on('zoomend', updatePointsInBounds);
    map.on('dragend', updatePointsInBounds);

    return () => {
      map.off('zoomend', updatePointsInBounds);
      map.off('dragend', updatePointsInBounds);
      setPointsInBounds(null);
    };
  }, [props.geoJSON]);

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

const ActivityCanvasLabel = (props) => {
  const map = useMap();
  const [pointsInBounds, setPointsInBounds] = useState(null);
  const layerState = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey)?.layerState
  );

  const labelPoints = useCallback(() => {
    if (!(props.geoJSON?.features?.length > 0) || !layerState.labelToggle)
      return { type: 'FeatureCollection', features: [] };
    const points = props.geoJSON?.features.map((row) => {
      let computedCenter = null;
      try {
        // center() function can throw an error
        if (row?.geometry != null && row?.geometry?.type) {
          computedCenter = center(row.geometry).geometry;
        }
      } catch (e) {
        console.dir(row.geometry);
        console.error(e);
      }
      return { ...row, geometry: computedCenter };
    });

    return { type: 'FeatureCollection', features: points?.length > 0 ? [...points] : [] } as any;
  }, [props.geoJSON, layerState?.labelToggle]);

  // Grab first .slice(0, MAX_LABLES_TO_RENDER) points in bounds
  const getPointsInPoly = () => {
    //useCallback(() => {
    try {
      const bboxString = map.getBounds().toBBoxString();
      const bbox = JSON.parse('[' + bboxString + ']');
      let newPointsInBounds = pointsWithinPolygon(labelPoints(), turf.bboxPolygon(bbox));
      if (newPointsInBounds?.features?.length < MAX_LABLES_TO_RENDER) {
        return { ...newPointsInBounds };
      } else {
        const sliced = newPointsInBounds?.features?.slice(0, MAX_LABLES_TO_RENDER);
        const collection = { type: 'FeatureCollection', features: [...sliced] };
        return { ...collection };
      }
    } catch (e) {
      console.log('Errror in getPointsInPoly');
      console.log(e);
      return { type: 'FeatureCollection', features: [] };
    }
  };

  const debouncedGetPointsInPoly = debounce(getPointsInPoly, 500, { leading: true, trailing: false });

  const updatePointsInBounds = () => {
    const newPointsInBounds = debouncedGetPointsInPoly();
    setPointsInBounds(newPointsInBounds);
  };

  useEffect(() => {
    if (!layerState?.labelToggle) return;
    updatePointsInBounds();

    map.on('zoomend', updatePointsInBounds);
    map.on('dragend', updatePointsInBounds);

    return () => {
      map.off('zoomend', updatePointsInBounds);
      map.off('dragend', updatePointsInBounds);
      setPointsInBounds(null);
    };
  }, [props.geoJSON, layerState?.labelToggle]);

  if (!(pointsInBounds?.features?.length > 0)) return <></>;
  return (
    <LeafletCanvasLabel
      layerType={'ACTIVITY'}
      key={'ActivityCanvasLayerLabel' + props.layerKey}
      labelToggle={layerState.labelToggle}
      points={pointsInBounds}
      enabled={layerState.mapToggle}
      colour={layerState.color}
      zIndex={10000 + layerState.drawOrder}
    />
  );
};
