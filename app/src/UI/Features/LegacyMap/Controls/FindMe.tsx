import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import 'UI/Global.css';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import { useSelector } from 'utils/use_selector';
import MapActions from 'state/actions/map';

export const FindMeToggle = () => {
  const positionTracking = useSelector((state) => state.Map?.positionTracking);
  const dispatch = useDispatch();
  /**
   * TrackMeButton
   * @description Component to handle the functionality of the find me button
   * @returns {void}
   */
  const [show, setShow] = React.useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);
  // this is to stop user from clicking it again while things are happening
  return (
    <div ref={divRef} className={positionTracking ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title="Find Me"
        placement="top-end"
      >
        <span>
          <IconButton
            className={'button'}
            onClick={() => {
              setShow(false);
              dispatch(MapActions.trackLocationToggle());
            }}
          >
            <MyLocationIcon />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
