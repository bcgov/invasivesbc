import { MapContextMenuData } from "features/home/map/MapContextMenu";
import { Feature } from "geojson";
import { interactiveGeoInputData } from "./GeoMeta";

export const getZIndex = (doc) => {
  const coords = doc.geometry[0]?.geometry.coordinates;
  let zIndex = 100000;
  if (doc.geometry[0].geometry.type === 'Polygon' && coords?.[0]) {
    let highestLat = coords[0].reduce((max, point) => {
      if (point[1] > max) return point[1];
      return max;
    }, 0);
    let lowestLat = coords[0].reduce((min, point) => {
      if (point[1] < min) return point[1];
      return min;
    }, zIndex);

    zIndex = zIndex / (highestLat - lowestLat);
  }
  return zIndex;
};

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  showDrawControls: boolean;
  geometryState: { geometry: any[]; setGeometry: (geometry: Feature[]) => void };
  interactiveGeometryState?: {
    interactiveGeometry: any[];
    setInteractiveGeometry: (interactiveGeometry: interactiveGeoInputData[]) => void;
  };
  extentState: { extent: any; setExtent: (extent: any) => void };
  contextMenuState: {
    state: MapContextMenuData;
    setContextMenuState: (contextMenuState: MapContextMenuData) => void;
  };
}

const host = window.location.hostname;
let geoserver;
switch (true) {
  case /^localhost/.test(host):
    geoserver = 'http://localhost:8080';
    break;
  case /^dev.*/.test(host):
    geoserver = 'https://invasivesbci-geoserver-dev-7068ad-dev.apps.silver.devops.gov.bc.ca';
    break;
  case /^test.*/.test(host):
    geoserver = 'https://invasivesbci-geoserver-tst-7068ad-tst.apps.silver.devops.gov.bc.ca';
    break;
  case /^invasivesbc.*/.test(host):
    geoserver = 'https://invasivesbci-geoserver-7068ad.apps.silver.devops.gov.bc.ca';
    break;
}

const MapContainer: any = (props) => {
  return 'banana'
}
export default MapContainer;
