import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import L from 'leaflet';
import React, { useEffect, useMemo, useState } from 'react';
import { Marker, useMap, useMapEvent, GeoJSON, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { GeneratePopup } from '../Tools/ToolTypes/Data/InfoAreaDescription';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import center from '@turf/center';
import SLDParser from 'geostyler-sld-parser';
import { InvasivesBCSLD } from '../SldStyles/invasivesbc_sld';
import { renderToStaticMarkup } from 'react-dom/server';
import { DonutSVG } from '../Donut';

enum ZoomTypes {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export const ActivitiesLayerV2 = (props: any) => {
  // use this use state var to only rerender when necessary
  const map = useMap();
  const [zoomType, setZoomType] = useState(ZoomTypes.LOW);
  const [activities, setActivities] = useState(null);
  const dataAccess = useDataAccess();
  const [options, setOptions] = useState({
    maxZoom: 24,
    tolerance: 100,
    debug: 0,
    extent: 4096, // tile extent (both width and height)
    buffer: 128, // tile buffer on each side
    indexMaxPoints: 100000, // max number of points per tile in the index
    solidChildren: false,
    layerStyles: {},
    style: {
      fillColor: '#00000',
      color: '#00000',
      strokeColor: '#00000',
      stroke: true,
      strokeOpacity: 1,
      opacity: props.opacity,
      fillOpacity: props.opacity / 2,
      weight: 3,
      zIndex: props.zIndex
    }
  });

  useMapEvent('zoomend', () => {
    const zoom = map.getZoom();
    getActivitiesSLD();
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

  const getSldStylesFromLocalFile = async () => {
    const sldParser = new SLDParser();
    let styles = await sldParser.readStyle(InvasivesBCSLD);
    return styles;
  };

  const getActivitiesSLD = () => {
    getSldStylesFromLocalFile().then((res) => {
      setOptions((prevOptions) => ({ ...prevOptions, layerStyles: res }));
      fetchData();
    });
  };

  useEffect(() => {
    getActivitiesSLD();
  }, []);

  useMemo(() => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      style: { ...prevOptions.style, fillColor: props.color.toUpperCase() }
    }));
  }, [props.color]);

  const MarkerMemo = useMemo(() => {
    if (activities && activities.features && props.color) {
      const createClusterCustomIcon = (cluster) => {
        const markers = cluster.getAllChildMarkers();
        const data = [];
        markers.forEach((obj) => {
          const marker = obj.options.children.props.bufferedGeo;
          if (data.length === 0) {
            data.push({ name: marker.properties.type, count: 1 });
          } else {
            let flag = 0;
            for (let i of data) {
              if (marker.properties.type === i.name) {
                flag = 1;
                i.count += 1;
                break;
              }
            }
            if (flag === 0) {
              data.push({ name: marker.properties.type, count: 1 });
            }
          }
        });
        return L.divIcon({
          html: renderToStaticMarkup(<DonutSVG bins={200} data={data} />),
          className: '',
          iconSize: [64, 64],
          iconAnchor: [32, 32]
        });
      };
      return (
        <MarkerClusterGroup key={Math.random()} iconCreateFunction={createClusterCustomIcon}>
          {activities?.features?.map((a) => {
            if (a?.geometry?.type) {
              const position = center(a)?.geometry?.coordinates;

              return (
                <Marker position={[position[1], position[0]]} key={'activity_marker' + a.properties.activity_id}>
                  <GeneratePopup bufferedGeo={a} />
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
      switch (zoomType) {
        case ZoomTypes.HIGH:
          return (
            <>
              {
                activities && <GeoJSONVtLayer zIndex={props.zIndex} geoJSON={activities} options={options} /> //NOSONAR
              }
            </>
          );
        case ZoomTypes.MEDIUM:
          return MarkerMemo;
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
