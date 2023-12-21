import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import * as L from "leaflet";
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useMap, useMapEvent } from "react-leaflet";
import { IconButton, Tooltip } from "@mui/material";
import { toolStyles } from "UI/Styles/ToolStyles";
import { useSelector } from "util/use_selector";
import { MAP_TOGGLE_WHATS_HERE, MAP_WHATS_HERE_FEATURE, TOGGLE_PANEL } from "state/actions";

import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { useHistory } from "react-router";

export const WhatsHereButton = (props) => {
  const map = useMap();
  const dispatch = useDispatch();
  const history = useHistory();
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);
  const darkTheme =  useSelector((state: any) => state.UserSettings?.darkTheme)
  const toolClass = toolStyles();
  const [show, setShow] = React.useState(false);

  const divRef = useRef();
  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);
  if (whatsHere && map) {
    return (
      <div
        ref={divRef}
        className="map-btn">
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={`What's here?`}
          placement="top-end">
          <span>
            <IconButton
              onClick={() => {
                dispatch({ type: MAP_TOGGLE_WHATS_HERE, payload: {toggle: !whatsHere.toggle} });
                if (whatsHere.toggle) {
                  history.goBack();
                }
              }}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                ' ' +
                ((whatsHere as any)?.toggle ? toolClass.selected : toolClass.notSelected)
              }
              sx={{ color: '#000' }}>
              <DocumentScannerIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};


//temporary fix to type is undefined error
(window as any).type = undefined;

export const WhatsHereDrawComponent = (props) => {
  const map = useMap();
  const ref = useRef();
  const dispatch = useDispatch();
  const history = useHistory();
  const whatsHere   = useSelector((state: any) => state.Map?.whatsHere);


  useEffect(() => {
    if ((whatsHere as any)?.toggle == true && (whatsHere as any)?.feature == null) {
      ref.current = new (L as any).Draw.Rectangle(map);
      (ref.current as any).enable();
    }

    return () => {
      if (ref.current) (ref.current as any).disable();
    };
  }, [whatsHere]);

    const panelState = useSelector((state) => state.AppMode.panelOpen)
  useMapEvent('draw:created' as any, (e) => {
    if ((whatsHere as any).toggle && (whatsHere as any)?.feature === null) {
      history.push('/WhatsHere');
      dispatch({ type: MAP_WHATS_HERE_FEATURE, payload: { feature: e.layer.toGeoJSON() } });
      if(!panelState)
      dispatch({ type: TOGGLE_PANEL });
    }
  });

  useMapEvent('click', (e) => {
    if ((whatsHere as any).toggle && (whatsHere as any)?.feature) {
      dispatch({ type: MAP_TOGGLE_WHATS_HERE, payload: {toggle: !whatsHere.toggle} });
      history.goBack();
    }
  });

  return <></>;
};