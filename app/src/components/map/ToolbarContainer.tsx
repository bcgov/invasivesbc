import React from 'react';
import { LayersControlProvider } from './LayerPicker/layerControlContext';
import { LayerPicker } from './LayerPicker/LayerPicker';
import DisplayPosition from './Tools/DisplayPosition';
import { SetPointOnClick } from './Tools/InfoAreaDescription';
import JumpToActivity from './Tools/JumpToActivity';
import JumpToTrip from './Tools/JumpToTrip';
import MeasureTool from './Tools/MeasureTool';
import { ZoomControl } from './Tools/ZoomControl';

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
        <div className="leaflet-control" style={{ display: 'flex', flexDirection: 'column' }}>
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
          <JumpToActivity id={props.activityId} />
        </div>
      </div>
    </LayersControlProvider>
  );
};
