import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { IconButton, Tooltip } from '@mui/material';
import { Feature } from 'geojson';
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_BASEMAP } from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';
import { useMap } from 'react-leaflet';
import { selectUserSettings } from 'state/reducers/userSettings';

export interface IMapLocationControlGroupProps {
  classes?: any;
  mapId: string;
  showDrawControls: boolean;
  geometryState: { geometry: any[]; setGeometry: (geometry: Feature[]) => void };
  setMapMaxNativeZoom?: React.Dispatch<React.SetStateAction<number>>;
}

export const BaseMapToggle = (props) => {
  //refactor stuff for topo button
  const map = useMap();
  const mapState = useSelector(selectMap);
  const {darkTheme} = useSelector(selectUserSettings);
  const dispatch = useDispatch();

  const [show, setShow] = React.useState(false);

  // const map = useMap(); // Get the map from the context
  // const group = ; // Create a group to hold the drawn features
  const toolClass = toolStyles(); // Get the classes from the context

  const divRef = useRef();
  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);
  if (!mapState || !map) {
    return <></>;
  }
  return (
    <div
      ref={divRef}
      className="leaflet-bottom leaflet-right"
      style={{
        bottom: '180px',
        width: '50px',
        height: '40px'
      }}>
      <Tooltip
        open={show}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title={mapState.baseMapToggle ? 'Imagery Map' : 'Topographical Map'}
        placement="left-start">
        <span>
          <IconButton
            onClick={() => {
              dispatch({ type: MAP_TOGGLE_BASEMAP });
            }}
            className={
              'leaflet-control-zoom leaflet-bar leaflet-control ' +
              //classes.customHoverFocus +
              ' ' +
              (mapState.baseMapToggle ? toolClass.selected : (darkTheme? toolClass.notSelectedDark : toolClass.notSelected))
            }
            sx={{ color: '#000' }}>
            {mapState.baseMapToggle ? <LayersClearIcon /> : <LayersIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
