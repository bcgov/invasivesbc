import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet.offline';
import { useSelector } from 'util/use_selector';
import { RENDER_DEBUG } from 'UI/App';

const MAP_MAX_ZOOM = 30;

const SatAndLabelLayer = React.memo((props) => {

  const ref = useRef(0);
  ref.current += 1;
  if(RENDER_DEBUG)
  console.log('%cSatAndLabelLayer/Basemaps render:' + ref.current.toString(), 'color: yellow');

  const baseMapToggle = useSelector((state) => state.Map.baseMapToggle);
  const HDToggle = useSelector((state) => state.Map.HDToggle)
  const map = useMap();
  const [baseMapGroup] = useState(L.layerGroup());

  useEffect(() => {
    if (baseMapToggle) {
      return;
    }

    // clear out hd / sd
    baseMapGroup?.clearLayers();
    map?.removeLayer(baseMapGroup);

    const imageryoMap = (L.tileLayer as any).offline(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      // local_storage,
      {
        attribution: '&copy; <a href="http://www.esri.com/copyright">ESRI</a>',
        subdomains: 'abc',
        maxZoom: MAP_MAX_ZOOM,
//        tileSize: 256,
        zIndex: 3000,
        maxNativeZoom: HDToggle ? 21 : 17,
        crossOrigin: true
      }
    );

    const placeoMap = (L.tileLayer as any).offline(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; <a href="http://www.esri.com/copyright">ESRI</a>',
        subdomains: 'abc',
        maxZoom: MAP_MAX_ZOOM,
        maxNativeZoom: HDToggle ? 21 : 17,
        zIndex: 3001,
        crossOrigin: true
      }
    );

    baseMapGroup.addLayer(placeoMap);
    baseMapGroup.addLayer(imageryoMap);
    map.addLayer(baseMapGroup);

    return () => {
      baseMapGroup?.clearLayers();
      map?.removeLayer(baseMapGroup);
    };
  }, [JSON.stringify(baseMapToggle), JSON.stringify(HDToggle)]);

  return null;
});

const TopoLayer = React.memo((props) => {
  const map = useMap();
  const baseMapToggle = useSelector((state) => state.Map.baseMapToggle);
  const [baseMapGroup] = useState(L.layerGroup());

  useEffect(() => {
    if (!baseMapToggle) {
      baseMapGroup?.clearLayers();
      map?.removeLayer(baseMapGroup);
      return;
    }

    const topoMap = (L.tileLayer as any).offline(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; <a href="http://www.esri.com/copyright">ESRI</a>',
        maxZoom: MAP_MAX_ZOOM,
        subdomains: 'abc',
        zIndex: 3000,
        maxNativeZoom: 21,
        crossOrigin: true
      }
    );
    baseMapGroup.addLayer(topoMap);
    map.addLayer(baseMapGroup);

    return () => {
      baseMapGroup?.clearLayers();
      map?.removeLayer(baseMapGroup);
    };
  }, [JSON.stringify(baseMapToggle)]);
  return null;
});

const OfflineLayers = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  if(RENDER_DEBUG)
  console.log('%cOfflineLayers/Basemaps render:' + ref.current.toString(), 'color: yellow');

  return (
    <>
      <SatAndLabelLayer />
      <TopoLayer />
    </>
  );
};

export default OfflineLayers;
