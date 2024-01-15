import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as L from 'leaflet';
import { useMap } from 'react-leaflet';
import { IconButton, Tooltip } from '@mui/material';
import { toolStyles } from 'UI/Styles/ToolStyles';
import { useSelector } from 'util/use_selector';
import { MAP_TOGGLE_HD } from 'state/actions';
import 'UI/Global.css';

import HdIcon from '@mui/icons-material/Hd';
import SdIcon from '@mui/icons-material/Sd';

export const HDToggle = (props) => {
  const map = useMap();
  const dispatch = useDispatch();
  const toolClass = toolStyles();
  const HDToggle = useSelector((state: any) => state.Map?.HDToggle);
  const baseMapToggle = useSelector((state: any) => state.Map?.baseMapToggle);
  const divRef = useRef();

  const [show, setShow] = React.useState(false);

  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);

  if (!baseMapToggle && map) {
    return (
      <div ref={divRef} className="map-btn">
        <Tooltip
          open={show}
          classes={{ tooltip: 'toolTip' }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={`Max Zoom Resolution: ${HDToggle ? 'Low Def' : 'High Def'}`}
          placement="top-end">
          <span>
            <IconButton
              onClick={() => {
                dispatch({ type: MAP_TOGGLE_HD });
              }}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                ' ' +
                (HDToggle ? toolClass.selected : toolClass.notSelected)
              }
              sx={{ color: '#000' }}>
              {HDToggle ? <HdIcon /> : <SdIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};
