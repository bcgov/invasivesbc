import { Feature } from 'geojson';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import booleanOverlap from '@turf/boolean-overlap';
import booleanWithin from '@turf/boolean-within';
import 'leaflet.offline';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  FeatureGroup,
  MapContainer as ReactLeafletMapContainer,
  Marker,
  Popup,
  ScaleControl,
  useMap,
  ZoomControl as ZoomButtons
} from 'react-leaflet';
import { IPointOfInterestSearchCriteria } from '../../interfaces/useInvasivesApi-interfaces';
// Layer Picker
import './MapContainer.css';
import EditTools from './Tools/ToolTypes/Data/EditTools';
// import 'leaflet-editable';

import centroid from '@turf/centroid';
import async from 'async';
import 'leaflet-editable';
// import ReactLeafletEditable from 'react-leaflet-editable';
import './MapContainer.css';

import { MapRecordsContext } from 'contexts/MapRecordsContext';
import { MapRequestContextProvider } from 'contexts/MapRequestsContext';
import { useSelector } from 'react-redux';
import { selectActivity } from 'state/reducers/activity';
import { selectIappsite } from 'state/reducers/iappsite';
import { selectUserSettings } from 'state/reducers/userSettings';
import ActivityIconUrl from './Icons/activity-icon.png';
import IappIconUrl from './Icons/iapp-icon.png';
import { LayerPickerBasic } from './LayerPickerBasic';
import { NamedBoundaryMenu } from './NamedBoundaryMenu';
import OfflineMap from './OfflineMap';
import { AccuracyMarker, AccuracyToggle } from './Tools/ToolTypes/Nav/AccuracyToggle';
import { BaseMapToggle } from './Tools/ToolTypes/Nav/BaseMapToggle';
import { FindMeToggle, LocationMarker, PanToMe } from './Tools/ToolTypes/Nav/FindMe';
import { FlyToAndFadeContextProvider } from './Tools/ToolTypes/Nav/FlyToAndFade';
import { HDToggle } from './Tools/ToolTypes/Nav/HDToggle';

//workaround for: https://github.com/vitejs/vite/issues/2139
import ReactLeafletEditableFix from 'react-leaflet-editable';
import { LayerSniffer } from './Tools/ToolTypes/Data/LeafetPickerListener';
import { WhatsHereButton } from './Tools/ToolTypes/Data/WhatsHereButton';
import { WhatsHereDrawComponent } from './Tools/ToolTypes/Data/WhatsHereDrawComp';
import { WhatsHereCurrentRecordHighlighted, WhatsHereMarker } from './Tools/ToolTypes/Data/WhatsHereMarkerAndPopup';
import { selectTabs } from 'state/reducers/tabs';
import { ExtentListener } from './ExtentListener';
import { selectMap } from 'state/reducers/map';
import { JumpToRecord } from './Tools/ToolTypes/Nav/JumpToRecord';
import { LegendsButton } from './Tools/ToolTypes/Data/LegendsButton';
import { LabelButton } from './Tools/ToolTypes/Data/LabelButton';
import { LegendsPopup } from './Tools/ToolTypes/Data/LegendsPopup';
import { BoundaryLayerDisplayForRecordSetToggle } from './LayerLoaderHelpers/BoundaryLayerDisplayForRecordSetToggle';
import { IAPPExtentButton } from './Tools/ToolTypes/Data/IAPPExtentButton';
import { PMTileLayer } from './Layers/PMTileLayer';

const ReactLeafletEditable = ReactLeafletEditableFix.default
  ? ReactLeafletEditableFix.default
  : ReactLeafletEditableFix;

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});

const IappIcon = L.icon({
  iconUrl: IappIconUrl,
  iconSize: [20, 30],
  iconAnchor: [10, 30]
});

const ActivityIcon = L.icon({
  iconUrl: ActivityIconUrl,
  iconSize: [20, 30],
  iconAnchor: [10, 30]
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

  const userSettingsState = useSelector(selectUserSettings);
  const activityState = useSelector(selectActivity);
  const IappsiteState = useSelector(selectIappsite);

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

  useEffect(() => {
    if (map && userSettingsState?.mapCenter)
      map.flyTo([userSettingsState?.mapCenter[1], userSettingsState?.mapCenter[0]]);
  }, [userSettingsState?.mapCenter]);

  const tabsState = useSelector(selectTabs);
  const mapState = useSelector(selectMap);

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
      <LegendsPopup />
      <ReactLeafletMapContainer
        editable={true}
        //center={[55, -128]}
        center={mapState.center}
        //zoom={props.zoom ? props.zoom : 5 /* was mapZoom */}
        zoom={mapState.zoom}
        bounceAtZoomLimits={true}
        maxZoom={mapMaxZoom}
        minZoom={1}
        style={{ height: 'calc(100%)', width: '100%' }}
        zoomControl={false}
        whenCreated={setMap}
        preferCanvas={true}
        wheelPxPerZoomLevel={60}
        tap={true}>
        <FlyToAndFadeContextProvider>
          <MapRequestContextProvider>
            <ZoomButtons position="bottomleft" />
            <ScaleControl position="bottomleft" imperial={false} />

            {
              <FeatureGroup>
                <EditTools isPlanPage={props.isPlanPage} geometryState={props.geometryState} />
              </FeatureGroup>
            }

            <OfflineMap {...props} />

            {props?.showBoundaryMenu && (
              <NamedBoundaryMenu
                {...props}
                position="topleft"
                id={props.activityId}
                map={map}
                inputGeo={props.geometryState.geometry}
              />
            )}

            <MapResizer />
            <AccuracyToggle />
            <AccuracyMarker />
            <BaseMapToggle />
            <HDToggle />
            <LocationMarker />
            <FindMeToggle />
            <PanToMe />
            <JumpToRecord/>
            <LegendsButton />
            <LabelButton />
            <IAPPExtentButton />
            <BoundaryLayerDisplayForRecordSetToggle/>
            <PMTileLayer url='https://nrs.objectstore.gov.bc.ca/uphjps/riso.pmtiles'/>

            {!tabsState?.tabConfig[tabsState.activeTab]?.path.includes('activity') ? (
              <>
                <WhatsHereButton />
                <WhatsHereDrawComponent />
                <WhatsHereMarker />
                <WhatsHereCurrentRecordHighlighted />
              </>
            ) : (
              <></>
            )}

            {props.children}

            {activityState?.activity?.geometry && activityState.activity.geometry[0]? (
              <Marker
                key={Math.random()}
                icon={ActivityIcon}
                position={[
                  centroid(activityState?.activity?.geometry[0]).geometry.coordinates[1],
                  centroid(activityState?.activity?.geometry[0]).geometry.coordinates[0]
                ]}>
                <Popup closeButton={false}>{activityState.activity.short_id}</Popup>
              </Marker>
            ) : (
              <></>
            )}

            {IappsiteState?.IAPP?.geom ? (
              <Marker
                key={'iappselectmarker'}
                icon={IappIcon}
                position={[
                  centroid(IappsiteState?.IAPP?.geom).geometry.coordinates[1],
                  centroid(IappsiteState?.IAPP?.geom).geometry.coordinates[0]
                ]}>
                <Popup closeButton={false}>{IappsiteState?.IAPP?.point_of_interest_id}</Popup>
              </Marker>
            ) : (
              <></>
            )}

            <LayerSniffer />
            <LayerPickerBasic></LayerPickerBasic>
          </MapRequestContextProvider>
        </FlyToAndFadeContextProvider>
      </ReactLeafletMapContainer>
    </ReactLeafletEditable>
  );
};

export default MapContainer;
