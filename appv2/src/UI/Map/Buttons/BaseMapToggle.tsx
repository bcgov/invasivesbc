import { IconButton, Tooltip } from "@mui/material";
import L from "leaflet";
import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useDispatch } from "react-redux";
import { MAP_TOGGLE_BASEMAP } from "state/actions";
import { selectMap } from "state/reducers/map";
import { toolStyles } from "UI/Styles/ToolStyles";
import { useSelector } from "util/use_selector";
import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';

export const BaseMapToggle = (props) => {
  const map = useMap();
  const mapState = useSelector(selectMap);
  const dispatch = useDispatch();

  const [show, setShow] = React.useState(false);

  const toolClass = toolStyles();

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
        bottom: '64%',
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
              (mapState.baseMapToggle ? toolClass.selected : toolClass.notSelected)
            }
            sx={{ color: '#000' }}>
            {mapState.baseMapToggle ? <LayersClearIcon /> : <LayersIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};