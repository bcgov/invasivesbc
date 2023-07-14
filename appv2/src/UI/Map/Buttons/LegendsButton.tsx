import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import * as L from "leaflet";
import { useMap } from "react-leaflet";
import { IconButton, Tooltip } from "@mui/material";
import { toolStyles } from "UI/Styles/ToolStyles";
import { useSelector } from "util/use_selector";
import { selectMap } from "state/reducers/map";
import { MAP_TOGGLE_LEGENDS } from "state/actions";

import InfoIcon from '@mui/icons-material/Info';

export const LegendsButton = (props) => {
  const map = useMap();

  //refactor stuff for topo button
  const mapState = useSelector(selectMap);
  const dispatch = useDispatch();
  const toolClass = toolStyles();
  const [show, setShow] = React.useState(false);

  const divRef = useRef();
  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);

  if (mapState && map) {
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '57%',
          width: '50px',
          height: '50px'
        }}>
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title="Map Legend"
          placement="left-start">
          <span>
            <IconButton
              onClick={() => {
                dispatch({ type: MAP_TOGGLE_LEGENDS });
              }}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                ' legend ' +
                (mapState?.legendsPopup ? toolClass.selected : toolClass.notSelected)
              }
              sx={{ color: '#000' }}>
              <InfoIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};