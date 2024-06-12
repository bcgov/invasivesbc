import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'utils/use_selector';
import { MAP_TOGGLE_ACCURACY } from 'state/actions';
import 'UI/Global.css';

import AttributionIcon from '@mui/icons-material/Attribution';

export const AccuracyToggle = () => {
  const dispatch = useDispatch();
  const accuracyToggle = useSelector((state) => state.Map.accuracyToggle);
  const positionTracking = useSelector((state) => state.Map.positionTracking);

  const [show, setShow] = React.useState(false);

  const divRef = useRef(null);

  if (!positionTracking) {
    return <></>;
  } else {
    return (
      <div ref={divRef} className={accuracyToggle ? 'map-btn-selected' : 'map-btn'}>
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          classes={{ tooltip: 'toolTip' }}
          title={accuracyToggle ? 'Hide Accuracy' : 'Show Accuracy'}
          placement="top-end"
        >
          <span>
            <IconButton
              className={'button'}
              onClick={() => {
                dispatch(MAP_TOGGLE_ACCURACY());
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

export const AccuracyMarker = () => {
  const accuracyToggle = useSelector((state) => state.Map.accuracyToggle);
  const positionTracking = useSelector((state) => state.Map.positionTracking);
  const userCoords = useSelector((state) => state.Map.userCoords);

  if (accuracyToggle && positionTracking && userCoords?.long) {
    return null;
    // return (
    //   <Circle
    //     key={'circlekeyforaccuracymarker' + Math.random()}
    //     opacity={0.2}
    //     color={'#00FF00'}
    //     fillColor={'#00FF00'}
    //     fillOpacity={0.2}
    //     center={[userCoords.lat, userCoords.long]}
    //     radius={userCoords.accuracy}
    //   />
    // );
  } else {
    return <></>;
  }
};
