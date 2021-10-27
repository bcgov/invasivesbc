import React, { createContext, useContext, useState } from 'react';
import { useMap, GeoJSON, Circle } from 'react-leaflet';
import bbox from '@turf/bbox';
import union from '@turf/union';
import buffer from '@turf/buffer';
import circle from '@turf/circle';
import { BBox, Geometries } from '@turf/turf';
import L, { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import { createPolygonFromBounds2 } from '../LayerLoaderHelpers/LtlngBoundsToPoly';

export const FlyToAndFadeContext = createContext({
  go: (input: any) => {}
});

export interface IFlyToAndFadeItem {
  name: string;
  bounds?: L.LatLngBounds;
  geometries?: any;
  colour?: string;
  transitionType: FlyToAndFadeItemTransitionType;
}

export enum FlyToAndFadeItemTransitionType {
  zoomToBounds = 'ZOOM_TO_BOUNDS',
  zoomToGeometries = 'ZOOM_TO_GEOS',
  zoomToBoundsAndShowGeometries = 'ZOOM_TO_BOTH'
}

export const bboxToLtlngExpression = (aBbox: BBox) => {
  //let ltlngExpression: L.LatLngBounds = new L.LatLngBounds(aBbox.));
  let southWest: LatLngExpression = [aBbox[1], aBbox[0]];
  let northEast: LatLngExpression = [aBbox[3], aBbox[2]];
  return new L.LatLngBounds(northEast, southWest);
};

export const getBoundsOfCircle = (circle: any) => {
  const asLtLng: L.LatLng = new L.LatLng(circle.geometry.coordinates[1], circle.geometry.coordinates[0]);
  const result = asLtLng.toBounds(circle.properties.radius);
  console.log('getboundsofcircle');
  console.log(asLtLng);
  console.log(result);
  return result;
};

export const FlyToAndFadeContextProvider: React.FC = (props) => {
  const map = useMap();
  const [displayPolygons, setDisplayPolygons] = useState<Array<any>>();
  const go = (items: Array<IFlyToAndFadeItem>, delayToNext?: number) => {
    if (!items) {
      return;
    }
    for (const item of items) {
      switch (item.transitionType) {
        case FlyToAndFadeItemTransitionType.zoomToBounds:
          try {
            map.flyToBounds(item.bounds);
          } catch (e) {
            console.log('unable to zoom to bounds');
            console.log(JSON.stringify(e));
          }
          break;
        case FlyToAndFadeItemTransitionType.zoomToGeometries:
          try {
            var reprocessedForCircles = item.geometries.map((geo) => {
              if (geo.properties.radius) {
                return createPolygonFromBounds2(getBoundsOfCircle(geo));
              } else {
                return geo;
              }
            });
            var geosAsOne = union(...reprocessedForCircles);
            var buffered = buffer(geosAsOne, 1);
            var aBbox = bbox(buffered);
            map.flyToBounds(bboxToLtlngExpression(aBbox));

            //@#$%'n circles again:
            const withCircles = item.geometries.map((geo) => {
              if (geo.properties.radius) {
                return circle(geo.coordinates, geo.properties.radius).geometry;
              } else {
                return geo;
              }
            });

            //add colour to props to make it easy to pass to react-leaflet
            const coloured = withCircles.map((geo) => {
              return { ...geo, properties: { ...geo.properties, colour: item.colour } };
            });

            setDisplayPolygons([...coloured]);
          } catch (e) {
            console.log('unable to zoom to geometries');
            console.log(JSON.stringify(e));
          }
          break;
        case FlyToAndFadeItemTransitionType.zoomToBoundsAndShowGeometries:
          // to use for things like setting the bounds to a regional district etc
          map.flyToBounds(item.bounds);
          break;
      }
    }
  };

  // Fade-in function for Leaflet
  function fadeOutLayerLeaflet(feature, lyr, startOpacity, finalOpacity, opacityStep, delay) {
    if (lyr) {
      let opacity = startOpacity;
      let timer = setTimeout(function changeOpacity() {
        if (opacity > finalOpacity) {
          lyr.setStyle({
            color: feature.properties.colour,
            opacity: opacity,
            fillOpacity: opacity
          });
          opacity = opacity - opacityStep;
        }

        timer = setTimeout(changeOpacity, delay);
      }, delay);
    }
  }

  const fade = (feature, layer) => {
    console.log(feature);
    console.log(layer);
    fadeOutLayerLeaflet(feature, layer, 0.6, 0, 0.02, 100);
  };

  return (
    <FlyToAndFadeContext.Provider value={{ go }}>
      {props.children}
      <GeoJSON key={Math.random()} onEachFeature={fade} data={displayPolygons as unknown as Geometries}></GeoJSON>
    </FlyToAndFadeContext.Provider>
  );
};

export function useFlyToAndFadeContext() {
  const context = useContext(FlyToAndFadeContext);

  if (context == null) {
    throw new Error('No context provided: useFlyToAndFadeContext() can only be used in a descendant of <LayerControl>');
  }

  return context;
}
