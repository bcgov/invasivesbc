import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import 'UI/Global.css';
import { useSelector } from 'utils/use_selector';
import MapActions from 'state/actions/map';
import { GpsFixed, GpsNotFixed, GpsOff } from '@mui/icons-material';
import { MapContext } from '../helpers/components/MapContext';
import { MapLibreEvent } from 'maplibre-gl/dist/maplibre-gl-dev';
import { isTracking } from 'utils/geoTrackingHelpers';
import GeoTracking from 'state/actions/geotracking/GeoTracking';

export const FindMeToggle = () => {
  enum Mode {
    OFF,
    ON,
    FOLLOWING
  }
  const MIN_DRAG_IN_PX = 50;

  // Toggle Redux states on click
  const handleClick = () => {
    if (mode === Mode.ON) {
      dispatch(MapActions.panningOn());
    } else {
      if (userIsGeoTracking && mode === Mode.FOLLOWING) {
        dispatch(GeoTracking.stop());
      }
      dispatch(MapActions.trackLocationToggle());
    }
    setShow(false);
  };

  const map = useContext(MapContext);
  const dispatch = useDispatch();
  const divRef = useRef<HTMLDivElement | null>(null);

  const positionTracking = useSelector((state) => state.Map?.positionTracking);
  const positionFollowing = useSelector((state) => state.Map?.panned);
  const userIsGeoTracking: boolean = useSelector((state) => isTracking(state.Map.track_me_draw_geo.status));

  const [show, setShow] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>(Mode.OFF);

  const clientX = useRef<number>(0);
  const clientY = useRef<number>(0);

  const handleDragStart = useCallback(
    (e: MapLibreEvent<DragEvent | TouchEvent>) => {
      if (mode === Mode.FOLLOWING) {
        if ('clientX' in e.originalEvent) {
          clientX.current = e?.originalEvent?.clientX;
          clientY.current = e?.originalEvent?.clientY;
        } else {
          clientX.current = e?.originalEvent.touches[0].clientX;
          clientY.current = e?.originalEvent.touches[0].clientY;
        }
      }
    },
    [mode]
  );
  const handleDrag = (e: MapLibreEvent<DragEvent | TouchEvent>) => {
    if (mode === Mode.FOLLOWING && clientX.current) {
      let deltaX: number;
      let deltaY: number;
      if ('clientX' in e.originalEvent) {
        deltaX = e?.originalEvent.clientX - clientX.current;
        deltaY = e?.originalEvent.clientY - clientY.current;
      } else {
        deltaX = e?.originalEvent.touches[0].clientX - clientX.current;
        deltaY = e?.originalEvent.touches[0].clientY - clientY.current;
      }
      const currentDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (currentDistance > MIN_DRAG_IN_PX) {
        dispatch(MapActions.panningOff());
      }
    }
  };
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
    map.on('dragstart', handleDragStart);
    map.on('drag', handleDrag);
    return () => {
      map.off('dragstart', handleDragStart);
      map.off('drag', handleDrag);
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
