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
import { useHistory } from "react-router";

export const LegendsButton = (props) => {
  const map = useMap();
  const history = useHistory();
  const dispatch = useDispatch();
  const divRef = useRef();
  const toolClass = toolStyles();

  const mapState = useSelector(selectMap);
  const [show, setShow] = React.useState(false);

  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);
  
  const toggleLegend = () => {
    if (mapState.legendsPopup) {
      history.goBack();
    } else {
      history.push('/Legend');
    }
    dispatch({type: MAP_TOGGLE_LEGENDS});
  }

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
              onClick={() => {toggleLegend()}}
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