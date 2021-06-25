import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';
import { Feature, GeoJsonObject } from 'geojson';
import React, { useContext, useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MapContainer2.css';
import { LeafletContextInterface, useLeafletContext } from '@react-leaflet/core';
import { GeoJSON, MapContainer, TileLayer, LayersControl, Marker, useMap, FeatureGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import marker from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { interactiveGeoInputData } from './GeoMeta';
import Spinner from 'components/spinner/Spinner';

// Offline dependencies
import localforage from 'localforage';
import 'leaflet.offline';

export type MapControl = (map: any, ...args: any) => void;

// Style the image inside the download button
const iconStyle = {
  transform: 'scale(0.7)',
  opacity: '0.7'
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
    interactiveGeometry: GeoJsonObject;
    setInteractiveGeometry: (interactiveGeometry: GeoJsonObject) => void;
  };
  extentState: { extent: any; setExtent: (extent: any) => void };
  contextMenuState: {
    state: MapContextMenuData;
    setContextMenuState: (contextMenuState: MapContextMenuData) => void;
  };
}

const MapContainer2: React.FC<IMapContainerProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const Offline = () => {
    const map = useMap();
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
    offlineLayer.addTo(map);

    let [offlineing, setOfflineing] = useState(false);

    const saveBasemapControl = (L.control as any).savetiles(offlineLayer, {
      zoomlevels: [13, 14, 15, 16, 17],
      confirm(_: any, successCallback: any) {
        successCallback(true);
      }
    });

    saveBasemapControl._map = map;

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
        {offlineing ? <Spinner></Spinner> : <img src="/assets/icon/download.svg" style={iconStyle}></img>}
      </div>
    );
  };

  const drawRef = useRef();

  const EditTools = () => {
    // This should get the 'FeatureGroup' connected to the tools
    const context = useLeafletContext() as LeafletContextInterface;

    // Grab the map object
    const map = useMap();

    // Put new feature into the FeatureGroup
    const onDrawCreate = (e: any) => {
      context.layerContainer.addLayer(e.layer);
    };

    // When the dom is rendered listen for added features
    useEffect(() => {
      map.on('draw:created', onDrawCreate);
    }, []);

    // Get out if the tools are already defined.
    if (drawRef.current) return null;

    /**
     * This is where all the editing tool options are defined.
     * See: https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html
     */
    const options = {
      edit: {
        featureGroup: context.layerContainer,
        edit: true
      }
    };

    // Create drawing tool control
    drawRef.current = new (L.Control as any).Draw(options);

    // Add drawing tools to the map
    map.addControl(drawRef.current);

    return <div></div>;
  };

  return (
    <MapContainer center={[55, -128]} zoom={5} style={{ height: '100%' }} zoomControl={false}>
      {/* Here is the offline component */}
      <Offline />

      {/* Here are the editing tools */}
      <FeatureGroup>
        <EditTools />
      </FeatureGroup>

      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Regular Layer">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>
        <LayersControl.Overlay checked name="Activities">
          {/*<MarkerClusterGroup chunkedLoading>
            (data as any).rows.map((row:any,index:any) => {
                const geom = row.point_of_interest_payload
                  .geometry[0].geometry.coordinates;
                return (<Marker
                  key={index}
                  position={[geom[1],geom[0]]}
                  icon={myIcon}
                ></Marker>);
              }
            )
          </MarkerClusterGroup>*/}
          <GeoJSON data={props.interactiveGeometryState.interactiveGeometry} />
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
};

export default MapContainer2;
