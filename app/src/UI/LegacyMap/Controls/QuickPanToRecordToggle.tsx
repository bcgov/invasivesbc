import { IconButton, Tooltip } from '@mui/material';
import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import 'UI/Global.css';
import { TOGGLE_QUICK_PAN_TO_RECORD } from 'state/actions';
import { useSelector } from 'utils/use_selector';

export const QuickPanToRecordToggle = () => {
  const dispatch = useDispatch();
  //  const toolClass = toolStyles();
  const divRef = useRef<HTMLDivElement | null>(null);
  const isAuth = useSelector((state) => state.Auth.authenticated);
  const quickPanToRecord = useSelector((state) => state.Map.quickPanToRecord);

  const [show, setShow] = React.useState(false);

  if (isAuth) {
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
