import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'util/use_selector';
import { MAP_TOGGLE_WHATS_HERE, MAP_WHATS_HERE_FEATURE, TOGGLE_PANEL } from 'state/actions';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';

import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { useHistory } from 'react-router';
import 'UI/Global.css';

export const WhatsHereButton = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);
  const darkTheme = useSelector((state: any) => state.UserSettings?.darkTheme);
  const [show, setShow] = React.useState(false);

  const divRef = useRef();
  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);
  //if (whatsHere && map) {
  if (whatsHere) {
    return (
    <div ref={divRef} className={(whatsHere as any)?.toggle? "map-btn-selected" : "map-btn"}>
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          classes={{ tooltip: 'toolTip' }}
          title={`What's here?`}
          placement="top-end">
          <span>
            <IconButton
              onClick={() => {
                if ((whatsHere as any)?.toggle == false) {
                  dispatch({ type: MAP_TOGGLE_WHATS_HERE });
                } else {
                  history.goBack();
                }
              }}
              >
              {(whatsHere as any)?.loadingActivities || (whatsHere as any)?.loadingIAPP ? <HourglassTopIcon /> : <></>}
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
  const ref = useRef();
  const dispatch = useDispatch();
  const history = useHistory();
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);

  useEffect(() => {
    if ((whatsHere as any)?.toggle == true && (whatsHere as any)?.feature == null) {
//      ref.current = new (L as any).Draw.Rectangle(map);
 //     (ref.current as any).enable();
    }

    return () => {
      if (ref.current) (ref.current as any).disable();
    };
  }, [whatsHere]);

  /*
  useMapEvent('draw:created' as any, (e) => {
    if ((whatsHere as any).toggle && (whatsHere as any)?.feature === null) {
      history.push('/WhatsHere');
      dispatch({ type: MAP_WHATS_HERE_FEATURE, payload: { feature: e.layer.toGeoJSON() } });
    }
  });
  */

  return <></>;
};
