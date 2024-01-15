import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as L from 'leaflet';
import { Circle, useMap } from 'react-leaflet';
import { IconButton, Tooltip } from '@mui/material';
import { toolStyles } from 'UI/Styles/ToolStyles';
import { useSelector } from 'util/use_selector';
import { MAP_TOGGLE_ACCURACY } from 'state/actions';
import 'UI/Global.css';

import AttributionIcon from '@mui/icons-material/Attribution';

export const AccuracyToggle = (props) => {
  const dispatch = useDispatch();
  const accuracyToggle = useSelector((state: any) => state.Map?.accuracyToggle);
  const positionTracking = useSelector((state: any) => state.Map?.positionTracking);

  const [show, setShow] = React.useState(false);
  const toolClass = toolStyles(); // Get the classes from the context

  const divRef = useRef();
  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);
  if (!positionTracking) {
    return <></>;
  } else {
    return (
      <div ref={divRef} className="map-btn">
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          classes={{ tooltip: 'toolTip' }}
          title={accuracyToggle ? 'Hide Accuracy' : 'Show Accuracy'}
          placement="top-end">
          <span>
            <IconButton
              onClick={() => {
                dispatch({ type: MAP_TOGGLE_ACCURACY });
              }}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                // toolClass.customHoverFocus +
                ' ' +
                (accuracyToggle ? toolClass.selected : toolClass.notSelected)
              }
              sx={{ color: '#000' }}>
              <AttributionIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  }
};

export const AccuracyMarker = (props) => {
  const map = useMap();
  const accuracyToggle = useSelector((state: any) => state.Map?.accuracyToggle);
  const positionTracking = useSelector((state: any) => state.Map?.positionTracking);
  const userCoords = useSelector((state: any) => state.Map?.userCoords);

  if (map && accuracyToggle && positionTracking && userCoords?.long) {
    return (
      <Circle
        key={'circlekeyforaccuracymarker' + Math.random()}
        opacity={0.2}
        color={'#00FF00'}
        fillColor={'#00FF00'}
        fillOpacity={0.2}
        center={[userCoords.lat, userCoords.long]}
        radius={userCoords.accuracy}
      />
    );
  } else {
    return <></>;
  }
};
