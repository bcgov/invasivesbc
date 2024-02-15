import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as L from 'leaflet';
import { useMap } from 'react-leaflet';
import { IconButton, Tooltip } from '@mui/material';
//import { toolStyles } from 'UI/Styles/ToolStyles';
import { useSelector } from 'util/use_selector';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { OPEN_NEW_RECORD_MENU } from 'state/actions';
import { useHistory } from 'react-router';
import 'UI/Global.css';

export const NewRecord = (props) => {
  const dispatch = useDispatch();
 // const toolClass = toolStyles();
  const divRef = useRef();
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);

  const [show, setShow] = React.useState(false);

  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);

  if (isAuth) {
    return (
      <div ref={divRef} className="map-btn">
        <Tooltip
          open={show}
          classes={{ tooltip: 'toolTip' }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={`New Record`}
          placement="top-end">
          <span>
            <IconButton
              onClick={() => {
                dispatch({ type: OPEN_NEW_RECORD_MENU });
              }}
              >
              <FiberNewIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};
