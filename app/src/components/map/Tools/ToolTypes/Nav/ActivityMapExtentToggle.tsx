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
import { ACTIVITY_PAGE_MAP_EXTENT_TOGGLE } from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';

import AssignmentIcon from '@mui/icons-material/Assignment';

export const ActivityMapExtentToggle = (props) => {
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
  if (mapState &&  map) {
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '300px',
          width: '50px',
          height: '40px'
        }}>
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={`Extent Toggle: ${mapState.activityPageMapExtentToggle ? 'Record Extent' : 'Main Map Extent'}`}
          placement="left-start">
          <span>
            <IconButton
              //disabled={startTimer}
              onClick={() => {
                dispatch({ type: ACTIVITY_PAGE_MAP_EXTENT_TOGGLE });
              }}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                ' ' +
                (mapState.activityPageMapExtentToggle ? toolClass.selected : toolClass.notSelected)
              }
              sx={{ color: '#000' }}>
              <AssignmentIcon/>
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};
