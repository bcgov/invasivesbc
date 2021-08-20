import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';
import { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import React, { useContext, useEffect, useRef, useState } from 'react';
//import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MapContainer2.css';
import * as turf from '@turf/turf';
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  useMap,
  FeatureGroup,
  useMapEvents,
  useMapEvent,
  ZoomControl
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
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

// Layer Picker
import { LayerPicker } from './LayerPicker/SortableHelper';
import data from './LayerPicker/GEO_DATA.json';
import DisplayPosition from './Tools/DisplayPosition';
import { debounced } from 'utils/FunctionUtils';
import { createPolygonFromBounds } from './LayerLoaderHelpers/LtlngBoundsToPoly';
import { MapRequestContextProvider, MapRequestContext } from 'contexts/MapRequestsContext';
import MeasureTool from './Tools/MeasureTool';
import { makeStyles, Theme } from '@material-ui/core';
import EditTools from './Tools/EditTools';
import { RenderKeyFeaturesNearFeature } from './LayerLoaderHelpers/DataBCRenderFeaturesNearFeature';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    height: '100%',
    width: '100%'
  }
}));

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

export const async = require('async');
export const q = async.queue(function (task, callback) {
  setTimeout(() => {
    console.log('Working on task: ' + JSON.stringify(task));
    callback();
  }, 2000);
}, 1);

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  showDrawControls: boolean;
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

const interactiveGeometryStyle = () => {
  return {
    color: '#ff7800',
    weight: 5,
    opacity: 0.65
  };
};

const MapContainer2: React.FC<IMapContainerProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const [menuState, setMenuState] = useState(false);

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

  // hack to deal with leaflet getting handed the wrong window size before it calls invalidateSize on load
  const MapResizer = () => {
    const map = useMap();
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return null;
  };

  const AsyncExtent = () => {
    const mapRequestContext = useContext(MapRequestContext);
    const { layersSelected } = mapRequestContext;
    const [lastRequestPushed, setLastRequestPushed] = useState(null);

    const map = useMapEvent('moveend', () => {
      let newArray = [];
      layersSelected.forEach((layer) => {
        if (layer.enabled) newArray.push(layer.id);
      });

      q.remove((worker) => {
        if (worker.data && lastRequestPushed?.extent) {
          if (
            !turf.booleanWithin(worker.data.extent, lastRequestPushed.extent) &&
            !turf.booleanOverlap(worker.data.extent, lastRequestPushed.extent)
          ) {
            console.log('%cThe new extent does not overlap with and not inside of previous extent!', 'color:red');
            return true;
          }
          if (!newArray.includes(worker.data.layer)) {
            console.log('%cThe worker in a queue no longer needed as the layers have been changed!', 'color:red');
            return true;
          }
        }
        return false;
      });

      if (newArray.length > 0) {
        newArray.forEach((layer) => {
          q.push({ extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(), layer: layer });
          setLastRequestPushed({ extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(), layer: layer });
        });
      }
    });

    return null;
  };

  const [map, setMap] = useState<any>(null);

  return (
    <MapContainer
      center={[55, -128]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      whenCreated={setMap}>
      {/* <LayerComponentGoesHere></LayerComponentGoesHere> */}
      <MapRequestContextProvider>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            flexFlow: 'column wrap',
            height: '45vh'
          }}>
          <LayerPicker data={data} />
          <DisplayPosition map={map} />
          <MeasureTool />
          {props.showDrawControls && (
            <FeatureGroup>
              <EditTools geometryState={props.geometryState} />
            </FeatureGroup>
          )}
        </div>

        {/* Here is the offline component */}
        <Offline />

        <ZoomControl position="bottomleft" />

        {/* Here are the editing tools */}

        <MapResizer />
        <AsyncExtent />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Regular Layer">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="Activities">
            {/*<TempPOILoader pointOfInterestFilter={props.pointOfInterestFilter}></TempPOILoader>*/}
            {/* this line below works - its what you need for geosjon*/}
            <GeoJSON data={props.interactiveGeometryState?.interactiveGeometry} style={interactiveGeometryStyle} />
            {/* <GeoJSON data={vanIsland} style={interactiveGeometryStyle} onEachFeature={setupFeature} /> */}
          </LayersControl.Overlay>
        </LayersControl>
      </MapRequestContextProvider>
      {props.geometryState.geometry ? (
        <RenderKeyFeaturesNearFeature
          inputGeo={props.geometryState?.geometry[0]}
          dataBCLayerName="WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW"
          proximityInMeters={550}
          setWellIdandProximity={props.setWellIdandProximity}
        />
      ) : (
        <></>
      )}
    </MapContainer>
  );
};

export default MapContainer2;
