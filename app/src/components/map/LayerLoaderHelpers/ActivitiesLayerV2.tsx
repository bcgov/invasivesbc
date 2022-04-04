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
  const options = {
    maxZoom: 24,
    tolerance: 3,
    debug: 0,
    style: {
      fillColor: props.color_code || '#0000ff',
      color: props.color_code || '#0000ff',
      stroke: true,
      opacity: props.opacity,
      fillOpacity: props.opacity / 2,
      weight: 5,
      zIndex: 1000000
    }
  };

  const filters: IActivitySearchCriteria = props.filters;
  const fetchData = async () => {
    const activitiesData = await dataAccess.getActivitiesLean({
      ...filters
    });
    const activitiesFeatureArray = [];
    activitiesData?.rows?.forEach((row) => {
      activitiesFeatureArray.push(row.geojson ? row.geojson : row);
    });
    setActivities({ type: 'FeatureCollection', features: activitiesFeatureArray });
  };

  useEffect(() => {
    fetchData();
  }, [props.filters]);

  console.dir(activities);

  const ReturnVal = useMemo(() => {
    return (
      <>
        {
          activities && <GeoJSONVtLayer geoJSON={activities} zIndex={props.zIndex} options={options} /> //NOSONAR
        }
      </>
    );
  }, [JSON.stringify(props.filters), JSON.stringify(props.color)]);
  return ReturnVal;
};
