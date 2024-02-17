import React, { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useMap, Marker, GeoJSON } from 'react-leaflet';
import center from '@turf/center';

import { useSelector } from 'util/use_selector';
import './WhatsHereMarker.css';

export const WhatsHereCurrentRecordHighlighted = (props) => {
  const map = useMap();
  const isOnWhatsHerePage = useSelector((state: any) => state.AppMode?.url === '/WhatsHere');
  const [highlightedGeo, setHighlightedGeo] = useState(null);
  const [highlightedMarkerLtLng, setHighlightedMarkerLtLng] = useState(null);
  const quickPanToRecord = useSelector((state: any) => state.Map?.quickPanToRecord);
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);
  const popupRef = React.useRef(null);

  useEffect(() => {
    const isIAPP = whatsHere?.highlightedIAPP ? true : false;

    const geo = whatsHere?.highlightedGeo;

    const isPoint = isIAPP || geo?.geometry?.type === 'Point' ? true : false;
    const area = geo?.reported_area;
    let addedZoom = 0;
    let latOffset = 0.004;
    if (area < 10000) {
      addedZoom = 3;
      latOffset = 0.0005;
    } else if (area < 50000) {
      addedZoom = 2;
      latOffset = 0.001;
    } else if (area < 250000) {
      addedZoom = 1;
      latOffset = 0.002;
    }

    //if (!isPoint && geo) {
    if (!isPoint && geo) {
      setHighlightedGeo({ ...geo });
      const centerOfGeo = center({ ...geo.geometry }).geometry.coordinates;
      //setHighlightedMarkerLtLng(centerOfGeo);
      setHighlightedMarkerLtLng([centerOfGeo[1], centerOfGeo[0]]);
      /* map.flyTo({
        lat: centerOfGeo[1] - latOffset,
        lng: centerOfGeo[0]
      }, 15 + addedZoom);*/
    } else if (isPoint && geo) {
      setHighlightedGeo(null)
      const centerOfGeo = center({ ...geo.geometry }).geometry.coordinates;
      setHighlightedMarkerLtLng([centerOfGeo[1], centerOfGeo[0]]);
      /*map.flyTo({
        lat: centerOfGeo[1] - latOffset,
        lng: centerOfGeo[0]
      }, (15 + addedZoom));*/
    } else return;
  }, [whatsHere?.highlightedIAPP, whatsHere?.highlightedACTIVITY, whatsHere?.highlightedGeo]);

  const highlight = (feature, layer) => {
    layer.setStyle({
      color: 'yellow'
    });
  };

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
            fill: '#FCBA19',
            fillRule: 'nonzero',
            opacity: 1
          }}
          transform="matrix(1 0 0 1 0 0)"
        />
      </svg>
    ),
    className: 'whatsHereHighlighedMarker',
    iconSize: [50, 50],
    iconAnchor: [18, 35]
  });

  useEffect(() => {
    if (!highlightedGeo) {
      popupRef?.current?.togglePopup();
      popupRef?.current?.unbindPopup();
      popupRef?.current?.remove();
      return;
    } else {
      if (whatsHere?.highlightedACTIVITY || whatsHere?.highlightedIAPP) {
        popupRef?.current?.unbindPopup();
        popupRef?.current?.remove();
        const str = whatsHere?.highlightedIAPP ? 'SITE:' + whatsHere?.highlightedIAPP : whatsHere?.highlightedACTIVITY;
        popupRef.current?.bindPopup(str);
      }
      popupRef.current?.openPopup();
    }
  }, [highlightedGeo, whatsHere?.highlightedACTIVITY, whatsHere?.highlightedIAPP]);

  return (
    <>
      {highlightedMarkerLtLng && isOnWhatsHerePage ? (
        <Marker key={Math.random()} icon={icon} position={highlightedMarkerLtLng} />
      ) : (
        <></>
      )}
      {highlightedGeo && isOnWhatsHerePage ? (
        <GeoJSON key={Math.random()} onEachFeature={highlight} data={highlightedGeo?.geometry}></GeoJSON>
      ) : (
        <></>
      )}
      {whatsHere.feature && isOnWhatsHerePage ? (
        <GeoJSON key={Math.random()} data={whatsHere?.feature?.geometry}></GeoJSON>
      ) : (
        <></>
      )}
    </>
  );
};

export const createDataUTM = (name: string, value: any) => {
  return { name, value };
};
