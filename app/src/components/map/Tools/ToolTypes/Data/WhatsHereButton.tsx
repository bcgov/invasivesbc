import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { IconButton, Tooltip } from '@mui/material';
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';
import { MAP_TOGGLE_WHATS_HERE } from 'state/actions';

export const WhatsHereButton = (props) => {
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
  if (mapState && mapState?.whatsHere && map) {
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '230px',
          width: '50px',
          height: '40px'
        }}>
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={`What's here?`}
          placement="left-start">
          <span>
            <IconButton
              //disabled={startTimer}
              onClick={() => {
                dispatch({ type: MAP_TOGGLE_WHATS_HERE });
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
