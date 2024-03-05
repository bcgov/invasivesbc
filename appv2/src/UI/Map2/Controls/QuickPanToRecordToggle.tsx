import { IconButton, Tooltip } from '@mui/material';
import * as L from 'leaflet';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import 'UI/Global.css';
import { TOGGLE_QUICK_PAN_TO_RECORD } from 'state/actions';
import { useSelector } from 'util/use_selector';

export const QuickPanToRecordToggle = (props) => {
  const dispatch = useDispatch();
  //  const toolClass = toolStyles();
  const divRef = useRef();
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);
  const quickPanToRecord = useSelector((state: any) => state.Map?.quickPanToRecord);

  const [show, setShow] = React.useState(false);

  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);

  if (true && isAuth) {
    return (
      <div ref={divRef} className={quickPanToRecord ? 'map-btn-selected' : 'map-btn'}>
        <Tooltip
          open={show}
          classes={{ tooltip: 'toolTip' }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={`Toggle Quick Pan to Record In Table`}
          placement="top-end">
          <span>
            <IconButton
              onClick={() => {
                dispatch({ type: TOGGLE_QUICK_PAN_TO_RECORD });
              }}>
              <PlaylistPlayIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};
