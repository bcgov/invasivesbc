import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import 'UI/Global.css';

import { useSelector } from 'utils/use_selector';
import MapActions from 'state/actions/map';
import { GpsFixed, GpsNotFixed, GpsOff } from '@mui/icons-material';
import { MapContext } from '../helpers/components/MapContext';

export const FindMeToggle = () => {
  enum Mode {
    OFF,
    ON,
    FOLLOWING
  }
  // Toggle Redux states on click
  const handleClick = () => {
    if (mode === Mode.ON) {
      dispatch(MapActions.panningOn());
    } else {
      dispatch(MapActions.trackLocationToggle());
    }
    setShow(false);
  };

  const map = useContext(MapContext);
  const dispatch = useDispatch();

  const divRef = useRef<HTMLDivElement | null>(null);

  const positionTracking = useSelector((state) => state.Map?.positionTracking);
  const positionFollowing = useSelector((state) => state.Map?.panned);

  const [show, setShow] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>(Mode.OFF);

  const handleDrag = useCallback(() => {
    if (mode === Mode.FOLLOWING) {
      dispatch(MapActions.panningOff());
    }
  }, [mode]);

  useEffect(() => {
    setMode(
      (() => {
        if (positionTracking && positionFollowing) {
          return Mode.FOLLOWING;
        } else if (positionTracking) {
          return Mode.ON;
        }
        return Mode.OFF;
      })()
    );
  }, [positionTracking, positionFollowing]);

  useEffect(() => {
    if (!map) return;
    map.on('dragstart', handleDrag);
    return () => {
      map.off('dragstart', handleDrag);
    };
  }, [map, handleDrag]);

  return (
    <div ref={divRef} className={positionTracking ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title={
          {
            [Mode.ON]: 'Follow My Location',
            [Mode.OFF]: 'Turn on GPS Tracking',
            [Mode.FOLLOWING]: 'Turn off GPS Tracking'
          }[mode]
        }
        placement="top-end"
      >
        <span>
          <IconButton className={'button'} onClick={handleClick}>
            {
              {
                [Mode.ON]: <GpsNotFixed />,
                [Mode.OFF]: <GpsOff />,
                [Mode.FOLLOWING]: <GpsFixed />
              }[mode]
            }
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
