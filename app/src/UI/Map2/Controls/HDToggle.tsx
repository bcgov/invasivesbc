import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'util/use_selector';
import { MAP_TOGGLE_HD } from 'state/actions';
import 'UI/Global.css';

import HdIcon from '@mui/icons-material/Hd';
import SdIcon from '@mui/icons-material/Sd';

export const HDToggle = (props) => {
  const dispatch = useDispatch();
  const HDToggle = useSelector((state: any) => state.Map?.HDToggle);
  const divRef = useRef();

  const [show, setShow] = React.useState(false);

  return (
    <div ref={divRef} className={HDToggle ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => {
          setShow(true);
          setTimeout(() => setShow(false), 3000);
        }}
        onMouseLeave={() => setShow(false)}
        title={`Max Zoom Resolution: ${!HDToggle ? 'Low Def' : 'High Def'}`}
        placement="top-end">
        <span>
          <IconButton
            onClick={() => {
              dispatch({ type: MAP_TOGGLE_HD });
            }}
            sx={{ color: '#000' }}>
            {HDToggle ? <HdIcon /> : <SdIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
