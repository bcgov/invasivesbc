import { Feature } from 'geojson';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import 'leaflet.offline';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  FeatureGroup,
  MapContainer as ReactLeafletMapContainer,
  ScaleControl,
  useMap,
  ZoomControl as ZoomButtons
} from 'react-leaflet';
import booleanWithin from '@turf/boolean-within';
import booleanOverlap from '@turf/boolean-overlap';
import { IPointOfInterestSearchCriteria } from '../../interfaces/useInvasivesApi-interfaces';
// Layer Picker
import './MapContainer.css';
import { ToolbarContainer } from './ToolbarContainer';
import EditTools from './Tools/ToolTypes/Data/EditTools';
import 'leaflet-editable';
import ReactLeafletEditable from 'react-leaflet-editable';

import { FlyToAndFadeContextProvider } from './Tools/ToolTypes/Nav/FlyToAndFade';
import { MapRecordsContext } from 'contexts/MapRecordsContext';
import MapRecordsDataGrid from './MapRecordsDataGrid';
import OfflineMap from './OfflineMap';
import { MapRequestContextProvider } from 'contexts/MapRequestsContext';
import Layers from './Layers/Layers';
import MapLocationControlGroup from './Tools/ToolTypes/Nav/MapLocationControlGroup';
import { NamedBoundaryMenu } from './NamedBoundaryMenu';
import ZoomControl from './Tools/ToolTypes/Misc/ZoomControl';
import { OnMapClickDetails } from './Tools/ToolTypes/Data/OnMapClickDetails';
import { ToggleClickDetailsButton } from './Tools/ToolTypes/Data/ToggleClickDetailsButton';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export type MapControl = (map: any, ...args: any) => void;

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
export const q = async.queue(function async(task, callback) {
  console.log('Working on layer: ' + task.layer);
  console.log('Waiting to be processed: ' + q.length() + ' items.');
  console.log('-----------------------------------');
  q.remove((worker: any) => {
    if (worker.data) {
      if (task.layer === worker.data.layer && booleanWithin(task.extent, worker.data.extent)) {
        console.log(
          '%cReceived a request for the layer that has already been requested and which area is within the old request area. Deleting old request...',
          'color:red'
        );
        return true;
      }
      if (!booleanWithin(worker.data.extent, task.extent) && !booleanOverlap(worker.data.extent, task.extent)) {
        console.log(
          '%cThe new extent does not overlap with and not inside of previous extent. Deleting all the old requests...',
          'color:red'
        );
        return true;
      }
    }
    return false;
  });

  task.func();
  callback();
}, 1);

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  showDrawControls: boolean;
  setShowDrawControls: React.Dispatch<boolean>;
  showBoundaryMenu?: boolean;
  setBoundaryMenu?: React.Dispatch<boolean>;
  zoom?: any;
  center?: any;
  isPlanPage?: boolean;
  activityId?: string;
  activity?: any;
  cacheMapTilesFlag?: any;
  pointOfInterestFilter?: IPointOfInterestSearchCriteria;
  geometryState: { geometry: any[]; setGeometry: (geometry: Feature[]) => void };

  setMapForActivityPage?: React.Dispatch<any>;
  contextMenuState?: { state: any; setContextMenuState: (state: any) => void };
  isLoading?: boolean;
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  //to support the zoom control component controlling the parent map container:
  // removed because redundent: const [mapZoom, setMapZoom] = useState<number>(5);
  const mapMaxZoom: number = 30;
  const [mapMaxNativeZoom, setMapMaxNativeZoom] = useState<number>(17);
  const [clickDetailsEnabled, setClickDetailsEnabled] = useState<boolean>(false);
  const [map, setMap] = useState<any>(null);
  const editRef = useRef();

  useEffect(() => {
    if (props.setMapForActivityPage) {
      try {
        props.setMapForActivityPage(map);
      } catch (e) {
        // console.error(e);
      }
    }
  }, [map]);

  // hack to deal with leaflet getting handed the wrong window size before it calls invalidateSize on load
  const MapResizer = () => {
    const mapResizer = useMap();
    setTimeout(() => {
      try {
        mapResizer.invalidateSize();
      } catch (e) {
        console.log('setTimeout error');
      }
    }, 100);
    return null;
  };
  const mapRecordsContext = useContext(MapRecordsContext);

  // to support filtering and geo editing
  useEffect(() => {
    mapRecordsContext.setEditRef(editRef);
  }, [mapRecordsContext]);

  return (
    <ReactLeafletEditable
      ref={editRef}
      map={map}
      // if you want to edit geometries, set the appropriate handlers first via
      // mapRecordsContext.setLeafletEditbaleHandlers

      //handlers to pull from can be found in ___
      onShapeDelete={mapRecordsContext.leafletEditableHandlers.onShapeDelete}
      onShapeDeleted={mapRecordsContext.leafletEditableHandlers.onShapeDeleted}
      onEditing={mapRecordsContext.leafletEditableHandlers.onEditing}
      onEnable={mapRecordsContext.leafletEditableHandlers.onEnable}
      onDisable={mapRecordsContext.leafletEditableHandlers.onDisable}
      onStartDrawing={mapRecordsContext.leafletEditableHandlers.onStartDrawing}
      onDrawingClick={mapRecordsContext.leafletEditableHandlers.onDrawingClick}
      onEndDrawing={mapRecordsContext.leafletEditableHandlers.onEndDrawing}
      onDrawingCommit={mapRecordsContext.leafletEditableHandlers.onDrawingCommit}
      onDrawingMouseDown={mapRecordsContext.leafletEditableHandlers.onDrawingMouseDown}
      onDrawingMouseUp={mapRecordsContext.leafletEditableHandlers.onDrawingMouseUp}
      onDrawingMove={mapRecordsContext.leafletEditableHandlers.onDrawingMove}
      onCancelDrawing={mapRecordsContext.leafletEditableHandlers.onCancelDrawing}
      onDragStart={mapRecordsContext.leafletEditableHandlers.onDragStart}
      onDrag={mapRecordsContext.leafletEditableHandlers.onDrag}
      onDragEnd={mapRecordsContext.leafletEditableHandlers.onDragEnd}
      onVertexMarkerDrag={mapRecordsContext.leafletEditableHandlers.onVertexMarkerDrag}
      onVertexMarkerDragStart={mapRecordsContext.leafletEditableHandlers.onVertexMarkerDragStart}
      onVertexMarkerDragEnd={mapRecordsContext.leafletEditableHandlers.onVertexMarkerDragEnd}
      onVertextCtrlClick={mapRecordsContext.leafletEditableHandlers.onVertextCtrlClick}
      onNewVertex={mapRecordsContext.leafletEditableHandlers.onNewVertex}
      onVertexMarkerClick={mapRecordsContext.leafletEditableHandlers.onVertexMarkerClick}
      onVertexRawMarkerClick={mapRecordsContext.leafletEditableHandlers.onVertexRawMarkerClick}
      onVertexDeleted={mapRecordsContext.leafletEditableHandlers.onVertexDeleted}
      onVertexMarkerCtrlClick={mapRecordsContext.leafletEditableHandlers.onVertexMarkerCtrlClick}
      onVertexMarkerShiftClick={mapRecordsContext.leafletEditableHandlers.onVertexMarkerShiftClick}
      onVertexMarkerMetaKeyClick={mapRecordsContext.leafletEditableHandlers.onVertexMarkerMetaKeyClick}
      onVertexMarkerAltClick={mapRecordsContext.leafletEditableHandlers.onVertexMarkerAltClick}
      onVertexMarkerContextMenu={mapRecordsContext.leafletEditableHandlers.onVertexMarkerContextMenu}
      onVertexMarkerMouseDown={mapRecordsContext.leafletEditableHandlers.onVertexMarkerMouseDown}
      onVertexMarkerMouseOver={mapRecordsContext.leafletEditableHandlers.onVertexMarkerMouseOver}
      onVertexMarkerMouseOut={mapRecordsContext.leafletEditableHandlers.onVertexMarkerMouseOut}
      onMiddleMarkerMouseDown={mapRecordsContext.leafletEditableHandlers.onMiddleMarkerMouseDown}
      //mapRecordsContext.editRef?.current?.clearAll();
    >
      <ReactLeafletMapContainer
        editable={true}
        center={props.center ? props.center : [55, -128]}
        zoom={props.zoom ? props.zoom : 5 /* was mapZoom */}
        bounceAtZoomLimits={true}
        maxZoom={mapMaxZoom}
        minZoom={6}
        style={{ height: 'calc(100%)', width: '100%' }}
        zoomControl={false}
        whenCreated={setMap}
        preferCanvas={true}
        tap={true}>
        <FlyToAndFadeContextProvider>
          <MapRequestContextProvider>
            {useMemo(
              () => (
                <Layers inputGeo={props.geometryState.geometry} />
              ),
              [props.geometryState.geometry]
            )}
            <ZoomButtons position="bottomleft" />
            <ScaleControl position="bottomleft" imperial={false} />

            {props.showDrawControls && (
              <FeatureGroup>
                <EditTools isPlanPage={props.isPlanPage} geometryState={props.geometryState} />
              </FeatureGroup>
            )}

            {/* Offline component */}
            {useMemo(
              () => (
                <OfflineMap {...props} mapMaxNativeZoom={mapMaxNativeZoom} map={map} />
              ),
              [mapMaxNativeZoom]
            )}

            {/* List of functions is located in this component */}

            {/* {useMemo(() => {
              return (
                <ToolbarContainer
                  position="topright"
                  id={props.activityId}
                  map={map}
                  inputGeo={props.geometryState.geometry}
                  mapMaxNativeZoom={mapMaxNativeZoom}
                  setMapMaxNativeZoom={setMapMaxNativeZoom}>
                  <ZoomControl mapMaxNativeZoom={mapMaxNativeZoom} setMapMaxNativeZoom={setMapMaxNativeZoom} />
                </ToolbarContainer>
              );
            }, [mapMaxNativeZoom, setMapMaxNativeZoom, props.geometryState.geometry, props.activityId, map])}
            {props?.showBoundaryMenu && (
              <NamedBoundaryMenu
                {...props}
                position="topleft"
                id={props.activityId}
                map={map}
                inputGeo={props.geometryState.geometry}
              />
            )}

            */}

            <MapResizer />
            {/*
            <ToggleClickDetailsButton
              clickDetailsEnabled={clickDetailsEnabled}
              setClickDetailsEnabled={setClickDetailsEnabled}
            />
            <OnMapClickDetails clickDetailsEnabled={clickDetailsEnabled} />

            {useMemo(
              () => (
                <MapLocationControlGroup {...props} />
              ),
              [props.geometryState.geometry]

            )} */}

            {props.children}
          </MapRequestContextProvider>
        </FlyToAndFadeContextProvider>
      </ReactLeafletMapContainer>
    </ReactLeafletEditable>
  );
};

export default MapContainer;
