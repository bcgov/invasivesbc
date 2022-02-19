import { Capacitor } from '@capacitor/core';
import React from 'react';
import { LayersControlProvider } from './LayerPicker/layerControlContext';
import { LayerPicker } from './LayerPicker/LayerPicker';
import { SetPointOnClick } from './Tools/ToolTypes/Data/InfoAreaDescription';
import MultiSelectOrEdit from './Tools/ToolTypes/Data/MultiSelectOrEdit';
import NewRecord from './Tools/ToolTypes/Data/NewRecordMainMap';
import EditRecord from './Tools/ToolTypes/Data/SelectOrEdit';
import DrawButtonList from './Tools/ToolTypes/GeoEdit/EditTools';
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
          <DisplayPosition map={props.map} />
          <MeasureTool />
          <ZoomControl mapMaxNativeZoom={props.mapMaxNativeZoom} setMapMaxNativeZoom={props.setMapMaxNativeZoom} />
          {Capacitor.getPlatform() !== 'web' ? <JumpToTrip /> : <></>}
          {/*
          <NewRecordMainMap />
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
