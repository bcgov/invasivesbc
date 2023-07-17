import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import * as L from "leaflet";
import 'leaflet.offline';
import { useSelector } from "util/use_selector";
import { selectMap } from "state/reducers/map";

const OfflineLayers = (props) => {
  const [mapMaxZoom] = useState<number>(30);
  const mapState = useSelector(selectMap);
  const [baseMapGroup] = useState(L.layerGroup());

  const map = useMap();
  const imageryoMap = (L.tileLayer as any).offline(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    // local_storage,
    {
      attribution: '&copy; <a href="http://www.esri.com/copyright">ESRI</a>',
      subdomains: 'abc',
      maxZoom: mapMaxZoom,
      zIndex: 3000,
      maxNativeZoom: mapState.HDToggle ? 21 : 17,
      crossOrigin: true
    }
  );
  const topoMap = (L.tileLayer as any).offline(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '&copy; <a href="http://www.esri.com/copyright">ESRI</a>',
      maxZoom: mapMaxZoom,
      subdomains: 'abc',
      zIndex: 3000,
      maxNativeZoom: mapState.HDToggle ? 21 : 17,
      crossOrigin: true
    }
  );

  const placeoMap = (L.tileLayer as any).offline(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '&copy; <a href="http://www.esri.com/copyright">ESRI</a>',
      subdomains: 'abc',
      maxZoom: mapMaxZoom,
      maxNativeZoom: mapState.HDToggle ? 21 : 17,
      zIndex: 3001,
      crossOrigin: true
    }
  );

  useEffect(() => {
    // If mapState.baseMapToggle changes, disable or enable the circle
    if (mapState.baseMapToggle) {
      baseMapGroup.clearLayers();
      baseMapGroup.addLayer(topoMap);
      map.addLayer(baseMapGroup);
    } else {
      baseMapGroup.clearLayers();
      map.removeLayer(baseMapGroup);
      baseMapGroup.addLayer(placeoMap);
      baseMapGroup.addLayer(imageryoMap);
      map.addLayer(baseMapGroup);
    }
  }, [mapState.baseMapToggle, mapState.HDToggle]);

  return(<></>) ;
};

export default OfflineLayers;