import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { LatLngExpression } from 'leaflet';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Marker, useMap, useMapEvent } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export const ActivitiesLayerV2 = (props: any) => {
  // use this use state var to only rerender when necessary
  const map = useMap();
  enum ZoomTypes {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
  }
  const [zoomType, setZoomType] = useState(ZoomTypes.LOW);
  useMapEvent('zoomend', () => {
    const zoom = map.getZoom();
    console.log('zoom change', zoom);
    if (zoom < 5) {
      setZoomType(ZoomTypes.LOW);
      return;
    }
    if (zoom > 15) {
      setZoomType(ZoomTypes.HIGH);
      return;
    }
    setZoomType(ZoomTypes.MEDIUM);
    return;
  });

  const [activities, setActivities] = useState(null);
  const dataAccess = useDataAccess();
  const options = useMemo(() => {
    return {
      //maxZoom: 2,
      tolerance: 3,
      debug: 0,
      style: {
        fillColor: props.color.toUpperCase(),
        color: props.color.toUpperCase(),
        strokeColor: props.color.toUpperCase(),
        stroke: true,
        strokeOpacity: 1,
        opacity: props.opacity,
        //fillOpacity: props.opacity / 2,
        fillOpacity: props.opacity / 2,
        weight: 3,
        zIndex: props.zIndex
      }
    };
  }, [props.color]);

  const filters: IActivitySearchCriteria = props.filters;
  //  console.log('filters for api');
  // console.dir(filters);
  const fetchData = async () => {
    const activitiesData = await dataAccess.getActivitiesLean({
      ...filters
    });
    //  console.log('fetched activities');
    //  console.dir(activitiesData);
    const activitiesFeatureArray = [];
    activitiesData?.rows?.forEach((row) => {
      activitiesFeatureArray.push(row.geojson ? row.geojson : row);
    });
    setActivities({ type: 'FeatureCollection', features: activitiesFeatureArray });
  };

  useEffect(() => {
    fetchData();
  }, [props.filters]);

  return useMemo(() => {
    if (activities) {
      console.log('color from inside activities 2:');
      console.log(props.color.toUpperCase());
      console.log('activities: ' + activities.features.length);
      console.dir(activities);

      switch (zoomType) {
        case ZoomTypes.HIGH:
          return (
            <GeoJSONVtLayer
              key={'activities_layer_v2_geojson_vt' + Math.random()}
              // opacity={props.opacity}
              geoJSON={activities}
              zIndex={props.zIndex}
              options={options}
            />
          );
          break;
        default:
          return (
            <MarkerClusterGroup>
              {activities.features.map((a) => {
                console.dir(a);
                if (a.geometry.type === 'Polygon') {
                  console.log('poly');
                  const position: [number, number] = [a.geometry.coordinates[0][0][1], a.geometry.coordinates[0][0][0]];
                  console.log(position);

                  return <Marker position={position} key={'activity_marker' + a.properties.activity_id} />;
                }
              })}
            </MarkerClusterGroup>
          );
      }
    } else return <></>;
  }, [
    JSON.stringify(props.filters),
    JSON.stringify(props.color),
    JSON.stringify(activities),
    props.zIndex,
    JSON.stringify(zoomType)
  ]);
};
