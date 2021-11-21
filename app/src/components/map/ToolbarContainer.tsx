import React from 'react';
import { LayersControlProvider } from './LayerPicker/layerControlContext';
import { LayerPicker } from './LayerPicker/LayerPicker';
import DisplayPosition from './Tools/ToolTypes/Nav/DisplayPosition';
import EditRecord from './Tools/ToolTypes/Data/SelectOrEdit';
import { SetPointOnClick } from './Tools/ToolTypes/Data/InfoAreaDescription';
import JumpToActivity from './Tools/ToolTypes/Nav/JumpToActivity';
import JumpToTrip from './Tools/ToolTypes/Nav/JumpToTrip';
import MeasureTool from './Tools/ToolTypes/Misc/MeasureTool';
import NewRecord from './Tools/ToolTypes/Data/NewRecord';
import { ZoomControl } from './Tools/ToolTypes/Misc/ZoomControl';

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
      <div className={positionClass}>
        <div
          className="leaflet-control"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', padding: 10, gap: 10 }}>
          <LayerPicker
            map={props.map}
            layers={props.layer}
            inputGeo={props.inputGeo}
            setWel
            lIdandProximity={props.setWellIdandProximity}
          />
          <SetPointOnClick map={props.map} />
          <DisplayPosition map={props.map} />
          <MeasureTool />
          <ZoomControl mapMaxNativeZoom={props.mapMaxNativeZoom} setMapMaxNativeZoom={props.setMapMaxNativeZoom} />
          <JumpToTrip />
          <NewRecord />
          <EditRecord />
          <JumpToActivity id={props.activityId} />
        </div>
      </div>
    </LayersControlProvider>
  );
};
