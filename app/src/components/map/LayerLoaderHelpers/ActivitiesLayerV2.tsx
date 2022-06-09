import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import L, { LatLngExpression } from 'leaflet';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Marker, useMap, useMapEvent, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { createDataUTM } from '../Tools/Helpers/StyledTable';
import { GeneratePopup } from '../Tools/ToolTypes/Data/InfoAreaDescription';
import { calc_utm } from '../Tools/ToolTypes/Nav/DisplayPosition';
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
    if (zoom < 16) {
      setZoomType(ZoomTypes.LOW);
      return;
    }
    //} else setZoomType(ZoomTypes.HIGH);
    if (zoom >= 8 && zoom < 15) {
      setZoomType(ZoomTypes.MEDIUM);
      return;
    }
    if (zoom >= 15) {
      setZoomType(ZoomTypes.HIGH);
      return;
    }
  });

  const [activities, setActivities] = useState(null);
  const dataAccess = useDataAccess();
  const options = useMemo(() => {
    return {
      //maxZoom: 2,
      tolerance: 1,
      debug: 1,
      extent: 4096, // tile extent (both width and height)
      buffer: 128, // tile buffer on each side
      indexMaxPoints: 100000, // max number of points per tile in the index
      solidChildren: false,
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
    const activitiesFeatureArray = [];
    activitiesData?.rows?.forEach((row) => {
      activitiesFeatureArray.push(row.geojson ? row.geojson : row);
    });
    setActivities({ type: 'FeatureCollection', features: activitiesFeatureArray });
  };

  useEffect(() => {
    fetchData();
  }, [props.filters]);

  const MarkerMemo = useMemo(() => {
    if (activities && activities.features && props.color) {
      const createClusterCustomIcon = (cluster) => {
        return L.divIcon({
          html: `<span style="height: 25px;
      width: 25px;
      justify-content: center;
      color: white;
      background-color: ${props.color};
      display: inline-block;
      border-radius: 50%;">${cluster.getChildCount()}</span>`,
          className: 'marker-cluster-custom',
          iconSize: L.point(40, 40, true)
        });
      };
      return (
        <MarkerClusterGroup key={Math.random()} iconCreateFunction={createClusterCustomIcon}>
          {activities.features.map((a) => {
            if (a?.geometry?.type === 'Polygon') {
              const position: [number, number] = [a.geometry.coordinates[0][0][1], a.geometry.coordinates[0][0][0]];
              const utmResult = calc_utm(position[0], position[1]);
              const utmArr: any = [
                createDataUTM('Zone', utmResult[0]),
                createDataUTM('Easting', utmResult[1]),
                createDataUTM('Northing', utmResult[2])
              ];

              return (
                <Marker position={position} key={'activity_marker' + a.properties.activity_id}>
                  <GeneratePopup utmRows={utmArr} map={map} bufferedGeo={a} setRecordGeo={null} setClickMode={null} />
                </Marker>
              );
            }
            if (a?.geometry?.type === 'Point') {
              const position: [number, number] = [a.geometry.coordinates[1], a.geometry.coordinates[0]];
              const utmResult = calc_utm(position[0], position[1]);
              const utmArr: any = [
                createDataUTM('Zone', utmResult[0]),
                createDataUTM('Easting', utmResult[1]),
                createDataUTM('Northing', utmResult[2])
              ];

              return (
                <Marker position={position} key={'activity_marker' + a.properties.activity_id}>
                  <GeneratePopup utmRows={utmArr} map={map} bufferedGeo={a} setRecordGeo={null} setClickMode={null} />
                </Marker>
              );
            }
          })}
        </MarkerClusterGroup>
      );
    } else return <></>;
  }, [props.color, activities]);

  return useMemo(() => {
    if (activities && activities.features && props.color) {
      console.log('color from inside activities 2:');
      console.log(props.color.toUpperCase());
      console.log('activities: ' + activities.features.length);
      console.dir(activities);

      switch (zoomType) {
        case ZoomTypes.HIGH:
          return (
            <GeoJSON
              key={'activities_layer_v2_geojson' + props.zIndex}
              // opacity={props.opacity}
              data={activities}
              //zIndex={props.zIndex}
              style={options.style}
            />
          );
          break;

        case ZoomTypes.MEDIUM:
          return (
            <GeoJSONVtLayer
              key={'activities_layer_v2_geojson_vt' + props.zIndex}
              // opacity={props.opacity}
              geoJSON={activities}
              zIndex={props.zIndex}
              options={options}
            />
          );
          break;
        case ZoomTypes.LOW:
          return MarkerMemo;
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
