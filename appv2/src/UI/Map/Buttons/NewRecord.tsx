import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import * as L from "leaflet";
import { useMap } from "react-leaflet";
import { IconButton, Tooltip } from "@mui/material";
import { toolStyles } from "UI/Styles/ToolStyles";
import { useSelector } from "util/use_selector";
import { selectMap } from "state/reducers/map";
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { OPEN_NEW_RECORD_MENU } from "state/actions";
import { useHistory } from "react-router";

export const NewRecord = (props) => {
  const map = useMap();
  const dispatch = useDispatch();
  const toolClass = toolStyles();
  const mapState = useSelector(selectMap);
  const divRef = useRef();
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);
  const history = useHistory();

  const [show, setShow] = React.useState(false);

  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);
  
  if (mapState && !mapState?.baseMapToggle && map && isAuth ) {
    return (
      <div
        ref={divRef}
        className="map-btn">
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={`New Record`}
          placement="top-end">
          <span>
            <IconButton
              onClick={() => {
                dispatch({ type: OPEN_NEW_RECORD_MENU  });
                history.push('/Records/Activity:/form')
              }}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                ' ' +
                toolClass.notSelected
              }
              sx={{ color: '#000' }}>
              <FiberNewIcon/>
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};