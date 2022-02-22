import { Capacitor } from '@capacitor/core';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import React, { useContext } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { LayersControlProvider } from './LayerPicker/layerControlContext';
import { LayerPicker } from './LayerPicker/LayerPicker';
import { SetPointOnClick } from './Tools/ToolTypes/Data/InfoAreaDescription';
import MeasureTool from './Tools/ToolTypes/Misc/MeasureTool';
import { ZoomControl } from './Tools/ToolTypes/Misc/ZoomControl';
import DisplayPosition from './Tools/ToolTypes/Nav/DisplayPosition';
import JumpToActivity from './Tools/ToolTypes/Nav/JumpToActivity';
import JumpToTrip from './Tools/ToolTypes/Nav/JumpToTrip';

const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right'
};

export const ToolbarContainer = (props) => {
  const mapRequestContext = useContext(MapRequestContext);
  const { setMapZoom } = mapRequestContext;

  const mapObj = useMap();
  useMapEvent('zoomend' as any, () => {
    setMapZoom(mapObj.getZoom());
  });

  const positionClass = (props.position && POSITION_CLASSES[props.position]) || POSITION_CLASSES.topright;

  return (
    <LayersControlProvider value={null}>
      <div key={'toolbar1'} className={positionClass}>
        <div
          key={'toolbar2'}
          className="leaflet-control"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', padding: 10, gap: 10 }}>
          <LayerPicker inputGeo={props.inputGeo} />
          <SetPointOnClick map={props.map} />
          {/* <DisplayPosition map={props.map} /> */}
          <MeasureTool />
          <ZoomControl mapMaxNativeZoom={props.mapMaxNativeZoom} setMapMaxNativeZoom={props.setMapMaxNativeZoom} />
          {Capacitor.getPlatform() !== 'web' ? <JumpToTrip /> : <></>}
          {/*
          <NewRecord />
          <EditRecord />
          <MultiSelectOrEdit />
          <DrawButtonList />
          */}
          <JumpToActivity id={props.id} />
        </div>
      </div>
    </LayersControlProvider>
  );
};
