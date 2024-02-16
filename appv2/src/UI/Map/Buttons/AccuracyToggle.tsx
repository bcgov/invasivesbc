import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as L from 'leaflet';
import { Circle}  from 'react-leaflet';
import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'util/use_selector';
import { MAP_TOGGLE_ACCURACY } from 'state/actions';
import 'UI/Global.css';

import AttributionIcon from '@mui/icons-material/Attribution';

export const AccuracyToggle = (props) => {
  const dispatch = useDispatch();
  const accuracyToggle = useSelector((state: any) => state.Map?.accuracyToggle);
  const positionTracking = useSelector((state: any) => state.Map?.positionTracking);

  const [show, setShow] = React.useState(false);

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
    <div ref={divRef} className={accuracyToggle? "map-btn-selected" : "map-btn"}>
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
              >
              <AttributionIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  }
};

export const AccuracyMarker = (props) => {
  const accuracyToggle = useSelector((state: any) => state.Map?.accuracyToggle);
  const positionTracking = useSelector((state: any) => state.Map?.positionTracking);
  const userCoords = useSelector((state: any) => state.Map?.userCoords);

  //if (map && accuracyToggle && positionTracking && userCoords?.long) {
  if (accuracyToggle && positionTracking && userCoords?.long) {
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
