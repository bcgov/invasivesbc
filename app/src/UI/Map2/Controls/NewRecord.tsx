import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'utils/use_selector';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { OPEN_NEW_RECORD_MENU } from 'state/actions';
import 'UI/Global.css';

export const NewRecord = (props) => {
  const dispatch = useDispatch();
  const divRef = useRef();
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);

  const [show, setShow] = React.useState(false);

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
              }}>
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
