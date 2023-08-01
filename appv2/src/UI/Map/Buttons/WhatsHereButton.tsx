import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import * as L from "leaflet";
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useMap, useMapEvent } from "react-leaflet";
import { IconButton, Tooltip } from "@mui/material";
import { toolStyles } from "UI/Styles/ToolStyles";
import { useSelector } from "util/use_selector";
import { selectMap } from "state/reducers/map";
import { selectUserSettings } from "state/reducers/userSettings";
import { MAP_TOGGLE_WHATS_HERE, MAP_WHATS_HERE_FEATURE, TOGGLE_PANEL } from "state/actions";

import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { useHistory } from "react-router";

export const WhatsHereButton = (props) => {
  const map = useMap();
  const history = useHistory();
  const dispatch = useDispatch();
  const mapState = useSelector(selectMap);
  const {darkTheme} = useSelector(selectUserSettings);
  const toolClass = toolStyles();
  const [show, setShow] = React.useState(false);

  const divRef = useRef();
  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);
  if (mapState && mapState?.whatsHere && map) {
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
                dispatch({ type: MAP_TOGGLE_WHATS_HERE, payload: {toggle: !mapState.whatsHere.toggle} });
              }}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                ' ' +
                ((mapState?.whatsHere as any)?.toggle ? toolClass.selected : toolClass.notSelected)
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

  const mapState = useSelector(selectMap);

  useEffect(() => {
    if ((mapState?.whatsHere as any)?.toggle == true && (mapState?.whatsHere as any)?.feature == null) {
      ref.current = new (L as any).Draw.Rectangle(map);
      (ref.current as any).enable();
    }

    return () => {
      if (ref.current) (ref.current as any).disable();
    };
  }, [mapState?.whatsHere]);

  useMapEvent('draw:created' as any, (e) => {
    if ((mapState?.whatsHere as any).toggle && (mapState?.whatsHere as any)?.feature === null) {
      history.push('/WhatsHere');
      dispatch({ type: MAP_WHATS_HERE_FEATURE, payload: { feature: e.layer.toGeoJSON() } });
      dispatch({ type: TOGGLE_PANEL });
    }
  });

  return <></>;
};