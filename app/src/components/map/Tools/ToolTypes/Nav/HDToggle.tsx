import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import HdIcon from '@mui/icons-material/Hd';
import SdIcon from '@mui/icons-material/Sd';
import { IconButton, Tooltip } from '@mui/material';
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_HD } from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';
import { selectUserSettings } from 'state/reducers/userSettings';

export const HDToggle = (props) => {
  const map = useMap();

  //refactor stuff for topo button
  const mapState = useSelector(selectMap);
  const {darkTheme} = useSelector(selectUserSettings);
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
  if (mapState && !mapState?.baseMapToggle && map) {
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
          title={`Max Zoom Resolution: ${mapState.HDToggle ? 'Low Def' : 'High Def'}`}
          placement="left-start">
          <span>
            <IconButton
              //disabled={startTimer}
              onClick={() => {
                dispatch({ type: MAP_TOGGLE_HD });
              }}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                ' ' +
                (mapState.HDToggle ? toolClass.selected : (darkTheme? toolClass.notSelectedDark : toolClass.notSelected))
              }
              sx={{ color: '#000' }}>
              {mapState.HDToggle ? <HdIcon /> : <SdIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};
