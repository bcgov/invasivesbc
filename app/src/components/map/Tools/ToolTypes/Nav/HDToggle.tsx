import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import HdIcon from '@mui/icons-material/Hd';
import SdIcon from '@mui/icons-material/Sd';
import { IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_HD } from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';

export const HDToggle = (props) => {
  const map = useMap();

  //refactor stuff for topo button
  const mapState = useSelector(selectMap);
  const dispatch = useDispatch();
  const toolClass = toolStyles();

  const divRef = useRef();
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);
  return (
    <div
      ref={divRef}
      className="leaflet-bottom leaflet-right"
      style={{
        bottom: '230px',
        width: '50px',
        height: '40px'
      }}>
      <Tooltip title={`Max Zoom Resolution: ${mapState.HDToggle ? 'Low Def' : 'High Def'}`} placement="left-start">
        <span>
          <IconButton
            //disabled={startTimer}
            onClick={() => {
              dispatch({ type: MAP_TOGGLE_HD });
            }}
            className={
              'leaflet-control-zoom leaflet-bar leaflet-control ' +
              ' ' +
              (mapState.HDToggle ? toolClass.selected : toolClass.notSelected)
            }
            sx={{ color: '#000' }}>
            {mapState.HDToggle ? <HdIcon /> : <SdIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
