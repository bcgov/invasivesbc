import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import * as L from "leaflet";
import { useMap } from "react-leaflet";
import { IconButton, Tooltip } from "@mui/material";
import { toolStyles } from "UI/Styles/ToolStyles";
import { useSelector } from "util/use_selector";
import { MAP_TOGGLE_LEGENDS, TOGGLE_PANEL } from "state/actions";

import InfoIcon from '@mui/icons-material/Info';
import { useHistory } from "react-router";

export const LegendsButton = (props) => {
  const map = useMap();
  const legendsPopup = useSelector((state: any) => state.Map?.legendsPopup);
  const history = useHistory();
  const dispatch = useDispatch();
  const divRef = useRef();
  const toolClass = toolStyles();

  const [show, setShow] = React.useState(false);

  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);

  const toggleLegend = () => {
    if (legendsPopup) {
      history.goBack();
    } else {
      history.push('/Legend');
    }
    dispatch({type: MAP_TOGGLE_LEGENDS});
    // dispatch({ type: TOGGLE_PANEL });
  }

  if (legendsPopup && map) {
    return (
      <div
        ref={divRef}
        className="map-btn">
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title="Map Legend"
          placement="top-end">
          <span>
            <IconButton
              onClick={() => {toggleLegend()}}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                ' legend ' +
                // (mapState?.legendsPopup ? toolClass.selected : toolClass.notSelected)
                toolClass.notSelected
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