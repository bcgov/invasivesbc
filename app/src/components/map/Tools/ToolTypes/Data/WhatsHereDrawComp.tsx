import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { IconButton, Tooltip } from '@mui/material';
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';
import { MAP_TOGGLE_WHATS_HERE, MAP_WHATS_HERE_FEATURE } from 'state/actions';

//temporary fix to type is undefined error
(window as any).type = undefined;

export const WhatsHereDrawComponent = (props) => {
  const map = useMap();
  const dispatch = useDispatch();
  const ref = useRef();

  //refactor stuff for topo button
  const mapState = useSelector(selectMap);

  useEffect(() => {
    if ((mapState?.whatsHere as any)?.toggle == true && (mapState?.whatsHere as any)?.feature == null) {
      ref.current = new (L as any).Draw.Rectangle(map);
      ref.current.enable();
    }

    return () => {
      if (ref.current) ref.current.disable();
    };
  }, [mapState?.whatsHere]);

  useMapEvent('draw:created' as any, (e) => {
    if ((mapState?.whatsHere as any).toggle && (mapState?.whatsHere as any)?.feature === null) {
      dispatch({ type: MAP_WHATS_HERE_FEATURE, payload: { feature: e.layer.toGeoJSON() } });
    }
  });

  return <></>;
};
