import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';

import L from 'leaflet';
import { useLeafletContext } from '@react-leaflet/core';
import 'leaflet-markers-canvas';

export const LeafletCanvasMarker = (props) => {
  const map = useMap();
  const context = useLeafletContext();
  const layerRef = useRef();
  const groupRef = useRef();

  useEffect(() => {
    if (!map) return;
    const container = context.layerContainer || context.map;
    layerRef.current = new (L as any).MarkersCanvas();
    groupRef.current = (L as any).layerGroup().setZIndex(props.zIndex);
    groupRef.current.addLayer(layerRef.current).addTo(container);

    let colour = '';
    switch (props.colour) {
      case '#2A81CB':
        colour = 'blue';
        break;
      case '#FFD326':
        colour = 'gold';
        break;
      case '#CB2B3E':
        colour = 'red';
        break;
      case '#2AAD27':
        colour = 'green';
        break;
      case '#CB8427':
        colour = 'orange';
        break;
      case '#CAC428':
        colour = 'yellow';
        break;
      case '#9C2BCB':
        colour = 'violet';
        break;
      case '#7B7B7B':
        colour = 'grey';
        break;
      case '#3D3D3D':
        colour = 'black';
        break;
      default:
        colour = 'blue';
    }
    var icon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + colour + '.png',
      iconSize: [12.5, 20.5],
      iconAnchor: [0, 10]
    });

    var markers = [];

    //    console.log('label toggle');
    //    console.log(props.labelToggle);
    props.points?.features?.map((point) => {
      if (props.labelToggle && props.points?.features.length < 5000) {
        if (!(point?.geometry?.coordinates?.length > 0)) {
          return;
        }
        var marker = L.marker([point.geometry.coordinates[1], point.geometry.coordinates[0]], {
          icon: icon
        });

        markers.push(marker);
      } else {
        if (!(point?.geometry?.coordinates?.length > 0)) {
          return;
        }
        var marker = L.marker([point.geometry.coordinates[1], point.geometry.coordinates[0]], {
          icon: icon
        }); // //?.bindPopup('I Am ' + point.properties);
        markers.push(marker);
      }
    });

    if (groupRef.current) layerRef?.current?.clear();

    if (props.enabled && groupRef.current) {
      layerRef?.current?.addMarkers(markers);
    }

    layerRef?.current?.redraw();

    return () => {
      try {
        if (container && map) {
          layerRef?.current?.removeMarkers(markers);
          container?.removeLayer(layerRef.current);
          container?.removeLayer(groupRef.current);
        }
      } catch (e) {}
    };
  }, [props.colour, props.enabled, props.points, props.zIndex, props.redraw]);

  return <></>;
};

export const LeafletCanvasLabel = (props) => {
  const map = useMap();
  const context = useLeafletContext();
  const layerRef = useRef();
  const groupRef = useRef();

  useEffect(() => {
    if (!map) return;
    const container = context.layerContainer || context.map;
    layerRef.current = new (L as any).MarkersCanvas();
    groupRef.current = (L as any).layerGroup().setZIndex(props.zIndex);
    groupRef.current.addLayer(layerRef.current).addTo(container);

    function svgText(txt1, txt2) {
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" height="500"><text x="0" y="30" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; fill: white; stroke: black; stroke-width: 3px; paint-order: stroke;">' +
        '<tspan x="0" dy="1.2em">' +
        txt1 +
        '</tspan>' +
        '<tspan x="0" dy="1.2em">' +
        txt2 +
        '</tspan>' +
        '</text></svg>'
      );
    }

    var markers = [];

    // console.log('label toggle');
    // console.log(props.labelToggle);
    props.points?.features?.map((point) => {
      if (props.labelToggle && props.points?.features.length < 5000) {
        if (!(point?.geometry?.coordinates?.length > 0)) {
          return;
        }
        let labelImage;
        if (props.layerType === 'IAPP') {
          labelImage =
            'data:image/svg+xml,' +
            encodeURIComponent(svgText(point.properties.site_id, point.properties.species_on_site));
        } else {
          labelImage =
            'data:image/svg+xml,' +
            encodeURIComponent(svgText(point.properties.short_id, point.properties.species_positive || point.properties.species_treated));
        }
        var labelIcon = L.icon({
          iconUrl: labelImage,
          iconSize: [500, 500],
          iconAnchor: [-15, 65]
        });

        var labelMarker = L.marker([point.geometry.coordinates[1], point.geometry.coordinates[0]], {
          icon: labelIcon
        }); // //?.bindPopup('I Am ' + point.properties);
        markers.push(labelMarker);
      } else {
        if (!(point?.geometry?.coordinates?.length > 0)) {
          return;
        }
      }
    });

    if (groupRef.current) layerRef?.current?.clear();

    if (props.enabled && groupRef.current) {
      layerRef?.current?.addMarkers(markers);
    }

    layerRef?.current?.redraw();

    return () => {
      try {
        if (container && map) {
          layerRef?.current?.removeMarkers(markers);
          container?.removeLayer(layerRef.current);
          container?.removeLayer(groupRef.current);
        }
      } catch (e) {}
    };
    //}, [map]);
  }, [props.colour, props.labelToggle, props.enabled, props.points, props.zIndex, props.redraw]);

  return <></>;
};
