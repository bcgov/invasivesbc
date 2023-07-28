import React, { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from 'react-dom/server';
import * as L from "leaflet";
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useMap, Marker } from "react-leaflet";
import center from "@turf/center";

import { useSelector } from "util/use_selector";
import { selectMap } from "state/reducers/map";

export const WhatsHereMarker = (props) => {
  const map = useMap();
  const mapState = useSelector(selectMap);
  const markerRef = useRef();
  const [panned, setPanned] = useState(false);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    let lat = null;
    let lng = null;

    if (mapState?.whatsHere?.feature?.geometry) {
      lat = JSON.parse(JSON.stringify(center(mapState?.whatsHere?.feature)?.geometry?.coordinates[1]));
      const coord = mapState?.whatsHere?.feature?.geometry?.coordinates[0];
      lng = coord[2][0];
      const coord2 = coord[1];
      setPosition({ lat: coord2[1], lng: lng });
    }

    return () => {
      setPosition(null);
    };
  }, [JSON.stringify(mapState?.whatsHere?.feature)]);

  useEffect(() => {
    if (!position) {
      return;
    }
    map.setView(position, map.getZoom());
    setTimeout(() => setPanned(true), 1000);
  }, [position]);

  const icon = new L.DivIcon({
    html: renderToStaticMarkup(
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        version="1.1"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M45 0C27.677 0 13.584 14.093 13.584 31.416a31.13 31.13 0 0 0 3.175 13.773c2.905 5.831 11.409 20.208 20.412 35.428l4.385 7.417a4 4 0 0 0 6.888 0l4.382-7.413c8.942-15.116 17.392-29.4 20.353-35.309.027-.051.055-.103.08-.155a31.131 31.131 0 0 0 3.157-13.741C76.416 14.093 62.323 0 45 0zm0 42.81c-6.892 0-12.5-5.607-12.5-12.5s5.608-12.5 12.5-12.5 12.5 5.608 12.5 12.5-5.608 12.5-12.5 12.5z"
          style={{
            stroke: 'none',
            strokeWidth: 1,
            strokeDasharray: 'none',
            strokeLinecap: 'butt',
            strokeLinejoin: 'miter',
            strokeMiterlimit: 10,
            fill: '#00008B',
            fillRule: 'nonzero',
            opacity: 1
          }}
          transform="matrix(1 0 0 1 0 0)"
        />
      </svg>
    ),
    className: 'whatsHereMarkerClass',
    iconSize: [50, 50],
    iconAnchor: [50 / 2, 50 / 2]
  });

  return (
    position?.lat && map && panned && mapState?.whatsHere?.toggle ? (
      <Marker key={Math.random()} icon={icon} ref={markerRef} position={[position?.lat, position?.lng]}></Marker>
    ) : (
      <></>
    )
  );
};

export const createDataUTM = (name: string, value: any) => {
  return { name, value };
};