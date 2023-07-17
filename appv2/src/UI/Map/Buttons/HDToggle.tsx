import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import * as L from "leaflet";
import { useMap } from "react-leaflet";
import { IconButton, Tooltip } from "@mui/material";
import { toolStyles } from "UI/Styles/ToolStyles";
import { useSelector } from "util/use_selector";
import { selectMap } from "state/reducers/map";
import { MAP_TOGGLE_HD } from "state/actions";

import HdIcon from '@mui/icons-material/Hd';
import SdIcon from '@mui/icons-material/Sd';

export const HDToggle = (props) => {
  const map = useMap();
  const dispatch = useDispatch();
  const toolClass = toolStyles();
  const mapState = useSelector(selectMap);
  const divRef = useRef();

  const [show, setShow] = React.useState(false);

  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);
  
  if (mapState && !mapState?.baseMapToggle && map) {
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '70%',
          width: '50px',
          height: '40px'
        }}>
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={`Max Zoom Resolution: ${mapState.HDToggle ? 'Low Def' : 'High Def'}`}
          placement="left-start">
          <span>
            <IconButton
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
  } else {
    return <></>;
  }
};