import { Button, IconButton, Tooltip } from '@mui/material';
import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_BASEMAP } from 'state/actions';
import { useSelector } from 'utils/use_selector';
import 'UI/Global.css';

export const BaseMapToggle = () => {
  const baseMapToggle = useSelector((state) => state.Map.baseMapToggle);
  const dispatch = useDispatch();
  const [show, setShow] = React.useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={divRef} className={baseMapToggle ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title={baseMapToggle ? 'Imagery Map' : 'Topographical Map'}
        placement="top-end"
      >
        <span>
          <Button
            className={'button'}
            onClick={() => {
              dispatch({ type: MAP_TOGGLE_BASEMAP });
            }}
          >
            {baseMapToggle ? 'SAT' : 'TOPO'}
          </Button>
        </span>
      </Tooltip>
    </div>
  );
};
