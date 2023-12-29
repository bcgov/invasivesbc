import center from '@turf/center';
import L from 'leaflet';
import _ from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Marker, useMap, useMapEvent } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { DonutSVG } from './Donut';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { useSelector } from 'react-redux';
import { getPallette } from './AdditionalHelperFunctions';
import { shallowEqual } from 'react-redux';

enum ZoomTypes {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

const Dummy = (props) => {
  return <></>;
};
const DonutMarkerLayer = (props) => {
  const debugSet = '2';
  const ref = useRef(0);
  ref.current += 1;
  console.log(
    '%cDonutMarkerMemo.tsx render:' + ref.current.toString() + 'layerkey: ' + props.layerKey,
    'color: orange'
  );

  const activitiesGeoJSON = useSelector(
    (state: any) =>
      state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey)?.geoJSON
        ? state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey)?.geoJSON
        : { type: 'FeatureCollection', features: [] },
    (prev, next) => { 
      return prev?.features?.length == next?.features?.length && prev.features?.[0] == next.features?.[0];
    }
  );

  if (props.layerKey === '2') console.log('%cfeatures length: ' + activitiesGeoJSON?.features?.length, 'color: green');
  const layerStateColor = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey)?.color,
    shallowEqual
  );

  const globalColorschemeOverride = useSelector(
    (state: any) => state.Map?.layers?.find((layer) => layer.recordSetID === props.layerKey)?.globalColorschemeOverride,
    shallowEqual
  );

  const getPaletteCachedCallback = useCallback(async () => {
    const pallette = await getPallette(layerStateColor, [1, 2].includes(props.layerKey));
    return pallette;
  }, [layerStateColor, globalColorschemeOverride, props.layerKey]);

  const [palette, setPalette] = useState(null);

  useEffect(() => {
    console.log(props.layerKey);
    getPaletteCachedCallback().then((p) => {
      if (JSON.stringify(palette) !== JSON.stringify(p)) {
        setPalette(p);
      }
    });
  }, [layerStateColor, globalColorschemeOverride, props.layerKey]);

  useEffect(() => {
    console.log(`%cPalette trigger render ${props.layerKey}`, `color: ${palette ? 'green' : 'red'}`);
  }, [palette]);
  useEffect(() => {
    console.log(`%cactivities trigger render ${props.layerKey}`, `color: red`);
  }, [activitiesGeoJSON]);

  const createClusterCustomIcon  = (cluster) => {
     // console.log('get all markers')
      const markers = cluster.getAllChildMarkers();
      const data = [];
      markers.forEach((obj) => {
        const marker = obj.options.children.props.bufferedGeo.features[0];
        if (data.length === 0) {
          data.push({
            name: marker?.properties?.type,
            count: 1,
            fillColour: palette[marker?.properties?.type]
          });
        } else {
          let flag = 0;
          for (let i of data) {
            if (marker?.properties?.type === i.name) {
              flag = 1;
              i.count += 1;
              i.fillColour = palette[i.name];
              break;
            }
          }
          if (flag === 0) {
            data.push({
              name: marker?.properties?.type,
              count: 1,
              fillColour: palette[marker?.properties?.type]
            });
          }
        }
      });

      return L.divIcon({
        html: renderToStaticMarkup(<DonutSVG bins={200} data={data} />),
        //  html: logMarkupTime(<DonutSVG bins={200} data={data} />),
        className: '',
        iconSize: [74, 74],
        iconAnchor: [37, 37]
      });
    }

  const Markers = memo(({ palette, layerKey }: any) => {
    return activitiesGeoJSON?.features?.map((a) => {
      return <MarkerMemo key={layerKey + a?.properties?.id} feature={a} palette={palette} layerKey={props.layerKey} />;
    });
    //},[activitiesGeoJSON?.features, palette, props.layerKey]);
  }, []);

  if (!palette || !props.layerKey || !(activitiesGeoJSON?.features?.length > 0)) return <></>;

  console.log('rerendering...')
  return (
    <>
      <MarkerClusterGroup
      ref={ref}
        en
        key={props.layerKey + 'markerclusterAcivities'}
        iconCreateFunction={createClusterCustomIcon}>
        <Markers palette={palette} layerKey={props.layerKey} />
      </MarkerClusterGroup>
    </>
  );
};

export const ActivitiesLayerV2 = (props: any) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log(
    '%cActivitiesLayerV2.tsx render:' + ref.current.toString() + 'layerkey: ' + props.layerKey,
    'color: yellow'
  );

  /*
  useMapEvent('zoomend', () => {
    const zoom = map.getZoom();
    //    getActivitiesSLD();
    if (zoom < 8) {
      setZoomType(ZoomTypes.LOW);
      return;
    }
    if (zoom >= 8 && zoom < 15) {
      setZoomType(ZoomTypes.MEDIUM);
      return;
    }
    if (zoom >= 15) {
      setZoomType(ZoomTypes.HIGH);
    }
  });
  */

  return (
    <DonutMarkerLayer
      layerKey={props?.layerKey}
      //color={layerState?.color}
      //palette={palette}
      //enabled={layerState?.mapToggle}
    />
  );
};

const MarkerMemo = memo(({ feature, palette, layerKey }: any) => {
  const position = center(feature)?.geometry?.coordinates;
  const bufferedGeo = {
    type: 'FeatureCollection',
    features: [feature]
  };
  if (feature?.properties?.id && feature?.properties?.type && palette)
    return (
      <Marker
        icon={L.divIcon({
          html: `
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 100 100"
                          version="1.1"
                          preserveAspectRatio="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M45 0C27.677 0 13.584 14.093 13.584 31.416a31.13 31.13 0 0 0 3.175 13.773c2.905 5.831 11.409 20.208 20.412 35.428l4.385 7.417a4 4 0 0 0 6.888 0l4.382-7.413c8.942-15.116 17.392-29.4 20.353-35.309.027-.051.055-.103.08-.155a31.131 31.131 0 0 0 3.157-13.741C76.416 14.093 62.323 0 45 0zm0 42.81c-6.892 0-12.5-5.607-12.5-12.5s5.608-12.5 12.5-12.5 12.5 5.608 12.5 12.5-5.608 12.5-12.5 12.5z"
                            style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;
                            fill:${
                              palette[feature?.properties?.type]
                            };fill-rule:nonzero;opacity:1" transform="matrix(1 0 0 1 0 0)"
                          />
                        </svg>`,
          className: '',
          iconSize: [10, 17.5],
          iconAnchor: [18, 35]
        })}
        position={[position[1], position[0]]}
        key={'activity_marker' + feature.properties.id + layerKey}>
        <Dummy bufferedGeo={bufferedGeo} />
      </Marker>
    );
});