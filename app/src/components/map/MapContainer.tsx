import { MapContextMenuData } from '../../features/home/map/MapContextMenu';
import { Feature, GeoJsonObject } from 'geojson';
import React, { useState, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MapContainer.css';
import {
  MapContainer as ReactLeafletMapContainer,
  useMap,
  FeatureGroup,
  ZoomControl,
  Marker,
  Tooltip
} from 'react-leaflet';
import Spinner from '../../components/spinner/Spinner';

// Offline dependencies
import 'leaflet.offline';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { IPointOfInterestSearchCriteria } from '../../interfaces/useInvasivesApi-interfaces';

// Layer Picker
import { LayerPicker } from './LayerPicker/LayerPicker';
import data from './LayerPicker/GEO_DATA.json';
import DisplayPosition from './Tools/DisplayPosition';
import { MapRequestContextProvider } from '../../contexts/MapRequestsContext';
import MeasureTool from './Tools/MeasureTool';
import EditTools from './Tools/EditTools';
import { toolStyles } from './Tools/Helpers/ToolBtnStyles';
import { SetPointOnClick } from './Tools/InfoAreaDescription';
import marker from './Icons/POImarker.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

export type MapControl = (map: any, ...args: any) => void;

// Style the image inside the download button
const iconStyle = {
  transform: 'scale(0.7)',
  opacity: '0.7',
  width: 32,
  height: 32
};

const storeLayersStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  backgroundColor: 'white',
  color: '#464646',
  width: '2.7rem',
  height: '2.7rem',
  border: '2px solid rgba(0,0,0,0.2)',
  backgroundClip: 'padding-box',
  top: '10px',
  left: '10px',
  zIndex: 1000,
  borderRadius: '4px',
  cursor: 'pointer'
} as React.CSSProperties;

export const getZIndex = (doc) => {
  if (!doc.geometry) {
    return 0;
  }
  if (!doc.geometry.geometry) {
    return 0;
  }
  if (doc.geometry.geometry.length <= 0) {
    return 0;
  }
  const coords = doc.geometry[0]?.geometry.coordinates;
  let zIndex = 100000;
  if (doc.geometry[0].geometry.type === 'Polygon' && coords?.[0]) {
    const highestLat = coords[0].reduce((max, point) => {
      if (point[1] > max) {
        return point[1];
      }
      return max;
    }, 0);
    const lowestLat = coords[0].reduce((min, point) => {
      if (point[1] < min) {
        return point[1];
      }
      return min;
    }, zIndex);

    zIndex = zIndex / (highestLat - lowestLat);
  }
  return zIndex;
};

export const async = require('async');
export const q = async.queue(function (task, callback) {
  callback();
}, 1);

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  showDrawControls: boolean;
  isPlanPage?: boolean;
  pointOfInterestFilter?: IPointOfInterestSearchCriteria;
  geometryState: { geometry: any[]; setGeometry: (geometry: Feature[]) => void };
  interactiveGeometryState?: {
    interactiveGeometry: any;
    setInteractiveGeometry: (interactiveGeometry: GeoJsonObject) => void;
  };
  extentState: { extent: any; setExtent: (extent: any) => void };
  contextMenuState: {
    state: MapContextMenuData;
    setContextMenuState: (contextMenuState: MapContextMenuData) => void;
  };
  setWellIdandProximity?: (wellIdandProximity: any) => void;
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const [poiMarker, setPoiMarker] = useState(null);
  const [map, setMap] = useState<any>(null);
  const toolClass = toolStyles();

  const markerIcon = L.icon({
    iconUrl: marker,
    iconSize: [24, 24]
  });

  const Offline = () => {
    const mapOffline = useMap();
    const offlineLayer = (L.tileLayer as any).offline(
      // 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      // localforage,
      {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abc',
        // minZoom: 13,
        // maxZoom: 19,
        crossOrigin: true
      }
    );
    offlineLayer.addTo(mapOffline);

    const [offlineing, setOfflineing] = useState(false);

    const saveBasemapControl = (L.control as any).savetiles(offlineLayer, {
      zoomlevels: [13, 14, 15, 16, 17],
      confirm(_: any, successCallback: any) {
        successCallback(true);
      }
    });

    saveBasemapControl._map = mapOffline;

    const storeLayers = async () => {
      setOfflineing(true);
      await saveBasemapControl._saveTiles();
      // XXX: This is firing to quickly
      setOfflineing(false);
    };

    return (
      <div id="offline-layers-button" title="Offline layers" onClick={storeLayers} style={storeLayersStyle}>
        {/* TODO:
          1. Toggle between spinner and image depending on 'offlineing' status
          2. Swap image style based on zoom level
        */}
        {offlineing ? (
          <Spinner></Spinner>
        ) : (
          <img alt="offlineing_status" src="/assets/icon/download.svg" style={iconStyle}></img>
        )}
      </div>
    );
  };

  // hack to deal with leaflet getting handed the wrong window size before it calls invalidateSize on load
  const MapResizer = () => {
    const mapResizer = useMap();
    setTimeout(() => {
      mapResizer.invalidateSize();
    }, 100);
    return null;
  };

  return (
    <ReactLeafletMapContainer
      center={[55, -128]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      whenCreated={setMap}
      tap={false}>
      {/* <LayerComponentGoesHere></LayerComponentGoesHere> */}
      <MapRequestContextProvider>
        <div className={toolClass.toolBtnsLoc}>
          <SetPointOnClick map={map} setPoiMarker={setPoiMarker} />
          <DisplayPosition map={map} setPoiMarker={setPoiMarker} />
          <MeasureTool />
          {props.showDrawControls && (
            <FeatureGroup>
              <EditTools isPlanPage={props.isPlanPage} geometryState={props.geometryState} />
            </FeatureGroup>
          )}
          {/*<LayerPicker data={data} />*/}
        </div>

        {/* Here is the offline component */}
        <Offline />

        <ZoomControl position="bottomright" />
        <LayerPicker position="topright" map={map} data={data} inputGeo={props.geometryState.geometry} />

        {/* Here are the editing tools */}

        <MapResizer />

        {poiMarker && (
          <Marker
            position={[poiMarker.geometry.geometry.coordinates[1], poiMarker.geometry.geometry.coordinates[0]]}
            icon={markerIcon}>
            <Tooltip direction="top" opacity={0.5} permanent>
              <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
                {poiMarker.species.map((s) => (
                  <>{s} </>
                ))}
              </div>
            </Tooltip>
          </Marker>
        )}

        {/*<LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Regular Layer">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="Activities">
            {/*<TempPOILoader pointOfInterestFilter={props.pointOfInterestFilter}></TempPOILoader>}
            {/* this line below works - its what you need for geosjon}
            <GeoJSON data={props.interactiveGeometryState?.interactiveGeometry} style={interactiveGeometryStyle} />
            {/* <GeoJSON data={vanIsland} style={interactiveGeometryStyle} onEachFeature={setupFeature} /> }
          </LayersControl.Overlay>
        </LayersControl>*/}
      </MapRequestContextProvider>
    </ReactLeafletMapContainer>
  );
};

export default MapContainer;
