import { IconButton, Tooltip } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import 'UI/Global.css';
import { TOGGLE_QUICK_PAN_TO_RECORD } from 'state/actions';
import { useSelector } from 'utils/use_selector';

export const QuickPanToRecordToggle = (props) => {
  const dispatch = useDispatch();
  //  const toolClass = toolStyles();
  const divRef = useRef();
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);
  const quickPanToRecord = useSelector((state: any) => state.Map?.quickPanToRecord);

  const [show, setShow] = React.useState(false);

  if (true && isAuth) {
    return (
      <div ref={divRef} className={quickPanToRecord ? 'map-btn-selected' : 'map-btn'}>
        <Tooltip
          open={show}
          classes={{ tooltip: 'toolTip' }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={`Toggle Quick Pan to Record In Table`}
          placement="top-end"
        >
          <span>
            <IconButton
              className={'button'}
              onClick={() => {
                dispatch({ type: TOGGLE_QUICK_PAN_TO_RECORD });
              }}
            >
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
