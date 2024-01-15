import { IconButton, Tooltip } from '@mui/material';
import L from 'leaflet';
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_BASEMAP } from 'state/actions';
import { toolStyles } from 'UI/Styles/ToolStyles';
import { useSelector } from 'util/use_selector';
import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import 'UI/Global.css';

export const BaseMapToggle = (props) => {
  const map = useMap();
  const baseMapToggle = useSelector((state: any) => state.Map?.baseMapToggle);
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
  if (!map) {
    return <></>;
  }
  return (
    <div ref={divRef} className="map-btn">
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title={baseMapToggle ? 'Imagery Map' : 'Topographical Map'}
        placement="top-end">
        <span>
          <IconButton
            onClick={() => {
              dispatch({ type: MAP_TOGGLE_BASEMAP });
            }}
            className={
              'leaflet-control-zoom leaflet-bar leaflet-control ' +
              //classes.customHoverFocus +
              ' ' +
              (baseMapToggle ? toolClass.selected : toolClass.notSelected)
            }
            sx={{ color: '#000' }}>
            {baseMapToggle ? <LayersClearIcon /> : <LayersIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
