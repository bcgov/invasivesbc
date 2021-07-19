import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';
import { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import React, { useContext, useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MapContainer2.css';
import { LeafletContextInterface, useLeafletContext } from '@react-leaflet/core';
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  useMap,
  FeatureGroup,
  useMapEvents,
  useMapEvent
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import marker from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { interactiveGeoInputData } from './GeoMeta';
import Spinner from 'components/spinner/Spinner';

// Offline dependencies
import localforage from 'localforage';
import 'leaflet.offline';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { IPointOfInterestSearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { useDataAccess } from 'hooks/useDataAccess';
import TempPOILoader from './LayerLoaderHelpers/TempPOILoader';
import { Box, Grid } from '@material-ui/core';

// Layer Picker
import LayersIcon from '@material-ui/icons/Layers';

import { LayerPicker } from './LayerPicker/SortableHelper';
import data from './LayerPicker/GEO_DATA.json';
import { DomEvent } from 'leaflet';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

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
  pointOfInterestFilter?: IPointOfInterestSearchCriteria;
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

const interactiveGeometryStyle = () => {
  return {
    color: '#ff7800',
    weight: 5,
    opacity: 0.65
  };
};

export const ClickBlocker = (props) => {
  const divContainer = useRef<HTMLDivElement>(null);
  /*useEffect(() => {
    if (divContainer.current) {
      DomEvent.disableClickPropagation(divContainer.current);
      DomEvent.disableScrollPropagation(divContainer.current);
    }
  });
  */

  const map = useMap();

  /*const mapClick = useMapEvent('click', (e) => {
    console.log('blocking click from leaflet side');
    console.dir(e);
    (e.originalEvent.view as any).L.DomEvent.preventDefault(e);
    (e.originalEvent.view as any).L.DomEvent.stopPropagation(e);
  });
  const mapScroll = useMapEvent('mousedown', (e) => {
    console.log('blocking click from leaflet side - drag');
    console.dir(e);
    (e.originalEvent.view as any).L.DomEvent.preventDefault(e);
    (e.originalEvent.view as any).L.DomEvent.stopPropagation(e);
  });
  */
  return (
    <div
      ref={divContainer}
      onMouseOver={() => {
        console.log('disabling drag');
        map.dragging.disable();
      }}
      onMouseOut={() => {
        console.log('enabling drag');
        map.dragging.enable();
      }}
      style={{
        left: 800,
        top: 0,
        width: 200,
        height: 800,
        background: 'green',
        zIndex: 400,
        position: 'absolute'
      }}></div>
  );
};

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

  const [menuState, setMenuState] = useState(false);

  const vanIsland: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-123.31054687499999, 48.3416461723746],
              [-122.82714843749999, 48.69096039092549],
              [-122.6953125, 49.69606181911566],
              [-125.68359374999999, 50.875311142200765],
              [-129.0673828125, 51.39920565355378],
              [-128.1884765625, 49.55372551347579],
              [-123.31054687499999, 48.3416461723746]
            ]
          ]
        }
      }
    ]
  };

  const setupFeature = (feature, layer) => {
    let popupContent = 'POP UP STUFFFFFFFFFFFFFFFFFFFFFFFFFF';
    for (let i = 0; i < 100; i++) {
      popupContent += '\nFFFFFFFFFFFF';
    }
    layer.bindPopup(popupContent);
  };

  return (
    <MapContainer center={[55, -128]} zoom={5} style={{ height: '100%' }} zoomControl={true}>
      {/* <LayerComponentGoesHere></LayerComponentGoesHere> */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: '70vh'
        }}>
        <button
          style={{ background: 'white', zIndex: 500 }}
          onClick={() => {
            setMenuState(!menuState);
          }}>
          <LayersIcon style={{ fontSize: 35 }} />
        </button>
        {menuState ? (
          <div style={{ background: 'white', zIndex: 500, width: '400px' }}>
            <LayerPicker data={data} />
          </div>
        ) : (
          <></>
        )}
      </div>

      <div></div>
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
          {/*<TempPOILoader pointOfInterestFilter={props.pointOfInterestFilter}></TempPOILoader>*/}
          {/* this line below works - its what you need for geosjon*/}
          {/* <GeoJSON data={props.interactiveGeometryState.interactiveGeometry} style={interactiveGeometryStyle} />*/}
          <GeoJSON data={vanIsland} style={interactiveGeometryStyle} onEachFeature={setupFeature} />
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
};

export default MapContainer2;
