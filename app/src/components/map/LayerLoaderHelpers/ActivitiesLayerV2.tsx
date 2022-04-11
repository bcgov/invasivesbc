import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export const ActivitiesLayerV2 = (props: any) => {
  const map = useMap();
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
        opacity: props.opacity,
        fillOpacity: props.opacity / 2,
        weight: 5,
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
      return <GeoJSONVtLayer key={Math.random()} geoJSON={activities} zIndex={props.zIndex} options={options} />;
    } else return <></>;
  }, [JSON.stringify(props.filters), JSON.stringify(props.color), JSON.stringify(activities), props.zIndex]);
};
