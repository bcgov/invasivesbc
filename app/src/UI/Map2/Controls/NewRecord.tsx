import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'utils/use_selector';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { OPEN_NEW_RECORD_MENU } from 'state/actions';
import 'UI/Global.css';

export const NewRecord = () => {
  const dispatch = useDispatch();
  const divRef = useRef(null);
  const isAuth = useSelector((state) => state.Auth.authenticated);

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
          placement="top-end"
        >
          <span>
            <IconButton
              className={'button'}
              onClick={() => {
                dispatch(OPEN_NEW_RECORD_MENU());
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
