import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import circle from '@turf/circle';
import { Geometries } from '@turf/turf';
import union from '@turf/union';
import L, { LatLngExpression } from 'leaflet';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { createPolygonFromBounds2 } from '../../../LayerLoaderHelpers/LtlngBoundsToPoly';

export const FlyToAndFadeContext = createContext({
  go: (input: any) => {}
});

export interface IFlyToAndFadeItem {
  name?: string;
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

export const bboxToLtlngExpression = (aBbox: any) => {
  //let ltlngExpression: L.LatLngBounds = new L.LatLngBounds(aBbox.));
  let southWest: LatLngExpression = [aBbox[1], aBbox[0]];
  let northEast: LatLngExpression = [aBbox[3], aBbox[2]];
  return new L.LatLngBounds(northEast, southWest);
};

export const getBoundsOfCircle = (circle: any) => {
  const asLtLng: L.LatLng = new L.LatLng(circle.geometry.coordinates[1], circle.geometry.coordinates[0]);
  const result = asLtLng.toBounds(circle.properties.radius);
  return result;
};

export const FlyToAndFadeContextProvider: React.FC = (props) => {
  const map = useMap();
  const [displayPolygons, setDisplayPolygons] = useState<Array<any>>();
  const go = (items: Array<IFlyToAndFadeItem>, delayToNext?: number) => {
    if (!items || items.length === 0) {
      return;
    } else {
    }
    for (const item of items) {
      switch (item.transitionType) {
        case FlyToAndFadeItemTransitionType.zoomToBounds:
          try {
            map.flyToBounds(item.bounds);
          } catch (e) {}
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
            // temporary crash fix. union() no longer takes a spread operator, but two polygons
            // supposedly there will be a fix in the future (it is Jan 2022 as I'm writing this)
            let geosAsOne;
            if (reprocessedForCircles.length > 100) {
              geosAsOne = union(reprocessedForCircles[0], reprocessedForCircles[1]);
            } else if (reprocessedForCircles.length > 1) {
              geosAsOne = reprocessedForCircles.reduce((a, b) => union(a, b), reprocessedForCircles[0]);
            } else {
              geosAsOne = reprocessedForCircles[0];
            }

            var buffered = buffer(geosAsOne, 1, {
              units: 'meters'
            });
            var aBbox = bbox(buffered);

            //@#$%'n circles again:
            const withCircles = item.geometries.map((geo) => {
              if (geo.properties.radius) {
                try {
                  return circle(
                    [geo.geometry.coordinates[0], geo.geometry.coordinates[1]],
                    geo.properties.radius / 1000
                  );
                } catch (e) {
                  console.log('turf error');
                }
              } else {
                return geo;
              }
            });

            //add colour to props to make it easy to pass to react-leaflet
            const coloured = withCircles.map((geo) => {
              return { ...geo, properties: { ...geo.properties, colour: item.colour } };
            });
            map.flyToBounds(bboxToLtlngExpression(aBbox));
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
        if (opacity > finalOpacity && feature.geometry.type !== 'Point') {
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
    fadeOutLayerLeaflet(feature, layer, 0.6, 0, 0.02, 200);
  };

  useEffect(()=> {
    console.log('yup')
  },[JSON.stringify(displayPolygons)])

  const hashedKey = useCallback(()=> {
    return hashCode(JSON.stringify(displayPolygons))
  },[JSON.stringify(displayPolygons)])

  function hashCode(str: string): number {
    if(!str)
    {
      return
    }
    var h: number = 0;
    for (var i = 0; i < str.length; i++) {
        h = 31 * h + str.charCodeAt(i);
    }
    return h & 0xFFFFFFFF
}
  return (
    <FlyToAndFadeContext.Provider value={{ go }}>
      {props.children}
      <GeoJSON key={hashedKey()} onEachFeature={fade} data={displayPolygons as unknown as Geometries}></GeoJSON>
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
