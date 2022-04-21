import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import L, { LatLngExpression, svg } from 'leaflet';
import * as ReactDOMServer from 'react-dom/server';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Marker, useMap, useMapEvent, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import * as d3 from 'd3';

import { useEffect } from 'react';
import { createSvgIcon } from '@mui/material';
import { ConstructionOutlined, SignalCellularNoSimOutlined } from '@mui/icons-material';

export const useScript = (url) => {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = url;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [url]);
};

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

  const SVG = (props) => {
    const margin = { top: 10, right: 10, bottom: 10, left: 10 },
      width = 460 - margin.left - margin.right,
      height = 460 - margin.top - margin.bottom,
      innerRadius = 80,
      outerRadius = Math.min(width, height) / 2; // the outerRadius goes from the middle of the SVG area to the border

    // append the svg object to the body of the page
    const Asvg = d3
      .create('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2 + 100})`); // Add 100 on Y translation, cause upper bars are longer

    d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum.csv').then(
      function (data) {
        // X scale
        const x = d3
          .scaleBand()
          .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
          .align(0) // This does nothing ?
          .domain(data.map((d) => d.Country)); // The domain of the X axis is the list of states.

        // Y scale
        const y = d3
          .scaleRadial()
          .range([innerRadius, outerRadius]) // Domain will be define later.
          .domain([0, 10000]); // Domain of Y is from 0 to the max seen in the data

        // Add bars
        Asvg.append('g')
          .selectAll('path')
          .data(data)
          .join('path')
          .attr('fill', '#69b3a2')
          .attr(
            'd',
            d3
              .arc() // imagine your doing a part of a donut plot
              .innerRadius(innerRadius)
              .outerRadius((d) => y(d['Value']))
              .startAngle((d) => x(d.Country))
              .endAngle((d) => x(d.Country) + x.bandwidth())
              .padAngle(0.01)
              .padRadius(innerRadius)
          );
      }
    );

    console.log(typeof Asvg);
    console.dir(Asvg);
    console.dir(Asvg._groups[0]);
    console.dir(Asvg._groups[0][0]);
    return (
      <div>
        <Asvg />
      </div>
    );
  };

  const SVGMarker = (props) => {
    // set the dimensions and margins of the graph

    return (
      <div id={`my_dataviz_cluster${props.id}`}>
        <SVG id={props.id} />
      </div>
    );
  };

  const MarkerMemo = useMemo(() => {
    if (activities && activities.features && props.color) {
      const id = JSON.stringify(Math.random()).replace('.', '');
      const renderString = ReactDOMServer.renderToString(<SVGMarker id={id} />);
      console.log(renderString);
      const createClusterCustomIcon = (cluster) => {
        return L.divIcon({
          html: renderString,
          //className: id,
          iconSize: L.point(40, 40, true)
        });

        /*
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
        */
      };
      return (
        <MarkerClusterGroup key={Math.random()} iconCreateFunction={createClusterCustomIcon}>
          {activities.features.map((a) => {
            if (a.geometry.type === 'Polygon') {
              const position: [number, number] = [a.geometry.coordinates[0][0][1], a.geometry.coordinates[0][0][0]];

              return <Marker position={position} key={'activity_marker' + a.properties.activity_id} />;
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
